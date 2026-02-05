import { NextRequest, NextResponse } from 'next/server';
import { parseResposta } from '@/lib/whatsapp/parser';
// Importe aqui sua lógica de salvar na planilha (Google Spreadsheet)

export async function POST(req: NextRequest) {
  const body = await req.json();
  
  // O WAHA envia eventos. Queremos o 'message.upsert' ou 'message'
  const text = body?.payload?.body; // Depende da versão do WAHA
  const from = body?.payload?.from;

  const resposta = parseResposta(text);

  if (resposta === 'SIM') {
     // 1. Salvar na Planilha na aba Feed: "Luiza pediu ajuda!"
     // 2. Opcional: Enviar um alerta para o SEU número (Marketing)
  } else if (resposta === 'NAO') {
     // Salvar no Feed: "Luiza informou que está tudo OK."
  }

  return NextResponse.json({ ok: true });
}
