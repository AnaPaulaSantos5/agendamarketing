import { NextRequest, NextResponse } from 'next/server';
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
    perfisSheet: doc.sheetsByTitle['Perfis'],
  };
}

/**
 * Sempre retorna data válida para FullCalendar
 */
function normalizeDate(dateStr?: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 16);
}

/**
 * Formato correto para Google Sheets
 */
function formatDateForSheet(dateStr?: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

////////////////////////////////////////////////////////////////////////////////
// GET — Agenda + Tarefas + Perfis
////////////////////////////////////////////////////////////////////////////////
export async function GET() {
  try {
    const { agendaSheet, tarefasSheet, perfisSheet } =
      await accessSpreadsheet();

    const agendaRows = await agendaSheet.getRows();
    const tarefasRows = await tarefasSheet.getRows();
    const perfisRows = perfisSheet ? await perfisSheet.getRows() : [];

    const perfis: Record<string, { chatId: string }> = {};
    perfisRows.forEach(row => {
      perfis[row.Perfil] = {
        chatId: row.ChatId || '',
      };
    });

    const events = agendaRows.map(row => {
      const blocoId = String(row._rowNumber);
      const tarefa = tarefasRows.find(
        t => String(t.Bloco_ID) === blocoId
      );

      return {
        id: blocoId,
        start: normalizeDate(row.Data_Inicio),
        end: normalizeDate(row.Data_Fim),
        tipoEvento: row.Tipo_Evento || '',
        tipo: row.Tipo || '',
        conteudoPrincipal: row.Conteudo_Principal || '',
        conteudoSecundario: row.Conteudo_Secundario || '',
        cta: row.CTA || '',
        statusPostagem: row.Status_Postagem || '',
        perfil: row.Perfil || 'Confi',

        tarefa: tarefa
          ? {
              titulo: tarefa.Titulo || '',
              responsavel: tarefa.Responsavel || '',
              responsavelChatId:
                tarefa.ResponsavelChatId ||
                perfis[row.Perfil]?.chatId ||
                '',
              data: normalizeDate(tarefa.Data),
              status: tarefa.Status || 'Pendente',
              linkDrive: tarefa.LinkDrive || '',
              notificar: tarefa.Notificar || 'Sim',
            }
          : null,
      };
    });

    return NextResponse.json({
      events,
      perfis,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}

////////////////////////////////////////////////////////////////////////////////
// POST — Criar evento
////////////////////////////////////////////////////////////////////////////////
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { agendaSheet, tarefasSheet } =
      await accessSpreadsheet();

    const agendaRow = await agendaSheet.addRow({
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

    if (data.tarefa) {
      await tarefasSheet.addRow({
        Bloco_ID: agendaRow._rowNumber,
        Titulo: data.tarefa.titulo,
        Responsavel: data.tarefa.responsavel,
        ResponsavelChatId: data.tarefa.responsavelChatId || '',
        Data: formatDateForSheet(data.tarefa.data),
        Status: data.tarefa.status || 'Pendente',
        LinkDrive: data.tarefa.linkDrive || '',
        Notificar: data.tarefa.notificar || 'Sim',
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}

////////////////////////////////////////////////////////////////////////////////
// PATCH — Atualizar EVENTO ou PERFIS
////////////////////////////////////////////////////////////////////////////////
export async function PATCH(req: NextRequest) {
  try {
    const data = await req.json();
    const { agendaSheet, tarefasSheet, perfisSheet } =
      await accessSpreadsheet();

    /**
     * 🔹 Atualização de PERFIS (chatIds)
     */
    if (!data.id && data.perfilConfig && perfisSheet) {
      const rows = await perfisSheet.getRows();

      for (const perfil of Object.keys(data.perfilConfig)) {
        const row = rows.find(r => r.Perfil === perfil);
        if (row) {
          row.ChatId = data.perfilConfig[perfil].chatId || '';
          await row.save();
        }
      }

      return NextResponse.json({ ok: true });
    }

    /**
     * 🔹 Atualização de EVENTO
     */
    const agendaRows = await agendaSheet.getRows();
    const row = agendaRows.find(
      r => String(r._rowNumber) === data.id
    );
    if (!row) throw new Error('Evento não encontrado');

    row.Data_Inicio = formatDateForSheet(data.start);
    row.Data_Fim = formatDateForSheet(data.end);
    row.Tipo_Evento = data.tipoEvento || '';
    row.Tipo = data.tipo || '';
    row.Conteudo_Principal = data.conteudoPrincipal || '';
    row.Conteudo_Secundario = data.conteudoSecundario || '';
    row.CTA = data.cta || '';
    row.Status_Postagem = data.statusPostagem || '';
    row.Perfil = data.perfil || '';
    await row.save();

    if (data.tarefa) {
      const tarefasRows = await tarefasSheet.getRows();
      let tarefaRow = tarefasRows.find(
        t => String(t.Bloco_ID) === data.id
      );

      if (!tarefaRow) {
        tarefaRow = await tarefasSheet.addRow({
          Bloco_ID: data.id,
        });
      }

      tarefaRow.Titulo = data.tarefa.titulo;
      tarefaRow.Responsavel = data.tarefa.responsavel;
      tarefaRow.ResponsavelChatId =
        data.tarefa.responsavelChatId || '';
      tarefaRow.Data = formatDateForSheet(data.tarefa.data);
      tarefaRow.Status = data.tarefa.status || 'Pendente';
      tarefaRow.LinkDrive = data.tarefa.linkDrive || '';
      tarefaRow.Notificar = data.tarefa.notificar || 'Sim';
      await tarefaRow.save();
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}

////////////////////////////////////////////////////////////////////////////////
// DELETE — Evento + Tarefa
////////////////////////////////////////////////////////////////////////////////
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    const { agendaSheet, tarefasSheet } =
      await accessSpreadsheet();

    const agendaRows = await agendaSheet.getRows();
    const agendaRow = agendaRows.find(
      r => String(r._rowNumber) === id
    );
    if (agendaRow) await agendaRow.delete();

    const tarefasRows = await tarefasSheet.getRows();
    const tarefaRow = tarefasRows.find(
      t => String(t.Bloco_ID) === id
    );
    if (tarefaRow) await tarefaRow.delete();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
