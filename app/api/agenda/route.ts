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
    
    // --- AGENDA ---
    const agendaSheet = doc.sheetsByTitle['Agenda'];
    const rowsAgenda = await agendaSheet.getRows();
    const events = rowsAgenda
      .filter(row => row.get('Conteudo_Principal') && row.get('Data_Inicio'))
      .map(row => {
          const titulo = row.get('Conteudo_Principal');
          const data = row.get('Data_Inicio');
          // ID Seguro
          const safeId = `${titulo}-${data}`.replace(/[^a-zA-Z0-9]/g, '');

          return {
              id: safeId,
              dataInicio: data,
              dataFim: row.get('Data_Fim'),
              titulo: titulo,
              conteudoSecundario: row.get('Conteudo_Secundario'),
              cor: row.get('Tipo_Evento'),
              tipo: row.get('Tipo'),
              perfil: row.get('Perfil'),
              linkDrive: row.get('LinkDrive') || '' 
          };
      });

    // --- PERFIL ---
    const perfilSheet = doc.sheetsByTitle['Perfil'];
    const rowsPerfil = await perfilSheet.getRows();
    const perfis = rowsPerfil.map(row => ({
      nome: row.get('Perfil'),
      chatId: row.get('ChatId'),
      email: row.get('Email')
    }));

    // --- FEED ---
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
    console.error("Erro GET Agenda:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log("📝 POST RECEBIDO. Tipo:", data.tipo); // LOG 1

    await doc.loadInfo();

    // 1. Salvar na Agenda
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
    console.log("✅ Salvo na aba Agenda");

    // 2. Salvar na Tarefas (COM DIAGNÓSTICO)
    // Limpa o tipo para evitar erros de maiúscula/espaço
    const tipoLimpo = data.tipo ? data.tipo.toString().toLowerCase().trim() : '';
    
    if (tipoLimpo === 'externo') {
      const tarefasSheet = doc.sheetsByTitle['Tarefas'];
      
      if (!tarefasSheet) {
          console.error("❌ ERRO CRÍTICO: Aba 'Tarefas' não encontrada! Verifique o nome na planilha.");
      } else {
          // LOG DOS CABEÇALHOS: Isso vai mostrar o que o Google está vendo
          await tarefasSheet.loadHeaderRow(); 
          console.log("📋 CABEÇALHOS ENCONTRADOS EM TAREFAS:", tarefasSheet.headerValues);

          const novaLinha = {
            Bloco_ID: `TASK-${Date.now()}`,
            Titulo: data.titulo,
            Responsavel: data.perfil,
            Data: data.dataInicio,
            Status: 'Pendente',
            LinkDrive: data.linkDrive || '',
            Notificar: 'Sim',
            ResponsavelChatId: data.chatId
          };

          console.log("🚀 Tentando inserir linha:", novaLinha);
          await tarefasSheet.addRow(novaLinha);
          console.log("✅ Inserção em Tarefas concluída.");
      }
    } else {
        console.log(`⏭️ Pulando Tarefas pois tipo é '${tipoLimpo}' (não é 'externo')`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ ERRO NO POST:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const data = await req.json();
    await doc.loadInfo();
    
    const agendaSheet = doc.sheetsByTitle['Agenda'];
    const rows = await agendaSheet.getRows();
    
    // Busca linha pelo ID Seguro
    const rowToDelete = rows.find(row => {
        const currentId = `${row.get('Conteudo_Principal')}-${row.get('Data_Inicio')}`.replace(/[^a-zA-Z0-9]/g, '');
        return currentId === data.id;
    });

    if (rowToDelete) {
        const titulo = rowToDelete.get('Conteudo_Principal');
        const dataInicio = rowToDelete.get('Data_Inicio');

        await rowToDelete.delete();

        // Apaga da Tarefas
        const tarefasSheet = doc.sheetsByTitle['Tarefas'];
        if (tarefasSheet) {
            const tarefasRows = await tarefasSheet.getRows();
            const tarefaToDelete = tarefasRows.find(row => 
                row.get('Titulo') === titulo && 
                row.get('Data') === dataInicio
            );
            if (tarefaToDelete) await tarefaToDelete.delete();
        }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
