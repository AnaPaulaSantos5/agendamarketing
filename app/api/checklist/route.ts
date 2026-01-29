import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!);

async function accessSpreadsheet() {
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  });
  await doc.loadInfo();
  return doc;
}

// GET: retorna checklist unificado
export async function GET() {
  try {
    const doc = await accessSpreadsheet();
    const sheetChecklist = doc.sheetsByTitle['Checklist'];
    const sheetAgenda = doc.sheetsByTitle['Agenda'];
    const sheetTarefas = doc.sheetsByTitle['Tarefas'];

    const rowsChecklist = await sheetChecklist.getRows();
    const rowsAgenda = await sheetAgenda.getRows();
    const rowsTarefas = await sheetTarefas.getRows();

    // Constrói checklist com base nas três abas
    const checklist = [
      ...rowsChecklist.map(r => ({
        id: r.ID,
        date: r.Data,
        client: r.Cliente,
        task: r.Tarefa,
        done: r.Done === 'Sim',
      })),
      ...rowsAgenda
        .filter(r => r.Tipo === 'Tarefa' && r.Conteudo_Principal)
        .map(r => ({
          id: `agenda-${r.Data_Inicio}-${r.Conteudo_Principal}`,
          date: r.Data_Inicio,
          client: r.Perfil,
          task: r.Conteudo_Principal,
          done: false,
        })),
      ...rowsTarefas.map(r => ({
        id: `tarefa-${r.Bloco_ID}`,
        date: r.Data,
        client: r.Responsavel,
        task: r.Titulo,
        done: r.Status === 'Concluída',
      })),
    ];

    return NextResponse.json(checklist);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// PATCH: atualiza apenas a aba Checklist
export async function PATCH(req: NextRequest) {
  try {
    const { id, done } = await req.json();
    const doc = await accessSpreadsheet();
    const sheetChecklist = doc.sheetsByTitle['Checklist'];

    const row = (await sheetChecklist.getRows()).find(r => r.ID === id);
    if (!row) throw new Error('Item não encontrado na aba Checklist');

    row.Done = done ? 'Sim' : 'Não';
    await row.save();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}