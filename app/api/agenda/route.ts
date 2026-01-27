import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const auth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file',
      ],
    })

    const doc = new GoogleSpreadsheet(
      process.env.GOOGLE_SHEET_ID!,
      auth
    )

    await doc.loadInfo()

    return NextResponse.json({
      title: doc.title,
      sheetCount: doc.sheetCount,
    })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}