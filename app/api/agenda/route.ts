import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// Configuração de autenticação (Mantida igual)
const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, serviceAccountAuth);

export async function GET() {
  try {
    await doc.loadInfo();
    const agendaSheet = doc.sheetsByTitle['Agenda'];
    const rowsAgenda = await agendaSheet.getRows();
    
    // --- 1. LEITURA DA AGENDA (Simples e Direta) ---
    const events = rowsAgenda.map(row => {
        // Gera ID juntando Titulo e Data (Sem inventar moda)
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
            // Tenta ler com ou sem underline pra garantir
            linkDrive: row.get('LinkDrive') || row.get('Link_Drive') || '' 
        };
    });

    // --- 2. LEITURA DE PERFIL ---
    const perfilSheet = doc.sheetsByTitle['Perfil'];
    const rowsPerfil = await perfilSheet.getRows();
    const perfis = rowsPerfil.map(row => ({
      nome: row.get('Perfil'),
      chatId: row.get('ChatId'),
      email: row.get('Email')
    }));

    // --- 3. LEITURA DO FEED ---
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
    console.error("❌ Erro Geral API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log("📝 POST INICIADO. Tipo:", data.tipo, "| Titulo:", data.titulo);

    await doc.loadInfo();

    // 1. Salvar na Agenda (Isso já funciona, mantemos)
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
    console.log("✅ Salvo na Agenda.");

    // 2. Salvar na Tarefas (LÓGICA BLINDADA)
    // Normaliza o tipo para minúsculo e sem espaço
    const tipoNormalizado = data.tipo ? String(data.tipo).toLowerCase().trim() : '';
    
    if (tipoNormalizado === 'externo') {
      const tarefasSheet = doc.sheetsByTitle['Tarefas'];
      
      if (!tarefasSheet) {
          console.error("❌ CRÍTICO: Aba 'Tarefas' não encontrada!");
          throw new Error("Aba Tarefas sumiu.");
      }

      // CARREGA OS CABEÇALHOS REAIS DA PLANILHA
      await tarefasSheet.loadHeaderRow();
      const headers = tarefasSheet.headerValues;
      console.log("📋 Cabeçalhos Reais da Planilha:", headers);

      // FUNÇÃO INTELIGENTE: Procura a coluna que parece com o nome que queremos
      // Ex: Se procurar 'Titulo', acha ' Titulo ' ou 'Titulo'
      const buscaColuna = (parteDoNome: string) => {
          return headers.find(h => h.toLowerCase().includes(parteDoNome.toLowerCase()));
      };

      // Monta a linha usando os nomes REAIS que encontrou
      const novaLinha: any = {};
      
      const colBloco = buscaColuna('Bloco');      // Acha Bloco_ID ou Bloco ID
      const colTitulo = buscaColuna('Titulo');    // Acha Titulo ou Título
      const colResp = buscaColuna('Responsavel'); // Acha Responsavel
      const colData = buscaColuna('Data');        // Acha Data
      const colStatus = buscaColuna('Status');    // Acha Status
      const colLink = buscaColuna('Link');        // Acha LinkDrive
      const colNotif = buscaColuna('Notificar');  // Acha Notificar
      const colChat = buscaColuna('Chat');        // Acha ResponsavelChatId

      if (colBloco) novaLinha[colBloco] = `ID${Date.now()}`;
      if (colTitulo) novaLinha[colTitulo] = data.titulo;
      if (colResp) novaLinha[colResp] = data.perfil;
      if (colData) novaLinha[colData] = data.dataInicio;
      if (colStatus) novaLinha[colStatus] = 'Pendente';
      if (colLink) novaLinha[colLink] = data.linkDrive || '';
      if (colNotif) novaLinha[colNotif] = 'Sim';
      if (colChat) novaLinha[colChat] = data.chatId;

      console.log("🚀 Tentando gravar linha montada:", novaLinha);
      
      await tarefasSheet.addRow(novaLinha);
      console.log("✅ SUCESSO: Salvo na aba Tarefas!");
    } else {
        console.log(`⚠️ Ignorado: Tipo '${tipoNormalizado}' não é 'externo'.`);
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
             await tarefasSheet.loadHeaderRow();
             const headers = tarefasSheet.headerValues;
             const buscaColuna = (parte: string) => headers.find(h => h.toLowerCase().includes(parte.toLowerCase()));
             
             const colTitulo = buscaColuna('Titulo');
             const colData = buscaColuna('Data');

             if (colTitulo && colData) {
                 const tarefasRows = await tarefasSheet.getRows();
                 const tarefaToDelete = tarefasRows.find(row => 
                    row.get(colTitulo) === tituloSalvo && 
                    row.get(colData) === dataSalva
                 );
                 if (tarefaToDelete) await tarefaToDelete.delete();
             }
        }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
