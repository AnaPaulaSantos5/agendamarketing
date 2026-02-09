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
    
    // --- 1. LER AGENDA ---
    const agendaSheet = doc.sheetsByTitle['Agenda'];
    const rowsAgenda = await agendaSheet.getRows();
    
    const events = rowsAgenda.map(row => {
        const idGerado = (row.get('Conteudo_Principal') || '') + (row.get('Data_Inicio') || '');
        return {
            id: idGerado,
            dataInicio: row.get('Data_Inicio'),
            dataFim: row.get('Data_Fim'),
            titulo: row.get('Conteudo_Principal'),
            conteudoSecundario: row.get('Conteudo_Secundario'),
            cor: row.get('Tipo_Evento'),
            tipo: row.get('Tipo'),
            perfil: row.get('Perfil'),
            linkDrive: row.get('LinkDrive') || '' 
        };
    });

    // --- 2. LER PERFIL ---
    const perfilSheet = doc.sheetsByTitle['Perfil'];
    const rowsPerfil = await perfilSheet.getRows();
    const perfis = rowsPerfil.map(row => ({
      nome: row.get('Perfil'),
      chatId: row.get('ChatId'),
      email: row.get('Email')
    }));

    // --- 3. LER FEED ---
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
    console.error("Erro Geral API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Normaliza para garantir que não falhe por letra maiúscula
    const tipoEvento = data.tipo ? data.tipo.toLowerCase().trim() : '';

    await doc.loadInfo();

    // 1. Salvar na Agenda (Mantemos o padrão que já funciona)
    const agendaSheet = doc.sheetsByTitle['Agenda'];
    await agendaSheet.addRow({
      Data_Inicio: data.dataInicio,
      Data_Fim: data.dataFim,
      Tipo_Evento: data.cor,
      Tipo: data.tipo,
      Conteudo_Principal: data.titulo,
      Conteudo_Secundario: data.conteudoSecundario || '',
      Perfil: data.perfil,
      LinkDrive: data.linkDrive || '' 
    });

    // 2. Salvar na Tarefas (MÉTODO BRUTO - ARRAY)
    if (tipoEvento === 'externo') {
      const tarefasSheet = doc.sheetsByTitle['Tarefas'];
      
      if (!tarefasSheet) {
          throw new Error("Aba 'Tarefas' não encontrada na planilha!");
      }

      const blocoId = `ID${Date.now()}`;

      // AQUI ESTÁ O TRUQUE: Passamos um ARRAY, não um objeto.
      // Ele vai gravar na ordem exata das colunas:
      // 1:Bloco_ID, 2:Titulo, 3:Responsavel, 4:Data, 5:Status, 6:LinkDrive, 7:Notificar, 8:ChatId
      await tarefasSheet.addRow([
        blocoId,                // Coluna A
        data.titulo,            // Coluna B
        data.perfil,            // Coluna C
        data.dataInicio,        // Coluna D
        'Pendente',             // Coluna E
        data.linkDrive || '',   // Coluna F
        'Sim',                  // Coluna G
        data.chatId             // Coluna H
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro POST:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const data = await req.json(); 
    await doc.loadInfo();
    
    // --- APAGAR DA AGENDA ---
    const agendaSheet = doc.sheetsByTitle['Agenda'];
    const rows = await agendaSheet.getRows();
    
    const rowToDelete = rows.find(row => 
        ((row.get('Conteudo_Principal') || '') + (row.get('Data_Inicio') || '')) === data.id
    );

    if (rowToDelete) {
        const tituloSalvo = rowToDelete.get('Conteudo_Principal');
        const dataSalva = rowToDelete.get('Data_Inicio');

        await rowToDelete.delete();

        // --- APAGAR DA TAREFA ---
        const tarefasSheet = doc.sheetsByTitle['Tarefas'];
        if (tarefasSheet) {
            const tarefasRows = await tarefasSheet.getRows();
            // Procura na aba Tarefas (Aqui precisamos do nome para achar e apagar)
            // Se der erro aqui, é porque o nome da coluna ainda está diferente
            const tarefaToDelete = tarefasRows.find(row => 
                row.get('Titulo') === tituloSalvo && 
                row.get('Data') === dataSalva
            );
            
            if (tarefaToDelete) {
                await tarefaToDelete.delete();
            }
        }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
