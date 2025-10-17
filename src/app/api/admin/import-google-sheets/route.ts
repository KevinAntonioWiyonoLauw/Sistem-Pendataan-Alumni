import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { google } from 'googleapis'
import type { Alumnus } from '@/payload-types'

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID
const RANGE = 'Form Responses 1!A:R'
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')

interface ImportResults {
  processed: number
  created: number
  updated: number
  errors: string[]
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
  position: string
  workField: string
  contactPersonReady: string
  alumniOfficerReady: string
  otherContacts: string
  willingToHelp: string
  helpTopics: string
  suggestions: string
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

const WORK_FIELD_MAPPING: Record<string, string> = {
  'teknologi/it': 'teknologi',
  teknologi: 'teknologi',
  it: 'teknologi',
  akademisi: 'akademisi',
  pemerintah: 'pemerintah',
  'lembaga pemerintah': 'lembaga-pemerintah',
  'lembaga-pemerintah': 'lembaga-pemerintah',
  wirausaha: 'wirausaha',
  swasta: 'swasta',
  konsultan: 'konsultan',
  'keuangan/perbankan': 'keuangan',
  keuangan: 'keuangan',
  perbankan: 'keuangan',
  'media/komunikasi': 'media',
  media: 'media',
  komunikasi: 'media',
  kesehatan: 'kesehatan',
  pendidikan: 'pendidikan',
  'non-profit/lsm': 'nonprofit',
  nonprofit: 'nonprofit',
  lsm: 'nonprofit',
  lainnya: 'lainnya',
}

const HELP_TYPE_MAPPING: Record<string, string> = {
  'mentoring career': 'mentoring-career',
  'mentoring-career': 'mentoring-career',
  'kesempatan magang/riset': 'magang-riset',
  'magang/riset': 'magang-riset',
  'magang-riset': 'magang-riset',
  'sharing beasiswa/studi lanjut': 'beasiswa-studi',
  'beasiswa/studi lanjut': 'beasiswa-studi',
  'beasiswa-studi': 'beasiswa-studi',
  'networking professional': 'networking',
  networking: 'networking',
}

async function verifyAdminAuth(request: NextRequest): Promise<boolean> {
  try {
    const payload = await getPayload({ config: configPromise })

    const payloadToken = request.cookies.get('payload-token')?.value

    if (!payloadToken) {
      console.log('No payload token found')
      return false
    }

    const user = await payload.auth({ headers: request.headers })

    if (!user?.user) {
      console.log('No user found in token')
      return false
    }

    const isAdmin = user.user.roles?.includes('admin') || user.user.collection === 'users'

    console.log(`User auth check: ${user.user.email || 'unknown'}, isAdmin: ${isAdmin}`)

    return isAdmin
  } catch (error) {
    console.error('Auth verification error:', error)
    return false
  }
}

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

function parseMultipleValues(value: string, mapping: Record<string, string>): string[] {
  if (!value) return []

  return value
    .split(',')
    .map((v) => v.trim().toLowerCase())
    .filter((v) => v !== '')
    .map((v) => mapping[v] || v)
    .filter((v) => Object.values(mapping).includes(v))
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
    position: (row[10] || '').trim(),
    workField: (row[11] || '').trim(),
    contactPersonReady: (row[12] || '').trim(),
    alumniOfficerReady: (row[13] || '').trim(),
    otherContacts: (row[14] || '').trim(),
    willingToHelp: (row[15] || '').trim(),
    helpTopics: (row[16] || '').trim(),
    suggestions: (row[17] || '').trim(),
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAuthorized = await verifyAdminAuth(request)

    if (!isAuthorized) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Admin access required',
        },
        { status: 401 },
      )
    }

    const payload = await getPayload({ config: configPromise })

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

        if (!rowData.currentEmployer || !rowData.position) {
          results.errors.push(`Missing work info for: ${rowData.name}`)
          continue
        }

        if (!rowData.contactPersonReady || !rowData.alumniOfficerReady) {
          results.errors.push(`Missing jejaring info for: ${rowData.name}`)
          continue
        }

        const existingAlumni = existingAlumniCache.get(rowData.email)

        const workFields = parseMultipleValues(rowData.workField, WORK_FIELD_MAPPING) as Array<
          (typeof VALID_WORK_FIELDS)[number]
        >

        const helpTypes = parseMultipleValues(rowData.willingToHelp, HELP_TYPE_MAPPING) as Array<
          (typeof VALID_HELP_TYPES)[number]
        >

        if (workFields.length === 0 && rowData.workField) {
          workFields.push('lainnya')
        }

        if (workFields.length === 0) {
          workFields.push('lainnya')
        }

        console.log(`Work fields mapped: ${rowData.workField} -> ${workFields.join(', ')}`)
        console.log(`Help types mapped: ${rowData.willingToHelp} -> ${helpTypes.join(', ')}`)

        const alumniData = {
          name: rowData.name,
          batch: parseInt(rowData.batch) || new Date().getFullYear(),
          nim: rowData.nim || undefined,

          kontak: {
            location: {
              city: rowData.city || 'Unknown',
              country: rowData.country || 'Indonesia',
            },
            phone: rowData.phone || '',
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
        console.error('Full error:', error)
      }
    }

    existingAlumniCache.clear()

    const summary = {
      success: true,
      results,
      summary: {
        totalRows: validRows.length,
        successRate: `${((results.processed / validRows.length) * 100).toFixed(1)}%`,
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

export async function GET(request: NextRequest) {
  try {
    const isAuthorized = await verifyAdminAuth(request)

    if (!isAuthorized) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Admin access required for API testing',
        },
        { status: 401 },
      )
    }

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
      'Kota Domisili',
      'Negara',
      'Akun LinkedIn (Opsional)',
      'Nama Perusahaan/Instansi',
      'Posisi/Jabatan Saat Ini',
      'Bidang Pekerjaan Utama',
      'Apakah bersedia menjadi contact person angkatan?',
      'Apakah bersedia menjadi pengurus alumni?',
      'Contact person lain di angkatanmu yang bisa dihubungi (Opsional)',
      'Apakah bersedia dihubungi oleh mahasiswa untuk:',
      'Topik yang bisa dibantu/dibagikan (Opsional)',
      'Saran/harapan untuk kegiatan alumni ke depan (Opsional)',
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
      note: 'Updated for new alumni structure without photo functionality',
      validWorkFields: VALID_WORK_FIELDS,
      validHelpTypes: VALID_HELP_TYPES,
      workFieldMapping: WORK_FIELD_MAPPING,
      helpTypeMapping: HELP_TYPE_MAPPING,
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
