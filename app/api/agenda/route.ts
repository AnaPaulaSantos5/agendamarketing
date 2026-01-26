import { NextResponse } from 'next/server'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { AgendaEvent, ChecklistItem } from '@/lib/types'

const SHEET_ID = process.env.GOOGLE_SHEET_ID!
const SERVICE_ACCOUNT = {
  client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
  private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
}

export async function GET() {
  try {
    const doc = new GoogleSpreadsheet(SHEET_ID)

    // autentica passando o objeto completo
    await doc.useServiceAccountAuth(SERVICE_ACCOUNT)

    await doc.loadInfo()
    const sheet = doc.sheetsByIndex[0]
    const rows = await sheet.getRows()

    const agenda: AgendaEvent[] = rows.map((row) => ({
      date: row.Data,
      time: row.Hora || '09:00',
      title: row.Conteudo_Principal,
      type: (row.Tipo || 'story').toLowerCase() as 'story' | 'reel' | 'post' | 'evento',
    }))

    const checklist: ChecklistItem[] = rows.map((row, index) => ({
      id: `${index}`,
      text: row.Conteudo_Secundario || 'Ação não definida',
      done: row.Status_Postagem === 'Concluído',
      time: row.Hora || undefined,
    }))

    return NextResponse.json({ agenda, checklist })
  } catch (err: any) {
    console.error('Erro ao carregar agenda:', err)
    return NextResponse.json(
      { error: 'Erro ao carregar agenda' },
      { status: 500 }
    )
  }
}
