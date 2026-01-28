// app/api/agenda/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';

// IDs das planilhas
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const AGENDA_SHEET_INDEX = 0; // Aba Agenda
const TAREFAS_SHEET_INDEX = 1; // Aba Tarefas

// Função para formatar datas para YYYY-MM-DD
function formatDateForSheet(dateString: string) {
  const d = new Date(dateString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function getSheets() {
  const doc = new GoogleSpreadsheet(SPREADSHEET_ID!);
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_EMAIL!,
    private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  });
  await doc.loadInfo();
  const agendaSheet = doc.sheetsByIndex[AGENDA_SHEET_INDEX];
  const tarefasSheet = doc.sheetsByIndex[TAREFAS_SHEET_INDEX];
  return { agendaSheet, tarefasSheet };
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (!data.start || !data.end) {
      return NextResponse.json({ error: 'Datas obrigatórias' }, { status: 400 });
    }

    const { agendaSheet, tarefasSheet } = await getSheets();

    // Adiciona na Agenda
    await agendaSheet.addRow({
      Data_Inicio: formatDateForSheet(data.start),
      Data_Fim: formatDateForSheet(data.end),
      Tipo_Evento: data.tipoEvento || '',
      Tipo: data.tipo || '',
      Conteudo_Principal: data.conteudoPrincipal || '',
      Conteudo_Secundario: data.conteudoSecundario || '',
      CTA: data.cta || '',
      Status_Postagem: data.statusPostagem || '',
      Perfil: data.perfil || '',
    });

    // Adiciona na Tarefas
    await tarefasSheet.addRow({
      Bloco_ID: data.id || '',
      Titulo: data.conteudoPrincipal || '',
      Responsavel: data.perfil || '',
      Data: formatDateForSheet(data.start),
      Status: data.statusPostagem || '',
      LinkDrive: data.linkDrive || '',
      Notificar: data.notificar || 'Sim',
    });

    return NextResponse.json({ message: 'Evento salvo com sucesso' });
  } catch (error) {
    console.error('Erro ao salvar evento', error);
    return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 });
  }
}
