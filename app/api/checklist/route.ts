// app/api/checklist/route.ts
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

// Função para sincronizar Checklist com Agenda e Tarefas
async function syncChecklist() {
  const doc = await accessSpreadsheet();
  const sheetChecklist = doc.sheetsByTitle['Checklist'];
  const sheetAgenda = doc.sheetsByTitle['Agenda'];
  const sheetTarefas = doc.sheetsByTitle['Tarefas'];

  const checklistRows = await sheetChecklist.getRows();
  const agendaRows = await sheetAgenda.getRows();
  const tarefasRows = await sheetTarefas.getRows();

  const checklistMap = new Map(checklistRows.map(r => [r.ID, r]));

  // Para cada tarefa da aba Tarefas vinculada à Agenda, cria/atualiza checklist
  for (const tarefaRow of tarefasRows) {
    const blocoId = tarefaRow.Bloco_ID;
    const agendaRow = agendaRows.find(a => a.ID === blocoId || a.id === blocoId); // ajuste se necessário
    if (!agendaRow) continue;

    const taskId = `${agendaRow.ID || agendaRow.id}-${tarefaRow.Bloco_ID}`;
    if (!checklistMap.has(taskId)) {
      // Cria nova linha na aba Checklist
      await sheetChecklist.addRow({
        ID: taskId,
        Data: agendaRow.Data_Inicio || agendaRow.start,
        Cliente: agendaRow.Perfil || '',
        Tarefa: tarefaRow.Titulo,
        Done: 'Não',
      });
    }
  }

  // Recarrega checklist atualizado
  const updatedChecklistRows = await sheetChecklist.getRows();
  return updatedChecklistRows.map(r => ({
    id: r.ID,
    date: r.Data,
    client: r.Cliente,
    task: r.Tarefa,
    done: r.Done === 'Sim',
  }));
}

// GET: retorna checklist atualizado
export async function GET() {
  try {
    const checklist = await syncChecklist();
    return NextResponse.json(checklist);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// PATCH: atualiza status Done
export async function PATCH(req: NextRequest) {
  try {
    const { id, done } = await req.json();
    const doc = await accessSpreadsheet();
    const sheetChecklist = doc.sheetsByTitle['Checklist'];
    const row = (await sheetChecklist.getRows()).find(r => r.ID === id);
    if (!row) throw new Error('Item não encontrado');
    row.Done = done ? 'Sim' : 'Não';
    await row.save();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
