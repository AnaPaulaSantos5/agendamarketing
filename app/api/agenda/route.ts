import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'

export async function GET() {
  try {
    const auth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const doc = new GoogleSpreadsheet(
      process.env.GOOGLE_SHEET_ID!,
      auth
    )

    await doc.loadInfo()

    return Response.json({
      title: doc.title,
      sheets: doc.sheetCount,
    })
  } catch (err: any) {
    console.error(err)
    return Response.json(
      { error: err.message },
      { status: 500 }
    )
  }
}