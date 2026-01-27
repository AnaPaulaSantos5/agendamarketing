import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const auth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })

    const doc = new GoogleSpreadsheet(
      process.env.GOOGLE_SHEET_ID!,
      auth
    )

    await doc.loadInfo()
    const sheet = doc.sheetsByIndex[0]
    const rows = await sheet.getRows()

    return NextResponse.json(rows)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}