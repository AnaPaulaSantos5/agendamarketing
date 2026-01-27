import { NextResponse } from 'next/server'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'

export async function GET() {
  try {
    // Configurar autenticação via Service Account
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    // Instanciar a planilha
    const doc = new GoogleSpreadsheet(
      process.env.GOOGLE_SHEET_ID!,
      {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
        private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      },
      serviceAccountAuth
    )

    await doc.loadInfo()

    // Selecionar aba "Agenda"
    const sheet = doc.sheetsByTitle['Agenda']
    if (!sheet) {
      return NextResponse.json({ error: 'Aba Agenda não encontrada' }, { status: 404 })
    }

    // Carregar todas as linhas
    const rows = await sheet.getRows()

    // Mapear os dados da planilha (usando colchetes para evitar erro de TypeScript)
    const agendaRaw = rows.map(row => ({
      date: row['Data'],                     // Data do post
      principal: row['Conteudo_Principal'],  // Conteúdo principal
      secundario: row['Conteudo_Secundario'],// Conteúdo secundário
      tipo: row['Tipo'],                      // Story, Reel, Post
      link: row['Link_Arquivo'],              // Link do arquivo ou vídeo
      alternativa: row['Alternativa_Pronta'],// Alternativa pronta
      cta: row['CTA_WhatsApp'],               // CTA WhatsApp
      status: row['Status_Postagem'],         // Status Pendente/Pronto
      perfil: row['Perfil'],                  // Perfil: Confi Seguros, Finanças, Benefícios
      bloco: row['Bloco'],                    // Bloco mensal ou campanha
      checklist: row['Checklist'],            // Checklist ou tarefas
    }))

    // Exemplo de filtro: blocos ativos ou por perfil (opcional)
    const agendaFiltrada = agendaRaw.filter(item => item.status === 'Pendente')

    return NextResponse.json({ agenda: agendaFiltrada })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
