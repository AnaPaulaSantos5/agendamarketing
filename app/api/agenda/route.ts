import { GoogleSpreadsheet } from 'google-spreadsheet'

export async function GET() {
  try {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_BASE64) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_BASE64 não definida')
    }

    if (!process.env.GOOGLE_SHEET_ID) {
      throw new Error('GOOGLE_SHEET_ID não definido')
    }

    const creds = JSON.parse(
      Buffer.from(
        process.env.GOOGLE_SERVICE_ACCOUNT_BASE64,
        'base64'
      ).toString('utf-8')
    )

    const doc = new GoogleSpreadsheet(
      process.env.GOOGLE_SHEET_ID,
      {
        clientEmail: creds.client_email,
        privateKey: creds.private_key,
      } as any
    )

    await doc.loadInfo()

    return Response.json({
      title: doc.title,
    })
  } catch (err: any) {
    return Response.json(
      { error: err.message },
      { status: 500 }
    )
  }
}