import { AgendaEvent } from '@/types';

export const mapPlanilhaParaEventos = (sheetData: any[]): AgendaEvent[] => {
  return sheetData.map((row) => {
    const dateStart = row.Data_Inicio || row.Data || '';
    const dateEnd = row.Data_Fim || '';

    return {
      id: row.ID || row.Bloco_ID || crypto.randomUUID(),

      // 🔹 formato de domínio (planilha / modal / WAHA)
      dateStart,
      dateEnd,

      // 🔹 formato que o calendário exige
      start: dateStart ? new Date(dateStart) : new Date(),
      end: dateEnd ? new Date(dateEnd) : undefined,

      tipoEvento: row.Tipo_Evento || 'Evento',

      tarefa: {
        titulo: row.Titulo || '',
        responsavel: row.Responsavel || '',
        status: row.Status || 'Pendente',
        linkDrive: row.Link_Drive || '',
        notificar: row.Notificar || '',
      },

      conteudoPrincipal: row.Conteudo_Principal || '',
      conteudoSecundario: row.Conteudo_Secundario || '',
      perfil: row.Perfil || '',
      responsavelChatId: row.ResponsavelChatId || '',
    };
  });
};