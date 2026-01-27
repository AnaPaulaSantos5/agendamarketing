import { GoogleSpreadsheet } from 'google-spreadsheet'

const creds = JSON.parse(
  Buffer.from(
    process.env.GOOGLE_SERVICE_ACCOUNT_BASE64!,
    'base64'
  ).toString('utf-8')
)

export async function GET() {
  try {
    const doc = new GoogleSpreadsheet(
      process.env.GOOGLE_SHEET_ID!,
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