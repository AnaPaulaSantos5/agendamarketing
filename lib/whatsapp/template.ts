export function buildWhatsAppMessage(data: {
  nome: string;
  conteudoPrincipal: string;
  conteudoSecundario?: string;
  linkDrive?: string;
}) {
  let msg = `Ótimo dia, ${data.nome}! 😊

Tem marcado pra você o evento:
“${data.conteudoPrincipal}”
`;

  if (data.conteudoSecundario) {
    msg += `
Caso não consiga postar, temos um conteúdo alternativo:
“${data.conteudoSecundario}”
`;
  }

  if (data.linkDrive) {
    msg += `
Segue o link do Drive com o material:
${data.linkDrive}
`;
  }

  msg += `

Qualquer dúvida, sugestão ou problema, contate o Marketing.

Deseja contactar o Marketing?
1. Sim
2. Não
`;

  return msg;
}