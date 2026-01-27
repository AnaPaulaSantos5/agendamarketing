import { NextResponse } from 'next/server'
import { GoogleSpreadsheet } from 'google-spreadsheet'

export async function GET() {
  try {
    const doc = new GoogleSpreadsheet(
      process.env.GOOGLE_SHEET_ID!,
      {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
        private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      }
    )

    await doc.loadInfo()
    const sheet = doc.sheetsByTitle['Agenda']

    if (!sheet) {
      return NextResponse.json(
        { error: 'Aba Agenda não encontrada' },
        { status: 400 }
      )
    }

    const rows = await sheet.getRows()

    const agenda = rows.map(row => ({
      data: row.get('Data'),
      conteudoPrincipal: row.get('Conteudo_Principal'),
      conteudoSecundario: row.get('Conteudo_Secundario'),
      tipo: row.get('Tipo'),
      link: row.get('Link_Arquivo'),
      alternativa: row.get('Alternativa_Pronta'),
      cta: row.get('CTA_WhatsApp'),
      status: row.get('Status_Postagem'),
    }))

    return NextResponse.json({ agenda })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}