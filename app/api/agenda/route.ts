import { NextResponse } from 'next/server'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { AgendaEvent, ChecklistItem } from '@/lib/types'

// Pega credenciais do .env
const SHEET_ID = process.env.GOOGLE_SHEET_ID!
const CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n') // corrige quebra de linha

export async function GET() {
  try {
    const doc = new GoogleSpreadsheet(SHEET_ID)

    // autenticação
    await doc.useServiceAccountAuth({
      client_email: CLIENT_EMAIL,
      private_key: PRIVATE_KEY,
    })

    await doc.loadInfo()
    const sheet = doc.sheetsByIndex[0] // pega primeira aba
    const rows = await sheet.getRows()

    // transforma linhas em agenda e checklist
    const agenda: AgendaEvent[] = rows.map(row => ({
      date: row.Data, // coluna Data
      time: row.Hora || '09:00', // se tiver hora
      title: row.Conteudo_Principal,
      type: row.Tipo.toLowerCase() as 'story' | 'reel' | 'post' | 'evento',
    }))

    const checklist: ChecklistItem[] = rows.map((row, index) => ({
      id: `${index}`,
      text: row.Conteudo_Secundario || 'Ação não definida',
      done: row.Status_Postagem === 'Concluído',
      time: row.Hora || undefined,
    }))

    return NextResponse.json({ agenda, checklist })
  } catch (err: any) {
    console.error('Erro ao carregar agenda:', err.message)
    return NextResponse.json(
      { error: 'Erro ao carregar agenda' },
      { status: 500 }
    )
  }
}
