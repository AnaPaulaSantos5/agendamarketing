export function buildWhatsAppMessage(data: {
  nome: string;
  conteudoPrincipal: string;
  conteudoSecundario?: string;
  linkDrive?: string;
  saudacao?: string; // <-- Adicionado para o TypeScript aceitar
}) {
  // Se por acaso não vier saudação, ele usa "Olá"
  const saudacao = data.saudacao || "Olá";

  let msg = `${saudacao}, ${data.nome}! 😊\n\nTem marcado pra você o evento:\n“${data.conteudoPrincipal}”\n`;

  if (data.conteudoSecundario) {
    msg += `\nCaso não consiga postar, temos um conteúdo alternativo:\n“${data.conteudoSecundario}”\n`;
  }

  if (data.linkDrive) {
    msg += `\nSegue o link do Drive com o material:\n${data.linkDrive}\n`;
  }

  msg += `\nQualquer dúvida, sugestão ou problema, contate o Marketing.\n\nDeseja contactar o Marketing?\n1. Sim\n2. Não`;

  return msg;
}