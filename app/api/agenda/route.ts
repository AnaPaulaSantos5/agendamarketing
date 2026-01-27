import { GoogleSpreadsheet } from 'google-spreadsheet'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const doc = new GoogleSpreadsheet(
      process.env.GOOGLE_SHEET_ID!,
      {
        clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
        privateKey: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      } as any // 👈 ISSO É A CHAVE
    )

    await doc.loadInfo()

    return NextResponse.json({
      title: doc.title,
      sheets: doc.sheetsByIndex.map(s => s.title),
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}