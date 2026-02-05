import { NextRequest, NextResponse } from 'next/server'
import { buildWhatsAppMessage } from '@/lib/whatsapp/template'
import { sendWhatsAppMessage } from '@/lib/whatsapp/sender'

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const mensagem = buildWhatsAppMessage({
      nome: data.nome,
      conteudoPrincipal: data.conteudoPrincipal,
      conteudoSecundario: data.conteudoSecundario,
      linkDrive: data.linkDrive,
    })

    await sendWhatsAppMessage(data.responsavelChatId, mensagem, data.nome, data.conteudoPrincipal)

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao enviar' }, { status: 500 })
  }
}
