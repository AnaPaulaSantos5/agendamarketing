import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!);

async function accessSpreadsheet() {
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  });

  await doc.loadInfo();

  return {
    agendaSheet: doc.sheetsByTitle['Agenda'],
    tarefasSheet: doc.sheetsByTitle['Tarefas'],
  };
}

// Normaliza datas para FullCalendar
function normalizeDate(dateStr?: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm
}

export async function GET() {
  try {
    const { agendaSheet, tarefasSheet } = await accessSpreadsheet();

    const agendaRows = await agendaSheet.getRows();
    const tarefasRows = await tarefasSheet.getRows();

    const events = agendaRows.map((row, index) => {
      const blocoId = row.ID || String(row._rowNumber);

      // Procura tarefa pelo Bloco_ID ou fallback pelo índice (planilhas antigas)
      const tarefaRow =
        tarefasRows.find(t => String(t.Bloco_ID) === blocoId) ||
        tarefasRows[index] || // fallback simples
        null;

      return {
        id: blocoId,
        start: normalizeDate(row.Data_Inicio),
        end: normalizeDate(row.Data_Fim),
        tipoEvento: row.Tipo_Evento || 'Evento',
        tipo: row.Tipo || 'Perfil',
        conteudoPrincipal: row.Conteudo_Principal || 'Sem título',
        conteudoSecundario: row.Conteudo_Secundario || '',
        cta: row.CTA || '',
        statusPostagem: row.Status_Postagem || '',
        perfil: row.Perfil || 'Confi',
        tarefa: tarefaRow
          ? {
              titulo: tarefaRow.Titulo || 'Sem título',
              responsavel: tarefaRow.Responsavel || 'Confi',
              responsavelChatId: tarefaRow.ResponsavelChatId || '',
              data: normalizeDate(tarefaRow.Data),
              status: tarefaRow.Status || 'Pendente',
              linkDrive: tarefaRow.LinkDrive || '',
              notificar: tarefaRow.Notificar || 'Sim',
            }
          : null,
      };
    });

    return NextResponse.json(events);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}