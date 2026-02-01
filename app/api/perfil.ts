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
  const sheet = doc.sheetsByTitle['Tarefas'];

  if (req.method === 'PATCH') {
    const { name, chatId } = req.body;
    const rows = await sheet.getRows();
    // Atualiza todas as linhas do usuário
    const userRows = rows.filter(r => r.Responsavel === name);
    for (const row of userRows) {
      row.ResponsavelChatId = chatId;
      await row.save();
    }
    res.status(200).json({ success: true });
  } else {
    res.status(405).end();
  }
}