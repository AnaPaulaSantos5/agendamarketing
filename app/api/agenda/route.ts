import { NextResponse } from 'next/server'
import { GoogleSpreadsheet } from 'google-spreadsheet'

const SHEET_ID = process.env.GOOGLE_SHEET_ID!
const SERVICE_ACCOUNT = {
  client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
  private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'), // atenção para o \n
}

export async function GET() {
  try {
    // 1️⃣ construtor só recebe o ID
    const doc = new GoogleSpreadsheet(SHEET_ID)

    // 2️⃣ autenticação com objeto de credenciais completo
    await doc.useServiceAccountAuth(SERVICE_ACCOUNT)

    await doc.loadInfo() // carrega informações da planilha
    const sheet = doc.sheetsByIndex[0]
    const rows = await sheet.getRows()

    const agenda = rows.map(row => ({
      date: row.Data,
      time: row.Hora,
      title: row.Conteudo_Principal,
      type: row.Tipo?.toLowerCase() || 'story'
    }))

    return NextResponse.json({ agenda })
  } catch (err: any) {
    console.error('Erro ao carregar agenda:', err)
    return NextResponse.json({ error: 'Erro ao carregar agenda' }, { status: 500 })
  }
}
