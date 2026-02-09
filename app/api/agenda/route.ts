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
    
    // --- 1. LEITURA DA AGENDA (AGORA INTELIGENTE) ---
    const agendaSheet = doc.sheetsByTitle['Agenda'];
    const rowsAgenda = await agendaSheet.getRows();
    
    const events = rowsAgenda.map(row => {
        // Converte a linha inteira para um objeto simples para podermos procurar as chaves
        const rawData = row.toObject();
        
        // FUNÇÃO DE BUSCA: Procura o valor ignorando maiúsculas/espaços
        const buscarValor = (parteDoNome: string) => {
            const chaveEncontrada = Object.keys(rawData).find(key => 
                key.toLowerCase().includes(parteDoNome.toLowerCase())
            );
            return chaveEncontrada ? rawData[chaveEncontrada] : '';
        };

        const titulo = buscarValor('Conteudo') || buscarValor('Titulo'); // Procura Conteudo_Principal ou Titulo
        const dataIni = buscarValor('Data_Inicio') || buscarValor('Data Inicio');
        
        // ID: Titulo + Data
        const idGerado = (titulo || '') + (dataIni || '');

        return {
            id: idGerado,
            dataInicio: dataIni,
            dataFim: buscarValor('Data_Fim') || buscarValor('Data Fim'),
            titulo: titulo,
            conteudoSecundario: buscarValor('Secundario'),
            cor: buscarValor('Tipo_Evento') || buscarValor('Cor'),
            tipo: buscarValor('Tipo'),
            perfil: buscarValor('Perfil'),
            // AQUI ESTÁ A MÁGICA: Pega qualquer coluna que tenha "Link" no nome
            linkDrive: buscarValor('Link') || '' 
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

    // 2. Salvar na Tarefas (LÓGICA BLINDADA DO ÚLTIMO PASSO)
    const tipoNormalizado = data.tipo ? String(data.tipo).toLowerCase().trim() : '';
    
    if (tipoNormalizado === 'externo') {
      const tarefasSheet = doc.sheetsByTitle['Tarefas'];
      
      if (tarefasSheet) {
          await tarefasSheet.loadHeaderRow();
          const headers = tarefasSheet.headerValues;
          
          // Busca dinâmica de colunas
          const buscaColuna = (parte: string) => headers.find(h => h.toLowerCase().includes(parte.toLowerCase()));

          const novaLinha: any = {};
          const colBloco = buscaColuna('Bloco');
          const colTitulo = buscaColuna('Titulo');
          const colResp = buscaColuna('Responsavel');
          const colData = buscaColuna('Data');
          const colStatus = buscaColuna('Status');
          const colLink = buscaColuna('Link');
          const colNotif = buscaColuna('Notificar');
          const colChat = buscaColuna('Chat');

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
    
    // Busca inteligente também no delete
    const rowToDelete = rows.find(row => {
        const raw = row.toObject();
        // Recria a lógica de busca do GET
        const busca = (p: string) => { const k = Object.keys(raw).find(x => x.toLowerCase().includes(p.toLowerCase())); return k ? raw[k] : ''; };
        
        const idLinha = (busca('Conteudo') || busca('Titulo') || '') + (busca('Data_Inicio') || busca('Data Inicio') || '');
        return idLinha === data.id;
    });

    if (rowToDelete) {
        const raw = rowToDelete.toObject();
        const busca = (p: string) => { const k = Object.keys(raw).find(x => x.toLowerCase().includes(p.toLowerCase())); return k ? raw[k] : ''; };
        
        const tituloSalvo = busca('Conteudo') || busca('Titulo');
        const dataSalva = busca('Data_Inicio') || busca('Data Inicio');

        await rowToDelete.delete();

        // --- APAGAR DA TAREFA ---
        const tarefasSheet = doc.sheetsByTitle['Tarefas'];
        if (tarefasSheet) {
             await tarefasSheet.loadHeaderRow();
             const headers = tarefasSheet.headerValues;
             const buscaCol = (p: string) => headers.find(h => h.toLowerCase().includes(p.toLowerCase()));
             
             const colTitulo = buscaCol('Titulo');
             const colData = buscaCol('Data');

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
