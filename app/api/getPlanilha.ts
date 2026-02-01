import { AgendaEvent, Perfil } from '../components/types';

export const mapPlanilhaParaEventos = (sheetData: any[]): AgendaEvent[] => {
  return sheetData.map((row) => {
    const dateStart = row.Data_Inicio || row.Data || '';
    const dateEnd = row.Data_Fim || '';

    // transforma dataStart/dataEnd em string ISO para o FullCalendar
    const startISO = dateStart ? new Date(dateStart).toISOString() : new Date().toISOString();
    const endISO = dateEnd ? new Date(dateEnd).toISOString() : new Date().toISOString();

    return {
      id: row.ID || row.Bloco_ID || crypto.randomUUID(),

      // 🔹 formato de domínio (planilha / modal / WAHA)
      dateStart,
      dateEnd,

      // 🔹 formato que o calendário exige
      start: startISO,
      end: endISO,

      tipoEvento: row.Tipo_Evento || 'Evento',

      // ✅ preencheu obrigatoriamente 'data'
      tarefa: {
        titulo: row.Titulo || '',
        responsavel: (row.Responsavel || 'Confi') as Perfil,
        data: startISO, // ⚠️ aqui estava faltando
        status: row.Status || 'Pendente',
        linkDrive: row.Link_Drive || '',
        notificar: row.Notificar || '',
        responsavelChatId: row.ResponsavelChatId || '',
      },

      conteudoPrincipal: row.Conteudo_Principal || '',
      conteudoSecundario: row.Conteudo_Secundario || '',
      perfil: (row.Perfil || 'Confi') as Perfil,
      responsavelChatId: row.ResponsavelChatId || '',
    };
  });
};