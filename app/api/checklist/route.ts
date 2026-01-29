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

// Função para pegar todos os itens combinando abas: Checklist + Agenda + Tarefas
async function getChecklistItems() {
  const doc = await accessSpreadsheet();

  const checklistSheet = doc.sheetsByTitle['Checklist'];
  const agendaSheet = doc.sheetsByTitle['Agenda'];
  const tarefasSheet = doc.sheetsByTitle['Tarefas'];

  const checklistRows = await checklistSheet.getRows();
  const agendaRows = await agendaSheet.getRows();
  const tarefasRows = await tarefasSheet.getRows();

  const checklistItems = checklistRows.map(r => ({
    id: r.ID,
    date: r.Data,
    client: r.Cliente,
    task: r.Tarefa,
    done: r.Done === 'Sim' || r.Done === true,
  }));

  // Adiciona tarefas da aba Agenda que ainda não estão na checklist
  agendaRows.forEach(r => {
    if (r.Tipo === 'Tarefa' || r.Tipo === 'Perfil') {
      if (!checklistItems.find(c => c.id === r.ID)) {
        checklistItems.push({
          id: r.ID || String(new Date().getTime()) + Math.random(),
          date: r.Data_Inicio,
          client: r.Perfil || '',
          task: r.Conteudo_Principal || 'Sem descrição',
          done: false,
        });
      }
    }
  });

  // Adiciona itens da aba Tarefas que ainda não estão na checklist
  tarefasRows.forEach(r => {
    if (!checklistItems.find(c => c.id === r.Bloco_ID)) {
      checklistItems.push({
        id: r.Bloco_ID,
        date: r.Data,
        client: r.Responsavel,
        task: r.Titulo,
        done: r.Status === 'Concluída',
      });
    }
  });

  return checklistItems;
}

// GET
export async function GET() {
  try {
    const items = await getChecklistItems();
    return NextResponse.json(items);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// PATCH
export async function PATCH(req: NextRequest) {
  try {
    const { id, done } = await req.json();
    const doc = await accessSpreadsheet();
    const checklistSheet = doc.sheetsByTitle['Checklist'];
    const rows = await checklistSheet.getRows();
    const row = rows.find(r => r.ID === id);

    if (!row) throw new Error('Item não encontrado');
    row.Done = done ? 'Sim' : 'Não';
    await row.save();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
