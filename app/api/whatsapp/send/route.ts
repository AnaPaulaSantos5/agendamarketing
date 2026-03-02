import { NextRequest, NextResponse } from 'next/server'
import { buildWhatsAppMessage } from '@/lib/whatsapp/template'
import { sendWhatsAppMessage } from '@/lib/whatsapp/sender'
import { formatInTimeZone } from 'date-fns-tz'

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const fusoCuritiba = 'America/Sao_Paulo'
    
    // Calcula a hora real de Curitiba
    const horaAtual = parseInt(formatInTimeZone(new Date(), fusoCuritiba, 'H'))

    let saudacaoReal = "Olá";
    if (horaAtual >= 5 && horaAtual < 12) saudacaoReal = "Bom dia";
    else if (horaAtual >= 12 && horaAtual < 18) saudacaoReal = "Boa tarde";
    else saudacaoReal = "Boa noite";

    // CORREÇÃO: Usamos data.titulo (que vem do front) para preencher o conteudoPrincipal (que o template espera)
    const tituloEvento = data.titulo || data.conteudoPrincipal || 'Evento sem título';

    const mensagem = buildWhatsAppMessage({
      nome: data.nome,
      saudacao: saudacaoReal,
      conteudoPrincipal: tituloEvento, 
      conteudoSecundario: data.conteudoSecundario || '',
      linkDrive: data.linkDrive || '',
    })

    await sendWhatsAppMessage(
      data.responsavelChatId, 
      mensagem, 
      data.nome, 
      tituloEvento // Também corrigido aqui para o log do sender
    )

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("Erro ao enviar WhatsApp:", err);
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
