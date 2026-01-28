// app/api/agenda/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';

// Conecta à planilha usando as variáveis de ambiente
const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!);

async function accessSpreadsheet() {
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  });

  await doc.loadInfo();

  const agendaSheet = doc.sheetsByTitle['Agenda'];
  const tarefasSheet = doc.sheetsByTitle['Tarefas'];

  return { agendaSheet, tarefasSheet };
}

// Converte data ISO para "YYYY-MM-DD"
function formatDateForSheet(dateStr: string) {
  const d = new Date(dateStr);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// GET: retorna todos os eventos da Agenda
export async function GET() {
  try {
    const { agendaSheet } = await accessSpreadsheet();
    const rows = await agendaSheet.getRows();

    const events = rows.map(row => ({
      id: row._rowNumber.toString(),
      start: row.Data_Inicio,
      end: row.Data_Fim,
      tipoEvento: row.Tipo_Evento,
      tipo: row.Tipo,
      conteudoPrincipal: row.Conteudo_Principal,
      conteudoSecundario: row.Conteudo_Secundario,
      cta: row.CTA,
      statusPostagem: row.Status_Postagem,
      perfil: row.Perfil,
    }));

    return NextResponse.json(events);
  } catch (error) {
    console.error('Erro ao carregar agenda', error);
    return NextResponse.json({ error: 'Erro ao carregar agenda', details: (error as Error).message }, { status: 500 });
  }
}

// POST: adiciona evento na Agenda e Tarefas
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { agendaSheet, tarefasSheet } = await accessSpreadsheet();

    // ====== Salva na Agenda ======
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

    // ====== Salva na Tarefas ======
    if (data.tarefa) {
      await tarefasSheet.addRow({
        Bloco_ID: data.tarefa.blocoId || '',
        Titulo: data.tarefa.titulo || '',
        Responsavel: data.tarefa.responsavel || '',
        Data: formatDateForSheet(data.tarefa.data || new Date().toISOString()),
        Status: data.tarefa.status || '',
        LinkDrive: data.tarefa.linkDrive || '',
        Notificar: data.tarefa.notificar || '',
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Erro ao salvar evento', error);
    return NextResponse.json({ error: 'Erro ao salvar', details: (error as Error).message }, { status: 500 });
  }
}
