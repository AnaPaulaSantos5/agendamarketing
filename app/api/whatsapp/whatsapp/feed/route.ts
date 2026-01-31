import { NextResponse } from 'next/server'
import { GoogleSpreadsheet } from 'google-spreadsheet'

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!)

async function getSheet() {
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  })

  await doc.loadInfo()
  return doc.sheetsByTitle['WhatsApp_Feed']
}

export async function GET() {
  try {
    const sheet = await getSheet()
    const rows = await sheet.getRows()

    const feed = rows.map(r => ({
      data: r.Data,
      tipo: r.Tipo,
      nome: r.Nome,
      telefone: r.Telefone,
      evento: r.Evento,
      mensagem: r.Mensagem,
    }))

    return NextResponse.json(feed)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro ao buscar feed' }, { status: 500 })
  }
}