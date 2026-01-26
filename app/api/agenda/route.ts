// app/api/agenda/route.ts
import { NextResponse } from 'next/server'
import { GoogleSpreadsheet } from 'google-spreadsheet'

const SHEET_ID = process.env.GOOGLE_SHEET_ID!
const SERVICE_ACCOUNT = {
  client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
  private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
}

export async function GET() {
  try {
    // Cria documento passando apenas o ID
    const doc = new GoogleSpreadsheet(SHEET_ID)

    // Autentica com objeto completo (chaves com underline)
    await doc.useServiceAccountAuth(SERVICE_ACCOUNT)

    // Carrega informações da planilha
    await doc.loadInfo()
    const sheet = doc.sheetsByIndex[0]

    // Pega todas as linhas
    const rows = await sheet.getRows()

    // Monta agenda e checklist
    const agenda = rows.map(row => ({
      date: row.Data,
      time: row.Hora || '00:00',
      title: row.Conteudo_Principal,
      type: row.Tipo?.toLowerCase() || 'story'
    }))

    const checklist = rows.map((row, index) => ({
      id: String(index + 1),
      text: `Publicar ${row.Tipo?.toLowerCase() || 'story'}`,
      done: row.Status_Postagem === 'Concluído',
      time: row.Hora || undefined
    }))

    return NextResponse.json({ agenda, checklist })
  } catch (err) {
    console.error('Erro ao carregar agenda:', err)
    return NextResponse.json({ error: 'Erro ao carregar agenda' }, { status: 500 })
  }
}
