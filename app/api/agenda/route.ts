import { GoogleSpreadsheet } from 'google-spreadsheet'

export async function GET() {
  try {
    const creds = JSON.parse(
      Buffer.from(
        process.env.GOOGLE_SERVICE_ACCOUNT_BASE64!,
        'base64'
      ).toString('utf-8')
    )

    const doc = new GoogleSpreadsheet(
      process.env.GOOGLE_SHEET_ID!,
      {
        clientEmail: creds.client_email,
        privateKey: creds.private_key,
      } as any
    )

    await doc.loadInfo()

    return Response.json({
      ok: true,
      title: doc.title,
    })
  } catch (err: any) {
    return Response.json(
      { error: err.message },
      { status: 500 }
    )
  }
}