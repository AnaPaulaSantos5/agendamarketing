import { GoogleSpreadsheet } from 'google-spreadsheet'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const SHEET_ID = process.env.GOOGLE_SHEET_ID!

    const doc = new GoogleSpreadsheet(
      SHEET_ID,
      {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
        private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      }
    )

    // carrega metadados da planilha
    await doc.loadInfo()

    return NextResponse.json({
      title: doc.title,
      sheets: doc.sheetCount,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}