import { GoogleSpreadsheet } from 'google-spreadsheet'
import { GoogleAuth } from 'google-auth-library'

export async function GET() {
  try {
    const auth = new GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const doc = new GoogleSpreadsheet(
      process.env.GOOGLE_SHEET_ID!,
      auth
    )

    await doc.loadInfo()

    return Response.json({
      title: doc.title,
      sheetCount: doc.sheetCount,
      sheets: doc.sheetsByIndex.map(s => s.title),
    })
  } catch (error: any) {
    console.error(error)
    return Response.json(
      { error: error.message },
      { status: 500 }
    )
  }
}