import { GoogleSpreadsheet } from 'google-spreadsheet';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const doc = new GoogleSpreadsheet(
      process.env.GOOGLE_SHEET_ID!
    );

    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
      private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    });

    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    return NextResponse.json(rows.map(r => r.toObject()));
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}