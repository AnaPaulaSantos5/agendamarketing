// app/api/agenda/route.ts
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
  };
}

function formatDateForSheet(dateStr: string) {
  const d = new Date(dateStr);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

// POST novo evento
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { agendaSheet, tarefasSheet } = await accessSpreadsheet();

    // Salva o evento na aba Agenda
    const newRow = await agendaSheet.addRow({
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

    // Se houver tarefa, salva na aba Tarefas, incluindo responsavelChatId
    if (data.tarefa) {
      await tarefasSheet.addRow({
        Bloco_ID: newRow._rowNumber,
        Titulo: data.tarefa.titulo || '',
        Responsavel: data.tarefa.responsavel || '',
        ResponsavelChatId: data.tarefa.responsavelChatId || '', // ⚡ garante que salva
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

// PATCH editar evento/tarefa
export async function PATCH(req: NextRequest) {
  try {
    const data = await req.json();
    const { agendaSheet, tarefasSheet } = await accessSpreadsheet();

    const row = (await agendaSheet.getRows()).find(r => String(r._rowNumber) === data.id);
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
      const tarefaRow = (await tarefasSheet.getRows()).find(tr => String(tr.Bloco_ID) === data.id);
      if (tarefaRow) {
        tarefaRow.Titulo = data.tarefa.titulo || tarefaRow.Titulo;
        tarefaRow.Responsavel = data.tarefa.responsavel || tarefaRow.Responsavel;
        tarefaRow.ResponsavelChatId = data.tarefa.responsavelChatId || tarefaRow.ResponsavelChatId; // ⚡ garante que atualiza
        tarefaRow.Data = formatDateForSheet(data.tarefa.data);
        tarefaRow.Status = data.tarefa.status || tarefaRow.Status;
        tarefaRow.LinkDrive = data.tarefa.linkDrive || tarefaRow.LinkDrive;
        tarefaRow.Notificar = data.tarefa.notificar || tarefaRow.Notificar;
        await tarefaRow.save();
      } else {
        await tarefasSheet.addRow({
          Bloco_ID: data.id,
          Titulo: data.tarefa.titulo || '',
          Responsavel: data.tarefa.responsavel || '',
          ResponsavelChatId: data.tarefa.responsavelChatId || '', // ⚡ garante que salva
          Data: formatDateForSheet(data.tarefa.data),
          Status: data.tarefa.status || 'Pendente',
          LinkDrive: data.tarefa.linkDrive || '',
          Notificar: data.tarefa.notificar || 'Sim',
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
