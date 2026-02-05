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
      linkDrive: row.get('Link_Drive') || ''
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
    })).reverse().slice(0, 20); // Aumentei para 20

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
      Link_Drive: data.linkDrive || ''
    });

    // 2. Salvar na aba Tarefas (Para o Robô disparar depois)
    // Só salva em tarefas se for Externo, pois interno não manda zap
    if (data.tipo === 'externo') {
      const tarefasSheet = doc.sheetsByTitle['Tarefas'];
      await tarefasSheet.addRow({
        Titulo: data.titulo,
        Responsavel: data.perfil,
        Data: data.dataInicio, // Formato esperado: YYYY-MM-DD HH:mm
        Status: 'Pendente',
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

// --- AQUI ESTÁ A CORREÇÃO DO EXCLUIR ---
export async function DELETE(req: NextRequest) {
  try {
    const data = await req.json(); // Recebe o ID
    await doc.loadInfo();
    
    // 1. Apagar da Agenda
    const agendaSheet = doc.sheetsByTitle['Agenda'];
    const rows = await agendaSheet.getRows();
    
    // Procura a linha que gera o mesmo ID (Titulo + Data)
    const rowToDelete = rows.find(row => 
        (row.get('Conteudo_Principal') + row.get('Data_Inicio')) === data.id
    );

    if (rowToDelete) {
        await rowToDelete.delete();
    }

    // 2. Opcional: Tentar apagar da aba Tarefas também para não disparar mensagem de evento cancelado
    // (Lógica simplificada: procura pelo mesmo titulo e data)
    const tarefasSheet = doc.sheetsByTitle['Tarefas'];
    const tarefasRows = await tarefasSheet.getRows();
    const tarefaToDelete = tarefasRows.find(row => 
         row.get('Titulo') === rowToDelete?.get('Conteudo_Principal') && 
         row.get('Data') === rowToDelete?.get('Data_Inicio')
    );
    if (tarefaToDelete) {
        await tarefaToDelete.delete();
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro no DELETE:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
