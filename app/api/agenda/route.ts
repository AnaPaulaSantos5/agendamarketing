import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { Perfil, AgendaEvent } from './types';

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

function normalizeDate(dateStr?: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 16);
}

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

// 🔹 GET - Retorna todos os eventos + tarefas
export async function GET() {
  try {
    const { agendaSheet, tarefasSheet } = await accessSpreadsheet();
    const agendaRows = await agendaSheet.getRows();
    const tarefasRows = await tarefasSheet.getRows();

    const events: AgendaEvent[] = agendaRows.map(row => {
      const blocoId = row.Bloco_ID || String(row._rowNumber);
      if (!row.Bloco_ID) {
        row.Bloco_ID = blocoId;
        row.save();
      }

      const tarefaRow = tarefasRows.find(t => String(t.Bloco_ID) === blocoId);

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
        perfil: (row.Perfil as Perfil) || 'Confi',
        tarefa: tarefaRow
          ? {
              titulo: tarefaRow.Titulo || '',
              responsavel: tarefaRow.Responsavel as Perfil || 'Confi',
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

// 🔹 POST - Cria evento + tarefa
export async function POST(req: NextRequest) {
  try {
    const data: AgendaEvent = await req.json();
    const { agendaSheet, tarefasSheet } = await accessSpreadsheet();

    const agendaRow = await agendaSheet.addRow({
      Data_Inicio: formatDateForSheet(data.start),
      Data_Fim: formatDateForSheet(data.end),
      Tipo_Evento: data.tipoEvento || '',
      Tipo: data.tipo || '',
      Conteudo_Principal: data.conteudoPrincipal || '',
      Conteudo_Secundario: data.conteudoSecundario || '',
      CTA: data.cta || '',
      Status_Postagem: data.statusPostagem || '',
      Perfil: data.perfil,
    });

    const blocoId = agendaRow.Bloco_ID || String(agendaRow._rowNumber);
    if (!agendaRow.Bloco_ID) {
      agendaRow.Bloco_ID = blocoId;
      await agendaRow.save();
    }

    if (data.tarefa) {
      await tarefasSheet.addRow({
        Bloco_ID: blocoId,
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
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// 🔹 PATCH - Atualiza evento + tarefa
export async function PATCH(req: NextRequest) {
  try {
    const data: AgendaEvent = await req.json();
    const { agendaSheet, tarefasSheet } = await accessSpreadsheet();

    const agendaRows = await agendaSheet.getRows();
    const row = agendaRows.find(r => String(r.Bloco_ID) === data.id);
    if (!row) throw new Error('Evento não encontrado');

    row.Data_Inicio = formatDateForSheet(data.start);
    row.Data_Fim = formatDateForSheet(data.end);
    row.Tipo_Evento = data.tipoEvento;
    row.Tipo = data.tipo;
    row.Conteudo_Principal = data.conteudoPrincipal;
    row.Conteudo_Secundario = data.conteudoSecundario;
    row.CTA = data.cta;
    row.Status_Postagem = data.statusPostagem;
    row.Perfil = data.perfil;
    await row.save();

    if (data.tarefa) {
      const tarefasRows = await tarefasSheet.getRows();
      let tarefaRow = tarefasRows.find(t => String(t.Bloco_ID) === data.id);

      if (!tarefaRow) {
        tarefaRow = await tarefasSheet.addRow({ Bloco_ID: data.id });
      }

      tarefaRow.Titulo = data.tarefa.titulo;
      tarefaRow.Responsavel = data.tarefa.responsavel;
      tarefaRow.ResponsavelChatId = data.tarefa.responsavelChatId || '';
      tarefaRow.Data = formatDateForSheet(data.tarefa.data);
      tarefaRow.Status = data.tarefa.status || 'Pendente';
      tarefaRow.LinkDrive = data.tarefa.linkDrive || '';
      tarefaRow.Notificar = data.tarefa.notificar || 'Sim';
      await tarefaRow.save();
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// 🔹 DELETE - Remove evento + tarefa
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    const { agendaSheet, tarefasSheet } = await accessSpreadsheet();

    const agendaRows = await agendaSheet.getRows();
    const agendaRow = agendaRows.find(r => String(r.Bloco_ID) === id);
    if (agendaRow) await agendaRow.delete();

    const tarefasRows = await tarefasSheet.getRows();
    const tarefaRow = tarefasRows.find(t => String(t.Bloco_ID) === id);
    if (tarefaRow) await tarefaRow.delete();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}