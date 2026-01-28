// app/api/agenda/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!);

async function accessSpreadsheet() {
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  });
  await doc.loadInfo();
}

export async function GET() {
  await accessSpreadsheet();

  // Carrega ambas as abas
  const sheetAgenda = doc.sheetsByTitle['Agenda'];
  const sheetTarefas = doc.sheetsByTitle['Tarefas'];

  if (!sheetAgenda || !sheetTarefas) {
    return NextResponse.json({ error: 'Aba Agenda ou Tarefas não encontrada' }, { status: 500 });
  }

  const rowsAgenda = await sheetAgenda.getRows();
  const rowsTarefas = await sheetTarefas.getRows();

  const agenda = rowsAgenda.map((row, index) => ({
    id: index.toString(),
    Data_Inicio: row.Data_Inicio,
    Data_Fim: row.Data_Fim,
    Tipo_Evento: row.Tipo_Evento,
    Tipo: row.Tipo,
    Conteudo_Principal: row.Conteudo_Principal,
    Conteudo_Secundario: row.Conteudo_Secundario,
    CTA: row.CTA,
    Status_Postagem: row.Status_Postagem,
    Perfil: row.Perfil,
  }));

  const tarefas = rowsTarefas.map((row, index) => ({
    id: index.toString(),
    Bloco_ID: row.Bloco_ID,
    Titulo: row.Titulo,
    Responsavel: row.Responsavel,
    Data: row.Data,
    Status: row.Status,
    LinkDrive: row.LinkDrive,
    Notificar: row.Notificar,
  }));

  return NextResponse.json({ Agenda: agenda, Tarefas: tarefas });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  await accessSpreadsheet();

  // Detecta aba correta
  const tipoEvento = body.Tipo_Evento?.toLowerCase();

  if (tipoEvento === 'agenda') {
    const sheet = doc.sheetsByTitle['Agenda'];
    if (!sheet) throw new Error('Aba "Agenda" não encontrada');

    await sheet.addRow({
      Data_Inicio: body.Data_Inicio,
      Data_Fim: body.Data_Fim,
      Tipo_Evento: 'Agenda',
      Tipo: body.Tipo,
      Conteudo_Principal: body.Conteudo_Principal,
      Conteudo_Secundario: body.Conteudo_Secundario,
      CTA: body.CTA || '',
      Status_Postagem: body.Status_Postagem || 'Pendente',
      Perfil: body.Perfil || 'Confi',
    });
  }

  else if (tipoEvento === 'tarefa') {
    const sheet = doc.sheetsByTitle['Tarefas'];
    if (!sheet) throw new Error('Aba "Tarefas" não encontrada');

    await sheet.addRow({
      Bloco_ID: body.Bloco_ID || '',
      Titulo: body.Titulo || '',
      Responsavel: body.Responsavel || '',
      Data: body.Data || '',
      Status: body.Status || 'Pendente',
      LinkDrive: body.LinkDrive || '',
      Notificar: body.Notificar || 'Não',
    });
  }

  else {
    return NextResponse.json({ error: 'Tipo_Evento inválido' }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}