import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, serviceAccountAuth);

export async function GET() {
  try {
    await doc.loadInfo();
    
    // 1. Puxar Eventos da aba Agenda
    const agendaSheet = doc.sheetsByTitle['Agenda'];
    const rowsAgenda = await agendaSheet.getRows();
    const events = rowsAgenda.map(row => ({
      // O ID é a combinação de Título + Data para podermos achar depois
      id: row.get('Conteudo_Principal') + row.get('Data_Inicio'),
      dataInicio: row.get('Data_Inicio'),
      dataFim: row.get('Data_Fim'),
      titulo: row.get('Conteudo_Principal'),
      conteudoSecundario: row.get('Conteudo_Secundario'),
      cor: row.get('Tipo_Evento'),
      tipo: row.get('Tipo'),
      perfil: row.get('Perfil'),
      // CORREÇÃO: Nome exato da coluna no Excel (LinkDrive)
      linkDrive: row.get('LinkDrive') || '' 
    }));

    // 2. Puxar Perfis da aba Perfil
    const perfilSheet = doc.sheetsByTitle['Perfil'];
    const rowsPerfil = await perfilSheet.getRows();
    const perfis = rowsPerfil.map(row => ({
      nome: row.get('Perfil'),
      chatId: row.get('ChatId'),
      email: row.get('Email')
    }));

    // 3. Puxar histórico do WhatsApp_Feed
    const feedSheet = doc.sheetsByTitle['WhatsApp_Feed'];
    const rowsFeed = await feedSheet.getRows();
    const feed = rowsFeed.map(row => ({
      Tipo: row.get('Tipo'),
      Nome: row.get('Nome'),
      Telefone: row.get('Telefone'),
      Evento: row.get('Evento'),
      Resposta: row.get('Resposta'),
      Data: row.get('Data')
    })).reverse().slice(0, 20);

    return NextResponse.json({ events, perfis, feed });
  } catch (error: any) {
    console.error("Erro na API Agenda:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    await doc.loadInfo();

    // 1. Salvar na aba Agenda
    const agendaSheet = doc.sheetsByTitle['Agenda'];
    await agendaSheet.addRow({
      Data_Inicio: data.dataInicio,
      Data_Fim: data.dataFim,
      Tipo_Evento: data.cor,
      Tipo: data.tipo,
      Conteudo_Principal: data.titulo,
      Conteudo_Secundario: data.conteudoSecundario || '',
      Perfil: data.perfil,
      // CORREÇÃO: Gravando na coluna LinkDrive (sem underline)
      LinkDrive: data.linkDrive || '' 
    });

    // 2. Salvar na aba Tarefas (Para o Robô disparar depois)
    if (data.tipo === 'externo') {
      const tarefasSheet = doc.sheetsByTitle['Tarefas'];
      await tarefasSheet.addRow({
        Titulo: data.titulo,
        Responsavel: data.perfil,
        Data: data.dataInicio,
        Status: 'Pendente',
        // Aqui já estava correto, mantivemos
        LinkDrive: data.linkDrive || '', 
        Notificar: 'Sim',
        ResponsavelChatId: data.chatId
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro no POST Agenda:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const data = await req.json();
    await doc.loadInfo();
    
    // 1. Apagar da Agenda
    const agendaSheet = doc.sheetsByTitle['Agenda'];
    const rows = await agendaSheet.getRows();
    
    const rowToDelete = rows.find(row => 
        (row.get('Conteudo_Principal') + row.get('Data_Inicio')) === data.id
    );

    if (rowToDelete) {
        // Salvamos os dados antes de deletar para poder achar na aba Tarefas depois
        const titulo = rowToDelete.get('Conteudo_Principal');
        const dataInicio = rowToDelete.get('Data_Inicio');

        await rowToDelete.delete();

        // 2. Apagar da aba Tarefas
        const tarefasSheet = doc.sheetsByTitle['Tarefas'];
        const tarefasRows = await tarefasSheet.getRows();
        const tarefaToDelete = tarefasRows.find(row => 
             row.get('Titulo') === titulo && 
             row.get('Data') === dataInicio
        );
        if (tarefaToDelete) {
            await tarefaToDelete.delete();
        }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro no DELETE:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
