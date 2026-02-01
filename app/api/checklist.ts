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
  const sheet = doc.sheetsByTitle['Checklist'];

  if (req.method === 'GET') {
    const rows = await sheet.getRows();
    res.status(200).json(rows.map(r => ({
      id: r.rowIndex.toString(),
      date: r.Data,
      client: r.Cliente,
      task: r.Tarefa,
      done: r.Done === 'TRUE',
    })));
  } else if (req.method === 'PATCH') {
    const { id } = req.body;
    const row = (await sheet.getRows()).find(r => r.rowIndex.toString() === id);
    if (!row) return res.status(404).json({ error: 'Tarefa não encontrada' });

    row.Done = 'TRUE';
    await row.save();
    res.status(200).json({ success: true });
  } else {
    res.status(405).end();
  }
}