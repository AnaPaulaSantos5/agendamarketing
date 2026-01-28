import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!);

async function accessSheet() {
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  });
  await doc.loadInfo();
  const agendaSheet = doc.sheetsByTitle['Agenda'];
  const tarefasSheet = doc.sheetsByTitle['Tarefas'];
  return { agendaSheet, tarefasSheet };
}

export async function GET() {
  try {
    const { agendaSheet, tarefasSheet } = await accessSheet();
    const agendaRows = await agendaSheet.getRows();
    const tarefasRows = await tarefasSheet.getRows();

    const agenda = agendaRows.map(r => ({
      Data_Inicio: r.Data_Inicio,
      Data_Fim: r.Data_Fim,
      Tipo_Evento: r.Tipo_Evento,
      Tipo: r.Tipo,
      Conteudo_Principal: r.Conteudo_Principal,
      Conteudo_Secundario: r.Conteudo_Secundario,
      CTA: r.CTA,
      Status_Postagem: r.Status_Postagem,
      Perfil: r.Perfil,
    }));

    const tarefas = tarefasRows.map(r => ({
      Bloco_ID: r.Bloco_ID,
      Titulo: r.Titulo,
      Responsavel: r.Responsavel,
      Data: r.Data,
      Status: r.Status,
      LinkDrive: r.LinkDrive,
      Notificar: r.Notificar,
    }));

    return NextResponse.json({ agenda, tarefas });
  } catch (err) {
    console.error('Erro GET /api/agenda', err);
    return NextResponse.json({ error: 'Erro ao carregar agenda' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { agendaSheet, tarefasSheet } = await accessSheet();
    const body = await req.json();

    // Criar linha na Agenda
    const newRow = {
      Data_Inicio: body.Data_Inicio,
      Data_Fim: body.Data_Fim,
      Tipo_Evento: body.Tipo_Evento,
      Tipo: body.Tipo,
      Conteudo_Principal: body.Conteudo_Principal,
      Conteudo_Secundario: body.Conteudo_Secundario,
      CTA: body.CTA,
      Status_Postagem: body.Status_Postagem || 'Pendente',
      Perfil: body.Perfil,
    };
    await agendaSheet.addRow(newRow);

    // Criar linha na Tarefas vinculada ao bloco
    if (body.Tarefas && body.Tarefas.length > 0) {
      for (const tarefa of body.Tarefas) {
        await tarefasSheet.addRow({
          Bloco_ID: new Date().getTime().toString(),
          Titulo: tarefa.Titulo,
          Responsavel: tarefa.Responsavel,
          Data: tarefa.Data,
          Status: tarefa.Status || 'Pendente',
          LinkDrive: tarefa.LinkDrive || '',
          Notificar: tarefa.Notificar || 'Sim',
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Erro POST /api/agenda', err);
    return NextResponse.json({ error: 'Erro ao salvar evento' }, { status: 500 });
  }
}
