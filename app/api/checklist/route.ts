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

async function getAllTasks() {
  const doc = await accessSpreadsheet();

  const checklistSheet = doc.sheetsByTitle['Checklist'];
  const agendaSheet = doc.sheetsByTitle['Agenda'];
  const tarefasSheet = doc.sheetsByTitle['Tarefas'];

  const tasks: any[] = [];

  // Aba Checklist
  if (checklistSheet) {
    const rows = await checklistSheet.getRows();
    rows.forEach(r => {
      tasks.push({
        id: `checklist-${r.ID}`,
        date: r.Data,
        client: r.Cliente,
        task: r.Tarefa,
        done: r.Done === 'Sim' || r.Done === 'TRUE',
        sourceSheet: 'Checklist',
      });
    });
  }

  // Aba Agenda
  if (agendaSheet) {
    const rows = await agendaSheet.getRows();
    rows.forEach(r => {
      if (r.Tipo === 'Tarefa' || r.Conteudo_Principal) {
        tasks.push({
          id: `agenda-${r.Data_Inicio}-${r.Conteudo_Principal}`,
          date: r.Data_Inicio,
          client: r.Perfil || 'Geral',
          task: r.Conteudo_Principal || 'Tarefa',
          done: false,
          sourceSheet: 'Agenda',
        });
      }
    });
  }

  // Aba Tarefas
  if (tarefasSheet) {
    const rows = await tarefasSheet.getRows();
    rows.forEach(r => {
      tasks.push({
        id: `tarefas-${r.Bloco_ID}`,
        date: r.Data,
        client: r.Responsavel,
        task: r.Titulo,
        done: r.Status === 'Concluído' || r.Status === 'Sim',
        sourceSheet: 'Tarefas',
      });
    });
  }

  return tasks;
}

export async function GET() {
  try {
    const tasks = await getAllTasks();
    // Remove duplicações
    const uniqueTasks = Array.from(new Map(tasks.map(t => [t.id, t])).values());
    return NextResponse.json(uniqueTasks);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id } = await req.json();
    const tasks = await getAllTasks();
    const task = tasks.find(t => t.id === id);
    if (!task) throw new Error('Item não encontrado');

    const doc = await accessSpreadsheet();
    let sheet, row;

    if (task.sourceSheet === 'Checklist') {
      sheet = doc.sheetsByTitle['Checklist'];
      row = (await sheet.getRows()).find(r => `checklist-${r.ID}` === id);
      if (row) row.Done = 'Sim';
    } else if (task.sourceSheet === 'Tarefas') {
      sheet = doc.sheetsByTitle['Tarefas'];
      row = (await sheet.getRows()).find(r => `tarefas-${r.Bloco_ID}` === id);
      if (row) row.Status = 'Concluído';
    }
    // Aba Agenda apenas marca como concluído no frontend (opcional: pode salvar em outra coluna)

    if (row) await row.save();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}