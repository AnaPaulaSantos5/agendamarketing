import { GoogleSpreadsheet } from 'google-spreadsheet'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const doc = new GoogleSpreadsheet(
      process.env.GOOGLE_SHEET_ID!,
      {
        clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
        privateKey: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      }
    )

    // ESSENCIAL NA V5
    await doc.loadInfo()

    return NextResponse.json({
      title: doc.title,
      sheetCount: doc.sheetCount,
      sheets: doc.sheetsByIndex.map(s => s.title),
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    )
  }
}