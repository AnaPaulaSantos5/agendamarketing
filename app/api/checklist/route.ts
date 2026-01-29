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

// GET: retorna checklist unificado do dia
export async function GET() {
  try {
    const doc = await accessSpreadsheet();

    const sheetChecklist = doc.sheetsByTitle['Checklist'];
    const sheetAgenda = doc.sheetsByTitle['Agenda'];
    const sheetTarefas = doc.sheetsByTitle['Tarefas'];

    const checklistRows = await sheetChecklist.getRows();
    const agendaRows = await sheetAgenda.getRows();
    const tarefasRows = await sheetTarefas.getRows();

    const today = new Date().toISOString().slice(0, 10);

    // Transformar cada aba em ChecklistItem
    const itemsFromAgenda = agendaRows.map(r => ({
      id: r.ID || `${r.Data_Inicio}-${r.Conteudo_Principal}`,
      date: r.Data_Inicio,
      client: r.Perfil || 'Confi',
      task: r.Conteudo_Principal || 'Sem título',
      done: checklistRows.find(c => c.ID === r.ID)?.Done === 'Sim' || false,
    }));

    const itemsFromTarefas = tarefasRows.map(r => ({
      id: r.Bloco_ID,
      date: r.Data,
      client: r.Responsavel,
      task: r.Titulo,
      done: r.Status === 'Concluída',
    }));

    const itemsFromChecklist = checklistRows.map(r => ({
      id: r.ID,
      date: r.Data,
      client: r.Cliente,
      task: r.Tarefa,
      done: r.Done === 'Sim',
    }));

    // Juntar tudo e remover duplicados
    const allItemsMap = new Map<string, any>();
    [...itemsFromAgenda, ...itemsFromTarefas, ...itemsFromChecklist].forEach(item => {
      allItemsMap.set(item.id, item);
    });

    const allTasks = Array.from(allItemsMap.values());

    // Filtrar apenas tarefas do dia e não concluídas
    const todayTasks = allTasks.filter(t => t.date.slice(0, 10) === today && !t.done);

    return NextResponse.json(todayTasks);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// PATCH: marca tarefa como concluída
export async function PATCH(req: NextRequest) {
  try {
    const { id } = await req.json();
    const doc = await accessSpreadsheet();
    const sheetChecklist = doc.sheetsByTitle['Checklist'];
    const rows = await sheetChecklist.getRows();

    const row = rows.find(r => r.ID === id);
    if (!row) throw new Error('Item não encontrado na aba Checklist');

    row.Done = 'Sim';
    await row.save();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}