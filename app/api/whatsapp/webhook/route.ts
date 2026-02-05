import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // LOG PARA DEBUG: Isso vai mostrar no painel da Vercel o que exatamente o WhatsApp mandou
    console.log("📩 WEBHOOK RECEBIDO:", JSON.stringify(body, null, 2));
    
    // Extrai dados do WAHA (Blinda contra formatos diferentes)
    const payload = body?.payload || {};
    
    // O SEGREDO DO TEXTO: Tenta pegar de 3 lugares diferentes
    const text = payload.body || payload._data?.body || body.text || ''; 
    const from = payload.from || body.from || ''; // Ex: 554199999999@c.us
    const pushName = payload.pushName || payload._data?.notifyName || '';

    // Ignora mensagens de grupos (@g.us), status ou vazias
    if (!text || from.includes('@g.us') || from.includes('status@broadcast')) {
        return NextResponse.json({ ok: true });
    }

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
    
    // Limpa o número para comparar (remove + e espaços)
    const numeroLimpo = from.replace(/\D/g, ''); 
    
    const perfilEncontrado = perfisRows.find(row => {
        const chatDb = row.get('ChatId')?.replace(/\D/g, '') || '';
        // Verifica se um contém o outro (para evitar erros de 55 na frente)
        return chatDb && (chatDb.includes(numeroLimpo) || numeroLimpo.includes(chatDb));
    });

    // Se achou no perfil, usa o nome do perfil. Se não, usa o nome do Zap ou "Cliente"
    const nomeFinal = perfilEncontrado ? perfilEncontrado.get('Perfil') : (pushName || `Cliente (${numeroLimpo.slice(-4)})`);

    // 2. PROCESSA A RESPOSTA (Aceita 1/2 ou Sim/Não)
    let respostaFinal = text;
    const textoLimpo = text.trim().toLowerCase();
    if (textoLimpo === '1' || textoLimpo === 'sim' || textoLimpo === 'confirmar') respostaFinal = 'SIM';
    if (textoLimpo === '2' || textoLimpo === 'não' || textoLimpo === 'nao') respostaFinal = 'NÃO';

    // 3. SALVA NO FEED (Com Data do Brasil)
    const feedSheet = doc.sheetsByTitle['WhatsApp_Feed'];
    
    // Arruma o fuso horário para Brasil/São Paulo
    const dataHoraBrasil = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    await feedSheet.addRow({
      Tipo: 'RESPOSTA',
      Nome: nomeFinal,
      Telefone: from,
      Evento: '-', // Resposta espontânea não tem evento vinculado
      Resposta: respostaFinal,
      Data: dataHoraBrasil
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("❌ ERRO WEBHOOK:", err);
    // Retorna OK mesmo com erro para o WhatsApp não ficar reenviando a mensagem infinitamente
    return NextResponse.json({ ok: true }); 
  }
}
