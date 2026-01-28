// app/api/agenda/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!);

async function accessSheet() {
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_CLIENT_EMAIL!,
    private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  });
  await doc.loadInfo();
  const agendaSheet = doc.sheetsByTitle['Agenda'];
  const tarefasSheet = doc.sheetsByTitle['Tarefas'];
  return { agendaSheet, tarefasSheet };
}

// GET: retorna eventos da aba Agenda
export async function GET() {
  try {
    const { agendaSheet } = await accessSheet();
    const rows = await agendaSheet.getRows();

    const events = rows.map(row => ({
      Data_Inicio: row.Data_Inicio,
      Data_Fim: row.Data_Fim,
      Tipo_Evento: row.Tipo_Evento,
      Tipo: row.Tipo,
      Conteudo_Principal: row.Conteudo_Principal,
      Conteudo_Secundario: row.Conteudo_Secundario,
      CTA: row.CTA,
      Status_Postagem: row.Status_Postagem,
      Perfil: row.Perfil,
      LinkDrive: row.LinkDrive || '',
    }));

    return NextResponse.json({ Agenda: events });
  } catch (err) {
    console.error('Erro GET agenda:', err);
    return NextResponse.json({ error: 'Erro ao buscar agenda' }, { status: 500 });
  }
}

// POST: adiciona novo evento na Agenda e Tarefas
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { agendaSheet, tarefasSheet } = await accessSheet();

    // Adiciona na Agenda
    const newRow = await agendaSheet.addRow({
      Data_Inicio: data.start,
      Data_Fim: data.end,
      Tipo_Evento: data.Tipo_Evento,
      Tipo: data.Tipo,
      Conteudo_Principal: data.Conteudo_Principal,
      Conteudo_Secundario: data.Conteudo_Secundario,
      CTA: data.CTA,
      Status_Postagem: 'Pendente',
      Perfil: data.Perfil,
      LinkDrive: data.LinkDrive || '',
    });

    // Cria tarefa correspondente (um bloco por evento)
    await tarefasSheet.addRow({
      Bloco_ID: newRow._rowNumber,
      Titulo: data.Conteudo_Principal,
      Responsavel: data.Perfil,
      Data: data.start,
      Status: 'Pendente',
      LinkDrive: data.LinkDrive || '',
      Notificar: 'Sim',
    });

    return NextResponse.json({ success: true, event: newRow });
  } catch (err) {
    console.error('Erro POST agenda:', err);
    return NextResponse.json({ error: 'Erro ao adicionar evento' }, { status: 500 });
  }
}
