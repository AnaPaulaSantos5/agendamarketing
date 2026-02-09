import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, serviceAccountAuth);

// --- FUNÇÃO QUE CAÇA O DADO NÃO IMPORTA O NOME DA COLUNA ---
function encontrarValorInteligente(linhaRaw: any, palavrasChave: string[]) {
    // Transforma a linha do Google num objeto simples do Javascript
    const dados = linhaRaw.toObject();
    const chaves = Object.keys(dados);

    // 1. Tenta achar pelo nome da coluna (ex: procura algo que tenha "Link" no nome)
    for (const palavra of palavrasChave) {
        const chaveEncontrada = chaves.find(chave => 
            chave.toLowerCase().includes(palavra.toLowerCase())
        );
        if (chaveEncontrada && dados[chaveEncontrada]) {
            return dados[chaveEncontrada];
        }
    }
    return '';
}

export async function GET() {
  try {
    await doc.loadInfo();
    const agendaSheet = doc.sheetsByTitle['Agenda'];
    const rowsAgenda = await agendaSheet.getRows();
    
    // --- AQUI ACONTECE A MÁGICA DO GET ---
    const events = rowsAgenda.map(row => {
        
        // Puxa os dados usando a busca inteligente
        const titulo = encontrarValorInteligente(row, ['Conteudo', 'Titulo']);
        const dataIni = encontrarValorInteligente(row, ['Data_Inicio', 'Data Inicio', 'Inicio']);
        
        // Tenta achar o link procurando por "Link", "Drive" ou "Url"
        const linkAchado = encontrarValorInteligente(row, ['Link', 'Drive', 'Url']);

        return {
            id: (titulo || '') + (dataIni || ''), // ID gerado na hora
            dataInicio: dataIni,
            dataFim: encontrarValorInteligente(row, ['Data_Fim', 'Data Fim', 'Termino']),
            titulo: titulo,
            conteudoSecundario: encontrarValorInteligente(row, ['Secundario', 'Descricao']),
            cor: encontrarValorInteligente(row, ['Tipo_Evento', 'Cor']),
            tipo: encontrarValorInteligente(row, ['Tipo']),
            perfil: encontrarValorInteligente(row, ['Perfil', 'Responsavel']),
            
            // O Link agora VAI vir, não importa o nome da coluna
            linkDrive: linkAchado 
        };
    });

    // --- PERFIS ---
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
    console.error("❌ Erro Geral API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- MANTIVE SEU POST QUE JÁ ESTÁ FUNCIONANDO ---
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

    // 2. Salvar na Tarefas (Se for externo)
    if (data.tipo && String(data.tipo).toLowerCase().trim() === 'externo') {
      const tarefasSheet = doc.sheetsByTitle['Tarefas'];
      if (tarefasSheet) {
          // Grava por posição (Array) para garantir que salva certo
          // Bloco_ID | Titulo | Responsavel | Data | Status | LinkDrive | Notificar | ChatId
          await tarefasSheet.addRow([
             `ID${Date.now()}`,
             data.titulo,
             data.perfil,
             data.dataInicio,
             'Pendente',
             data.linkDrive || '',
             'Sim',
             data.chatId
          ]);
      }
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- MANTIVE SEU DELETE ---
export async function DELETE(req: NextRequest) {
  try {
    const data = await req.json(); 
    await doc.loadInfo();
    const agendaSheet = doc.sheetsByTitle['Agenda'];
    const rows = await agendaSheet.getRows();
    
    const rowToDelete = rows.find(row => {
        const titulo = encontrarValorInteligente(row, ['Conteudo', 'Titulo']);
        const dataIni = encontrarValorInteligente(row, ['Data_Inicio', 'Data Inicio']);
        return ((titulo || '') + (dataIni || '')) === data.id;
    });

    if (rowToDelete) {
        const tituloSalvo = encontrarValorInteligente(rowToDelete, ['Conteudo', 'Titulo']);
        const dataSalva = encontrarValorInteligente(rowToDelete, ['Data_Inicio', 'Data Inicio']);
        await rowToDelete.delete();

        // Tenta apagar da Tarefa também
        const tarefasSheet = doc.sheetsByTitle['Tarefas'];
        if (tarefasSheet) {
             const tarefasRows = await tarefasSheet.getRows();
             const tarefaToDelete = tarefasRows.find(row => {
                 // Busca simples na tarefa
                 const tTitulo = row.get('Titulo') || row.get(' Titulo'); 
                 const tData = row.get('Data') || row.get(' Data');
                 return tTitulo === tituloSalvo && tData === dataSalva;
             });
             if (tarefaToDelete) await tarefaToDelete.delete();
        }
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
