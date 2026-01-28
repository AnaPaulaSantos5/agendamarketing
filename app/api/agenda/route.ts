// app/api/agenda/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';

const doc = new GoogleSpreadsheet(process.env.SHEET_ID!);

async function accessSpreadsheet() {
  try {
    console.log('Autenticando no Google Sheets...');
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_CLIENT_EMAIL!,
      private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    });
    await doc.loadInfo();
    console.log('Planilha carregada:', doc.title);

    const agendaSheet = doc.sheetsByTitle['Agenda'];
    const tarefasSheet = doc.sheetsByTitle['Tarefas'];

    if (!agendaSheet) throw new Error('Aba "Agenda" não encontrada!');
    if (!tarefasSheet) console.warn('Aba "Tarefas" não encontrada!');

    return { agendaSheet, tarefasSheet };
  } catch (error) {
    console.error('ERRO ao acessar a planilha:', error);
    throw error;
  }
}

// Converte ISO string para YYYY-MM-DD
function formatDateForSheet(dateStr: string) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) throw new Error(`Data inválida: ${dateStr}`);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  } catch (error) {
    console.error('ERRO ao formatar data:', error);
    return '';
  }
}

// ================== GET ==================
export async function GET() {
  try {
    console.log('GET /api/agenda iniciado...');
    const { agendaSheet } = await accessSpreadsheet();
    const rows = await agendaSheet.getRows();
    console.log(`Linhas encontradas na agenda: ${rows.length}`);

    const events = rows.map((row) => ({
      id: row._rowNumber,
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
    console.error('ERRO COMPLETO GET /api/agenda:', error);
    return NextResponse.json({ error: 'Erro ao carregar agenda', details: String(error) }, { status: 500 });
  }
}

// ================== POST ==================
export async function POST(req: NextRequest) {
  try {
    console.log('POST /api/agenda iniciado...');
    const data = await req.json();
    console.log('Dados recebidos:', data);

    const { agendaSheet, tarefasSheet } = await accessSpreadsheet();

    if (!agendaSheet) throw new Error('Agenda sheet não encontrada!');

    // ====== Salva na Agenda ======
    const agendaRow = {
      Data_Inicio: formatDateForSheet(data.start),
      Data_Fim: formatDateForSheet(data.end),
      Tipo_Evento: data.tipoEvento || '',
      Tipo: data.tipo || '',
      Conteudo_Principal: data.conteudoPrincipal || '',
      Conteudo_Secundario: data.conteudoSecundario || '',
      CTA: data.cta || '',
      Status_Postagem: data.statusPostagem || '',
      Perfil: data.perfil || '',
    };
    console.log('Salvando linha na agenda:', agendaRow);
    await agendaSheet.addRow(agendaRow);

    // ====== Salva na Tarefas ======
    if (data.tarefa && tarefasSheet) {
      const tarefaRow = {
        Bloco_ID: data.tarefa.blocoId || '',
        Titulo: data.tarefa.titulo || '',
        Responsavel: data.tarefa.responsavel || '',
        Data: formatDateForSheet(data.tarefa.data || new Date().toISOString()),
        Status: data.tarefa.status || '',
        LinkDrive: data.tarefa.linkDrive || '',
        Notificar: data.tarefa.notificar || '',
      };
      console.log('Salvando linha na tarefas:', tarefaRow);
      await tarefasSheet.addRow(tarefaRow);
    }

    console.log('POST concluído com sucesso!');
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('ERRO COMPLETO POST /api/agenda:', error);
    return NextResponse.json({ error: 'Erro ao salvar', details: String(error) }, { status: 500 });
  }
}
