import { NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import { google } from 'googleapis'
import sharp from 'sharp'
import type { Payload } from 'payload'
import type { Media, Alumnus } from '@/payload-types'

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID
const RANGE = 'Form Responses 1!A:Z'
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')

interface ImportResults {
  processed: number
  created: number
  updated: number
  errors: string[]
  photoResults: {
    success: number
    failed: number
    skipped: number
    downloaded: number
  }
}

interface SpreadsheetRow {
  timestamp: string
  name: string
  batch: string
  nim: string
  email: string
  phone: string
  city: string
  country: string
  linkedin: string
  currentEmployer: string
  workField: string
  position: string
  contactPersonReady: string
  alumniOfficerReady: string
  otherContacts: string
  willingToHelp: string
  helpTopics: string
  suggestions: string
  photoUrl: string
}

const existingAlumniCache = new Map<string, Alumnus>()

const VALID_WORK_FIELDS = [
  'akademisi',
  'pemerintah',
  'lembaga-pemerintah',
  'wirausaha',
  'swasta',
  'konsultan',
  'teknologi',
  'keuangan',
  'media',
  'kesehatan',
  'pendidikan',
  'nonprofit',
  'lainnya',
] as const

const VALID_HELP_TYPES = [
  'mentoring-career',
  'magang-riset',
  'beasiswa-studi',
  'networking',
] as const

async function getGoogleSheetsData(): Promise<string[][]> {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: SERVICE_ACCOUNT_EMAIL,
      private_key: PRIVATE_KEY,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  })

  const sheets = google.sheets({ version: 'v4', auth })

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
  })

  return response.data.values || []
}

async function downloadImageFromDrive(
  driveUrl: string,
  name: string,
  payload: Payload,
): Promise<number | null> {
  try {
    console.log(`📥 Downloading new photo for ${name}...`)

    let fileId: string | null = null
    const openMatch = driveUrl.match(/id=([a-zA-Z0-9-_]+)/)
    if (openMatch) {
      fileId = openMatch[1]
    } else {
      const fileMatch = driveUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)
      if (fileMatch) {
        fileId = fileMatch[1]
      }
    }

    if (!fileId) {
      console.log('Could not extract file ID from URL:', driveUrl)
      return null
    }

    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`

    const response = await fetch(downloadUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'image/*',
      },
    })

    if (!response.ok) {
      console.log(`Failed to download image: ${response.status}`)
      return null
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    if (buffer.length === 0) {
      console.log('Downloaded empty file')
      return null
    }

    const processedBuffer = await sharp(buffer)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({
        quality: 85,
        progressive: true,
      })
      .toBuffer()

    const filename = `${name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.jpg`

    const media = (await payload.create({
      collection: 'media',
      data: {
        alt: `Foto profil ${name}`,
      },
      file: {
        data: processedBuffer,
        mimetype: 'image/jpeg',
        name: filename,
        size: processedBuffer.length,
      },
    })) as Media

    console.log('✅ Successfully uploaded image - Media ID:', media.id)
    return media.id
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Error processing image:', errorMessage)
    return null
  }
}

function parseMultipleValues(value: string, validOptions: readonly string[]): string[] {
  if (!value) return []
  return value
    .split(',')
    .map((v) => v.trim().toLowerCase())
    .filter((v) => v !== '' && validOptions.includes(v as any))
}

function parseYesNo(value: string): 'ya' | 'tidak' {
  const cleanValue = value.toLowerCase().trim()
  return cleanValue === 'ya' || cleanValue === 'yes' ? 'ya' : 'tidak'
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function parseSpreadsheetRow(row: string[]): SpreadsheetRow {
  return {
    timestamp: row[0] || '',
    name: (row[1] || '').trim(),
    batch: (row[2] || '').trim(),
    nim: (row[3] || '').trim(),
    email: (row[4] || '').trim(),
    phone: (row[5] || '').trim(),
    city: (row[6] || '').trim(),
    country: (row[7] || '').trim(),
    linkedin: (row[8] || '').trim(),
    currentEmployer: (row[9] || '').trim(),
    workField: (row[10] || '').trim(),
    position: (row[11] || '').trim(),
    contactPersonReady: (row[12] || '').trim(),
    alumniOfficerReady: (row[13] || '').trim(),
    otherContacts: (row[14] || '').trim(),
    willingToHelp: (row[15] || '').trim(),
    helpTopics: (row[16] || '').trim(),
    suggestions: (row[17] || '').trim(),
    photoUrl: (row[18] || '').trim(),
  }
}

export async function POST() {
  try {
    const payload = await getPayloadHMR({ config: configPromise })

    const rows = await getGoogleSheetsData()

    if (rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No data found in spreadsheet',
      })
    }

    const results: ImportResults = {
      processed: 0,
      created: 0,
      updated: 0,
      errors: [],
      photoResults: {
        success: 0,
        failed: 0,
        skipped: 0,
        downloaded: 0,
      },
    }

    const dataRows = rows.slice(1)
    const validRows = dataRows.filter((row) => row && row.length > 0)

    console.log(`Starting import of ${validRows.length} alumni records...`)

    const emails = validRows
      .map((row) => (row[4] || '').trim())
      .filter((email) => email && validateEmail(email))

    const existingAlumni = await payload.find({
      collection: 'alumni',
      where: {
        'kontak.email': { in: emails },
      },
      limit: emails.length,
    })

    existingAlumniCache.clear()
    existingAlumni.docs.forEach((alumni) => {
      existingAlumniCache.set(alumni.kontak.email, alumni)
    })

    console.log(`Found ${existingAlumni.docs.length} existing alumni in database`)

    for (const row of validRows) {
      try {
        const rowData = parseSpreadsheetRow(row)

        console.log(`\nProcessing ${results.processed + 1}/${validRows.length}: ${rowData.name}`)

        if (!rowData.name || !rowData.email || !rowData.batch) {
          results.errors.push(
            `Skipped: Missing required fields - ${rowData.name || rowData.email || 'Unknown'}`,
          )
          continue
        }

        if (!validateEmail(rowData.email)) {
          results.errors.push(`Invalid email format: ${rowData.email}`)
          continue
        }

        if (!rowData.currentEmployer || !rowData.position || !rowData.workField) {
          results.errors.push(`Missing work info for: ${rowData.name}`)
          continue
        }

        if (!rowData.contactPersonReady || !rowData.alumniOfficerReady) {
          results.errors.push(`Missing jejaring info for: ${rowData.name}`)
          continue
        }

        const existingAlumni = existingAlumniCache.get(rowData.email)

        let photoId: number | undefined = undefined
        if (existingAlumni?.metadata?.photo) {
          photoId =
            typeof existingAlumni.metadata.photo === 'number'
              ? existingAlumni.metadata.photo
              : existingAlumni.metadata.photo.id
        }

        if (
          rowData.photoUrl &&
          (rowData.photoUrl.includes('drive.google.com') ||
            rowData.photoUrl.includes('docs.google.com'))
        ) {
          if (photoId) {
            console.log(`📸 Photo exists (ID: ${photoId}), skipping`)
            results.photoResults.skipped++
            results.photoResults.success++
          } else {
            console.log(`📸 Downloading photo...`)
            const newPhotoId = await downloadImageFromDrive(rowData.photoUrl, rowData.name, payload)
            if (newPhotoId) {
              photoId = newPhotoId
              results.photoResults.downloaded++
              results.photoResults.success++
              console.log(`✅ Photo downloaded`)
            } else {
              console.log(`❌ Photo download failed`)
              results.photoResults.failed++
            }
          }
        }

        const workFields = parseMultipleValues(rowData.workField, VALID_WORK_FIELDS) as Array<
          (typeof VALID_WORK_FIELDS)[number]
        >
        const helpTypes = parseMultipleValues(rowData.willingToHelp, VALID_HELP_TYPES) as Array<
          (typeof VALID_HELP_TYPES)[number]
        >

        const alumniData = {
          name: rowData.name,
          batch: parseInt(rowData.batch) || new Date().getFullYear(),
          nim: rowData.nim || undefined,

          kontak: {
            location: {
              city: rowData.city || 'Unknown',
              country: rowData.country || 'Indonesia',
            },
            phone: rowData.phone,
            email: rowData.email.toLowerCase(),
            linkedin: rowData.linkedin || undefined,
          },

          pekerjaan: {
            currentEmployer: rowData.currentEmployer,
            workField: workFields,
            position: rowData.position,
          },

          jejaring: {
            contactPersonReady: parseYesNo(rowData.contactPersonReady),
            alumniOfficerReady: parseYesNo(rowData.alumniOfficerReady),
            otherContacts: rowData.otherContacts || undefined,
          },

          kontribusi: {
            willingToHelp: helpTypes,
            helpTopics: rowData.helpTopics || undefined,
          },

          lainnya: {
            suggestions: rowData.suggestions || undefined,
          },

          metadata: {
            photo: photoId,
            isPublic: true,
            source: 'google-forms' as const,
            googleFormsId: rowData.timestamp,
          },
        }

        if (existingAlumni) {
          await payload.update({
            collection: 'alumni',
            id: existingAlumni.id,
            data: alumniData,
          })
          results.updated++
          console.log(`✅ Updated: ${rowData.name}`)
        } else {
          const newAlumni = (await payload.create({
            collection: 'alumni',
            data: alumniData,
          })) as Alumnus

          existingAlumniCache.set(rowData.email, newAlumni)
          results.created++
          console.log(`✅ Created: ${rowData.name}`)
        }

        results.processed++
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        const rowInfo = row[1] || `Row ${results.processed + 1}`
        results.errors.push(`Error processing ${rowInfo}: ${errorMessage}`)
        console.error('Row processing error:', error)
      }
    }

    existingAlumniCache.clear()

    const summary = {
      success: true,
      results,
      summary: {
        totalRows: validRows.length,
        successRate: `${((results.processed / validRows.length) * 100).toFixed(1)}%`,
        photoEfficiency:
          results.photoResults.skipped > 0
            ? `Saved ${results.photoResults.skipped} downloads`
            : 'All new downloads',
      },
    }

    console.log('\n✅ Import completed!', summary)
    return NextResponse.json(summary)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Import error:', error)
    return NextResponse.json(
      { error: 'Failed to import data', details: errorMessage },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })

    const sheets = google.sheets({ version: 'v4', auth })

    const [spreadsheetInfo, valuesResponse] = await Promise.all([
      sheets.spreadsheets.get({ spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID }),
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
        range: RANGE,
      }),
    ])

    const availableSheets = spreadsheetInfo.data.sheets?.map((sheet) => ({
      title: sheet.properties?.title,
      sheetId: sheet.properties?.sheetId,
      gridProperties: sheet.properties?.gridProperties,
    }))

    const values = valuesResponse.data.values || []

    const expectedHeaders = [
      'Timestamp',
      'Nama Lengkap',
      'Tahun Masuk (Angkatan)',
      'NIM (Opsional)',
      'Email Aktif',
      'Nomor HP/WA Aktif',
      'Domisili Kota',
      'Domisili Negara',
      'Akun LinkedIn',
      'Nama Perusahaan/Instansi',
      'Bidang Pekerjaan Utama',
      'Posisi/Jabatan Saat Ini',
      'Contact Person Angkatan',
      'Pengurus Alumni',
      'Contact Person Lain',
      'Bersedia Membantu Mahasiswa',
      'Topik Bantuan',
      'Saran/Harapan Alumni',
      'Foto Profil (URL)',
    ]

    const sampleData =
      values.length > 0
        ? {
            range: RANGE,
            totalRows: values.length,
            headers: values[0],
            expectedHeaders,
            sampleRow: values[1] || null,
            headerMapping: values[0]?.map((header: string, index: number) => ({
              column: index,
              actual: header,
              expected: expectedHeaders[index] || 'Extra column',
            })),
          }
        : null

    return NextResponse.json({
      message: 'Google Sheets Import API - Connection Test (Updated Structure)',
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      serviceAccount: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      availableSheets,
      sampleData,
      endpoint: 'POST /api/admin/import-google-sheets',
      note: 'Updated for new alumni structure with groups',
      validWorkFields: VALID_WORK_FIELDS,
      validHelpTypes: VALID_HELP_TYPES,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      {
        error: 'Connection test failed',
        details: errorMessage,
        spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
        serviceAccount: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      },
      { status: 500 },
    )
  }
}
