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

/** Normaliza data para FullCalendar (string ISO yyyy-MM-ddTHH:mm) */
function normalizeDate(dateStr?: string) {
  if (!dateStr) return new Date().toISOString().slice(0, 16); // default para agora
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 16);
  return d.toISOString().slice(0, 16);
}

export async function GET() {
  try {
    const { agendaSheet, tarefasSheet } = await accessSpreadsheet();

    const agendaRows = await agendaSheet.getRows();
    const tarefasRows = await tarefasSheet.getRows();

    const events = agendaRows.map(row => {
      // Usa ID fixo se existir, senão row._rowNumber
      const id = row.ID || String(row._rowNumber);

      // Procura tarefa pelo mesmo ID
      const tarefaRow = tarefasRows.find(t => String(t.Bloco_ID) === id);

      return {
        id,
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
    console.error('Erro GET /agenda:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}