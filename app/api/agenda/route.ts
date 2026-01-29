import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!);

async function accessSpreadsheet() {
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  });

  await doc.loadInfo();

  const agendaSheet = doc.sheetsByTitle['Agenda'];
  const tarefasSheet = doc.sheetsByTitle['Tarefas'];

  if (!agendaSheet || !tarefasSheet) {
    throw new Error('Abas Agenda ou Tarefas não encontradas');
  }

  return { agendaSheet, tarefasSheet };
}

function formatDate(dateStr: string) {
  return dateStr.split('T')[0];
}

export async function GET() {
  try {
    const { agendaSheet } = await accessSpreadsheet();
    const rows = await agendaSheet.getRows();

    return NextResponse.json(
      rows.map(row => ({
        id: row._rowNumber,
        start: row.Data_Inicio,
        end: row.Data_Fim,
        tipoEvento: row.Tipo_Evento,
        tipo: row.Tipo,
        conteudoPrincipal: row.Conteudo_Principal,
        perfil: row.Perfil,
      }))
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao carregar agenda' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { agendaSheet, tarefasSheet } = await accessSpreadsheet();

    await agendaSheet.addRow({
      Data_Inicio: formatDate(data.start),
      Data_Fim: formatDate(data.end),
      Tipo_Evento: data.tipoEvento || '',
      Tipo: data.tipo || '',
      Conteudo_Principal: data.conteudoPrincipal || '',
      Conteudo_Secundario: '',
      CTA: '',
      Status_Postagem: '',
      Perfil: data.perfil || '',
    });

    if (data.tarefa) {
      await tarefasSheet.addRow({
        Bloco_ID: '',
        Titulo: data.tarefa.titulo,
        Responsavel: data.tarefa.responsavel,
        Data: formatDate(data.tarefa.data),
        Status: data.tarefa.status,
        LinkDrive: data.tarefa.linkDrive,
        Notificar: data.tarefa.notificar,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 });
  }
}