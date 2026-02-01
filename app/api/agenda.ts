import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleSpreadsheet } from 'google-spreadsheet';

const doc = new GoogleSpreadsheet(process.env.SHEET_ID!);

const auth = async () => {
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    private_key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  });
  await doc.loadInfo();
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await auth();
  const sheet = doc.sheetsByTitle['Agenda'];

  if (req.method === 'GET') {
    await sheet.loadCells();
    const rows = await sheet.getRows();
    res.status(200).json(rows.map(r => ({
      id: r.rowIndex.toString(),
      start: r.Data_Inicio,
      end: r.Data_Fim,
      tipoEvento: r.Tipo_Evento,
      tipo: r.Tipo,
      conteudoPrincipal: r.Conteudo_Principal,
      conteudoSecundario: r.Conteudo_Secundario,
      statusPostagem: r.Status_Postagem,
      perfil: r.Perfil,
    })));
  } else if (req.method === 'POST') {
    const ev = req.body;
    const row = await sheet.addRow({
      Data_Inicio: ev.start,
      Data_Fim: ev.end,
      Tipo_Evento: ev.tipoEvento,
      Tipo: ev.tipo,
      Conteudo_Principal: ev.conteudoPrincipal,
      Conteudo_Secundario: ev.conteudoSecundario,
      Status_Postagem: ev.statusPostagem,
      Perfil: ev.perfil,
    });
    res.status(200).json({ ...ev, id: row.rowIndex });
  } else if (req.method === 'PATCH') {
    const ev = req.body;
    const row = (await sheet.getRows()).find(r => r.rowIndex.toString() === ev.id);
    if (!row) return res.status(404).json({ error: 'Evento não encontrado' });

    row.Data_Inicio = ev.start;
    row.Data_Fim = ev.end;
    row.Tipo_Evento = ev.tipoEvento;
    row.Tipo = ev.tipo;
    row.Conteudo_Principal = ev.conteudoPrincipal;
    row.Conteudo_Secundario = ev.conteudoSecundario;
    row.Status_Postagem = ev.statusPostagem;
    row.Perfil = ev.perfil;
    await row.save();

    res.status(200).json(ev);
  } else if (req.method === 'DELETE') {
    const { id } = req.body;
    const row = (await sheet.getRows()).find(r => r.rowIndex.toString() === id);
    if (!row) return res.status(404).json({ error: 'Evento não encontrado' });
    await row.delete();
    res.status(200).json({ success: true });
  } else {
    res.status(405).end();
  }
}