import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, serviceAccountAuth);

// --- FUNÇÃO AJUDANTE PARA ACHAR COLUNAS (USADA NO GET) ---
// Ela pega uma linha e procura o valor de uma coluna baseado em parte do nome
function lerColunaInteligente(row: any, parteDoNome: string) {
    const objetoLinha = row.toObject(); // Transforma a linha em objeto JS
    const chaves = Object.keys(objetoLinha);
    // Procura a primeira chave que contem o nome (ignora maiúsculas/espaços)
    const chaveEncontrada = chaves.find(chave => chave.toLowerCase().includes(parteDoNome.toLowerCase()));
    return chaveEncontrada ? objetoLinha[chaveEncontrada] : '';
}

export async function GET() {
  try {
    await doc.loadInfo();
    
    // --- 1. LEITURA DA AGENDA (AGORA COM BUSCA INTELIGENTE) ---
    const agendaSheet = doc.sheetsByTitle['Agenda'];
    const rowsAgenda = await agendaSheet.getRows();
    
    const events = rowsAgenda.map(row => {
        // Usa a função inteligente para achar as colunas, não importa como estão escritas
        const titulo = lerColunaInteligente(row, 'Conteudo') || lerColunaInteligente(row, 'Titulo');
        const dataIni = lerColunaInteligente(row, 'Data_Inicio') || lerColunaInteligente(row, 'Data Inicio');
        
        // ID: Titulo + Data
        const idGerado = (titulo || '') + (dataIni || '');

        return {
            id: idGerado,
            dataInicio: dataIni,
            dataFim: lerColunaInteligente(row, 'Data_Fim') || lerColunaInteligente(row, 'Data Fim'),
            titulo: titulo,
            conteudoSecundario: lerColunaInteligente(row, 'Secundario'),
            cor: lerColunaInteligente(row, 'Tipo_Evento') || lerColunaInteligente(row, 'Cor'),
            tipo: lerColunaInteligente(row, 'Tipo'),
            perfil: lerColunaInteligente(row, 'Perfil'),
            
            // AQUI É A SOLUÇÃO: Pega qualquer coluna que tenha "Link" no nome (LinkDrive, Link Drive, Link_Drive...)
            linkDrive: lerColunaInteligente(row, 'Link') 
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
    console.log("📝 POST:", data.titulo);

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

    // 2. Salvar na Tarefas (LÓGICA BLINDADA)
    const tipoNormalizado = data.tipo ? String(data.tipo).toLowerCase().trim() : '';
    
    if (tipoNormalizado === 'externo') {
      const tarefasSheet = doc.sheetsByTitle['Tarefas'];
      
      if (tarefasSheet) {
          await tarefasSheet.loadHeaderRow();
          const headers = tarefasSheet.headerValues;
          
          // Busca dinâmica de colunas para escrita
          const buscaNomeColuna = (parte: string) => headers.find(h => h.toLowerCase().includes(parte.toLowerCase()));

          const novaLinha: any = {};
          
          // Mapeia os campos procurando partes do nome
          const colBloco = buscaNomeColuna('Bloco');
          const colTitulo = buscaNomeColuna('Titulo');
          const colResp = buscaNomeColuna('Responsavel');
          const colData = buscaNomeColuna('Data');
          const colStatus = buscaNomeColuna('Status');
          const colLink = buscaNomeColuna('Link'); // Acha LinkDrive
          const colNotif = buscaNomeColuna('Notificar');
          const colChat = buscaNomeColuna('Chat');

          if (colBloco) novaLinha[colBloco] = `ID${Date.now()}`;
          if (colTitulo) novaLinha[colTitulo] = data.titulo;
          if (colResp) novaLinha[colResp] = data.perfil;
          if (colData) novaLinha[colData] = data.dataInicio;
          if (colStatus) novaLinha[colStatus] = 'Pendente';
          if (colLink) novaLinha[colLink] = data.linkDrive || '';
          if (colNotif) novaLinha[colNotif] = 'Sim';
          if (colChat) novaLinha[colChat] = data.chatId;

          await tarefasSheet.addRow(novaLinha);
      }
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
    
    // Busca inteligente no delete
    const rowToDelete = rows.find(row => {
        const titulo = lerColunaInteligente(row, 'Conteudo') || lerColunaInteligente(row, 'Titulo');
        const dataIni = lerColunaInteligente(row, 'Data_Inicio') || lerColunaInteligente(row, 'Data Inicio');
        const idLinha = (titulo || '') + (dataIni || '');
        return idLinha === data.id;
    });

    if (rowToDelete) {
        // Pega os dados antes de apagar para usar na busca da tarefa
        const tituloSalvo = lerColunaInteligente(rowToDelete, 'Conteudo') || lerColunaInteligente(rowToDelete, 'Titulo');
        const dataSalva = lerColunaInteligente(rowToDelete, 'Data_Inicio') || lerColunaInteligente(rowToDelete, 'Data Inicio');

        await rowToDelete.delete();

        // --- APAGAR DA TAREFA ---
        const tarefasSheet = doc.sheetsByTitle['Tarefas'];
        if (tarefasSheet) {
             await tarefasSheet.loadHeaderRow();
             const headers = tarefasSheet.headerValues;
             const buscaNomeColuna = (parte: string) => headers.find(h => h.toLowerCase().includes(parte.toLowerCase()));
             
             const colTitulo = buscaNomeColuna('Titulo');
             const colData = buscaNomeColuna('Data');

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
