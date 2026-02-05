import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Extrai dados do WAHA
    const payload = body?.payload || {};
    const text = payload.body || ''; 
    const from = payload.from || ''; // Ex: 554199999999@c.us

    // Ignora mensagens de grupos ou vazias
    if (!text || from.includes('@g.us')) return NextResponse.json({ ok: true });

    // Conecta na Planilha
    const auth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, auth);
    await doc.loadInfo();

    // 1. BUSCA O NOME REAL NA ABA PERFIL
    const perfilSheet = doc.sheetsByTitle['Perfil'];
    const perfisRows = await perfilSheet.getRows();
    
    // Tenta achar alguém com esse número (removemos caracteres não numéricos para comparar)
    const numeroLimpo = from.replace(/\D/g, ''); 
    const perfilEncontrado = perfisRows.find(row => {
        const chatDb = row.get('ChatId')?.replace(/\D/g, '') || '';
        return chatDb.includes(numeroLimpo) || numeroLimpo.includes(chatDb);
    });

    const nomeFinal = perfilEncontrado ? perfilEncontrado.get('Perfil') : `Cliente (${from.split('@')[0]})`;

    // 2. PROCESSA A RESPOSTA (Aceita tudo, mas destaca 1 e 2)
    let respostaFinal = text;
    if (text.trim() === '1') respostaFinal = 'SIM';
    if (text.trim() === '2') respostaFinal = 'NÃO';

    // 3. SALVA NO FEED
    const feedSheet = doc.sheetsByTitle['WhatsApp_Feed'];
    await feedSheet.addRow({
      Tipo: 'RESPOSTA',
      Nome: nomeFinal,
      Telefone: from,
      Evento: '-', // Resposta não tem evento vinculado direto
      Resposta: respostaFinal,
      Data: new Date().toLocaleString('pt-BR')
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
