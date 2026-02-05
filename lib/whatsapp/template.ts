export function buildWhatsAppMessage(data: {
  nome: string;
  conteudoPrincipal: string;
  conteudoSecundario?: string;
  linkDrive?: string;
}) {
  const hora = new Date().getHours();
  let saudacao = "Olá";

  if (hora >= 5 && hora < 12) saudacao = "Bom dia";
  else if (hora >= 12 && hora < 18) saudacao = "Boa tarde";
  else saudacao = "Boa noite";

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
