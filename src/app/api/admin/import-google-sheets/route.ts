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
  email: string
  phone: string
  currentStatus: string
  institution: string
  position: string
  location: string
  linkedin: string
  website: string
  photoUrl: string
}

interface AlumniCreateData {
  name: string
  batch: number
  email: string
  phone?: string | null
  currentStatus: NonNullable<Alumnus['currentStatus']>
  institution?: string | null
  position?: string | null
  location: {
    city?: string | null
    country: string
  }
  linkedin?: string | null
  website?: string | null
  photo?: number | null
  source: 'google-forms'
  googleFormsId?: string
  isPublic: boolean
}

interface AlumniUpdateData {
  name?: string
  batch?: number
  email?: string
  phone?: string | null
  currentStatus?: NonNullable<Alumnus['currentStatus']>
  institution?: string | null
  position?: string | null
  location?: {
    city?: string | null
    country: string
  }
  linkedin?: string | null
  website?: string | null
  photo?: number | null
  source?: 'google-forms'
  googleFormsId?: string
  isPublic?: boolean
}

const existingAlumniCache = new Map<string, Alumnus>()

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

    console.log('Extracted file ID:', fileId)

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

    const sharpImage = sharp(buffer)
    const metadata = await sharpImage.metadata()

    console.log(`Processing ${metadata.format} image (${metadata.width}x${metadata.height})`)

    const processedBuffer = await sharpImage
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

function mapStatus(status: string): NonNullable<Alumnus['currentStatus']> {
  const statusMap: Record<string, NonNullable<Alumnus['currentStatus']>> = {
    Bekerja: 'working',
    'Studi Lanjut': 'studying',
    Wirausaha: 'entrepreneur',
    'Belum Bekerja': 'job-seeking',
    Freelancer: 'freelancer',
    Lainnya: 'other',
  }
  return statusMap[status] || 'job-seeking'
}

function parseLocation(location: string): { city: string | null; country: string } {
  if (!location) return { city: null, country: 'Indonesia' }
  const [city, country] = location.split(',').map((s) => s.trim())
  return { city: city || null, country: country || 'Indonesia' }
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function parseSpreadsheetRow(row: string[]): SpreadsheetRow {
  return {
    timestamp: row[0] || '',
    name: (row[1] || '').trim(),
    batch: row[2] || '',
    email: (row[3] || '').trim(),
    phone: (row[4] || '').trim(),
    currentStatus: (row[5] || '').trim(),
    institution: (row[6] || '').trim(),
    position: (row[7] || '').trim(),
    location: (row[8] || '').trim(),
    linkedin: (row[9] || '').trim(),
    website: (row[10] || '').trim(),
    photoUrl: (row[11] || '').trim(),
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
      .map((row) => (row[3] || '').trim())
      .filter((email) => email && validateEmail(email))

    const existingAlumni = await payload.find({
      collection: 'alumni',
      where: {
        email: { in: emails },
      },
      limit: emails.length,
    })

    existingAlumniCache.clear()
    existingAlumni.docs.forEach((alumni) => {
      existingAlumniCache.set(alumni.email, alumni)
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

        const existingAlumni = existingAlumniCache.get(rowData.email)

        let existingPhotoId: number | null = null
        if (existingAlumni?.photo) {
          if (typeof existingAlumni.photo === 'number') {
            existingPhotoId = existingAlumni.photo
          } else if (typeof existingAlumni.photo === 'object' && existingAlumni.photo.id) {
            existingPhotoId = existingAlumni.photo.id
          }
        }

        let photoId: number | null = existingPhotoId

        if (
          rowData.photoUrl &&
          (rowData.photoUrl.includes('drive.google.com') ||
            rowData.photoUrl.includes('docs.google.com'))
        ) {
          if (existingPhotoId) {
            console.log(`📸 Photo exists (ID: ${existingPhotoId}), skipping`)
            photoId = existingPhotoId
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
        } else if (!rowData.photoUrl) {
          console.log(`⏭️ No photo URL`)
        }

        const { city, country } = parseLocation(rowData.location)

        if (existingAlumni) {
          const updateData: AlumniUpdateData = {
            name: rowData.name,
            batch: parseInt(rowData.batch) || new Date().getFullYear(),
            email: rowData.email,
            phone: rowData.phone || null,
            currentStatus: mapStatus(rowData.currentStatus),
            institution: rowData.institution || null,
            position: rowData.position || null,
            location: { city, country },
            linkedin: rowData.linkedin || null,
            website: rowData.website || null,
            photo: photoId,
            source: 'google-forms',
            googleFormsId: rowData.timestamp,
            isPublic: true,
          }

          await payload.update({
            collection: 'alumni',
            id: existingAlumni.id,
            data: updateData,
          })
          results.updated++
          console.log(`✅ Updated: ${rowData.name}`)
        } else {
          const createData: AlumniCreateData = {
            name: rowData.name,
            batch: parseInt(rowData.batch) || new Date().getFullYear(),
            email: rowData.email,
            phone: rowData.phone || null,
            currentStatus: mapStatus(rowData.currentStatus),
            institution: rowData.institution || null,
            position: rowData.position || null,
            location: { city, country },
            linkedin: rowData.linkedin || null,
            website: rowData.website || null,
            photo: photoId,
            source: 'google-forms',
            googleFormsId: rowData.timestamp,
            isPublic: true,
          }

          const newAlumni = (await payload.create({
            collection: 'alumni',
            data: createData,
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
    const sampleData =
      values.length > 0
        ? {
            range: RANGE,
            totalRows: values.length,
            headers: values[0],
            sampleRow: values[1] || null,
          }
        : null

    return NextResponse.json({
      message: 'Google Sheets Import API - Connection Test',
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      serviceAccount: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      availableSheets,
      sampleData,
      endpoint: 'POST /api/admin/import-google-sheets',
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
