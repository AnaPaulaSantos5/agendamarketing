import { NextResponse } from 'next/server'
import { GoogleSpreadsheet } from 'google-spreadsheet'

export async function GET() {
  try {
    // 1️⃣ Instancia a planilha com apenas o ID
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!)

    // 2️⃣ Autentica via Service Account
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
      private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    })

    // 3️⃣ Carrega informações da planilha
    await doc.loadInfo()

    // 4️⃣ Seleciona a aba "Agenda"
    const sheet = doc.sheetsByTitle['Agenda']
    if (!sheet) return NextResponse.json({ error: 'Aba Agenda não encontrada' }, { status: 404 })

    // 5️⃣ Pega todas as linhas
    const rows = await sheet.getRows()

    // 6️⃣ Mapeia os dados
    const agenda = rows.map(row => ({
      date: row['Data'],
      principal: row['Conteudo_Principal'],
      secundario: row['Conteudo_Secundario'],
      tipo: row['Tipo'],
      link: row['Link_Arquivo'],
      alternativa: row['Alternativa_Pronta'],
      cta: row['CTA_WhatsApp'],
      status: row['Status_Postagem'],
      perfil: row['Perfil'],
      bloco: row['Bloco'],
      checklist: row['Checklist'],
    }))

    return NextResponse.json({ agenda })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
