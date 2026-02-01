import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { AgendaEvent, Perfil } from '@/app/components/types';
import { randomUUID } from 'crypto';

const auth = new JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, auth);
const SHEET_NAME = 'Agenda';

/* =========================
   GET – LISTAR EVENTOS
========================= */
export async function GET() {
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle[SHEET_NAME];
  const rows = await sheet.getRows();

  const events: AgendaEvent[] = rows
    .filter(r => r.Data_Inicio && r.Data_Fim)
    .map((r) => ({
      id: r.ID || randomUUID(),
      start: new Date(r.Data_Inicio).toISOString(),
      end: new Date(r.Data_Fim).toISOString(),
      conteudoPrincipal: r.Conteudo_Principal || '',
      conteudoSecundario: r.Conteudo_Secundario || '',
      cta: r.CTA || '',
      statusPostagem: r.Status || '',
      perfil: (r.Perfil as Perfil) || 'Confi',
      tipoEvento: r.Tipo || 'Perfil',
      allDay: false,
    }));

  return NextResponse.json(events);
}

/* =========================
   POST – CRIAR EVENTO
========================= */
export async function POST(req: Request) {
  const body = await req.json();

  const row = {
    ID: randomUUID(),
    Data_Inicio: new Date(body.start).toISOString(),
    Data_Fim: new Date(body.end).toISOString(),
    Conteudo_Principal: body.conteudoPrincipal ?? '',
    Conteudo_Secundario: body.conteudoSecundario ?? '',
    CTA: body.cta ?? '',
    Status: body.statusPostagem ?? 'Pendente',
    Perfil: body.perfil ?? 'Confi',
    Tipo: body.tipoEvento ?? 'Perfil',
  };

  await doc.loadInfo();
  await doc.sheetsByTitle[SHEET_NAME].addRow(row);

  return NextResponse.json({ ok: true, row });
}