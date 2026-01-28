// app/api/agenda/route.ts
import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
const CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n');

async function getDoc() {
  const doc = new GoogleSpreadsheet(SHEET_ID);
  await doc.useServiceAccountAuth({
    client_email: CLIENT_EMAIL,
    private_key: PRIVATE_KEY,
  });
  await doc.loadInfo();
  return doc;
}

/* =======================
   GET – carregar calendário
======================= */
export async function GET() {
  try {
    const doc = await getDoc();

    const agendaSheet = doc.sheetsByTitle['Agenda'];
    const tarefasSheet = doc.sheetsByTitle['Tarefas'];

    const agendaRows = await agendaSheet.getRows();
    const tarefasRows = await tarefasSheet.getRows();

    return NextResponse.json({
      agenda: agendaRows.map((r, i) => ({
        id: `agenda-${i}`,
        Data_Inicio: r.Data_Inicio,
        Data_Fim: r.Data_Fim,
        Tipo_Evento: r.Tipo_Evento,
        Tipo: r.Tipo,
        Conteudo_Principal: r.Conteudo_Principal,
        Conteudo_Secundario: r.Conteudo_Secundario,
        CTA: r.CTA,
        Status_Postagem: r.Status_Postagem,
        Perfil: r.Perfil,
      })),
      tarefas: tarefasRows.map((r, i) => ({
        id: `tarefa-${i}`,
        Bloco_ID: r.Bloco_ID,
        Titulo: r.Titulo,
        Responsavel: r.Responsavel,
        Data: r.Data,
        Status: r.Status,
        LinkDrive: r.LinkDrive,
        Notificar: r.Notificar,
      })),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/* =======================
   POST – criar evento
======================= */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const doc = await getDoc();

    if (body.Tipo_Evento === 'Agenda') {
      const sheet = doc.sheetsByTitle['Agenda'];

      await sheet.addRow({
        Data_Inicio: body.Data_Inicio,
        Data_Fim: body.Data_Fim,
        Tipo_Evento: 'Agenda',
        Tipo: body.Tipo,
        Conteudo_Principal: body.Conteudo_Principal,
        Conteudo_Secundario: body.Conteudo_Secundario || '',
        CTA: body.CTA || 'Deseja falar com o marketing? ✅',
        Status_Postagem: body.Status_Postagem || 'Pendente',
        Perfil: body.Perfil,
      });
    }

    if (body.Tipo_Evento === 'Tarefa') {
      const sheet = doc.sheetsByTitle['Tarefas'];

      await sheet.addRow({
        Bloco_ID: body.Bloco_ID,
        Titulo: body.Titulo,
        Responsavel: body.Responsavel,
        Data: body.Data,
        Status: body.Status || 'Pendente',
        LinkDrive: body.LinkDrive || '',
        Notificar: body.Notificar || 'Não',
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}