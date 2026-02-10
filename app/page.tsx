"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Settings, ChevronDown, ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Trash2, MessageSquare, LogOut, Send, CheckCircle2, XCircle, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CORES_PASTEL = ['#f5886c', '#1260c7', '#ffce0a', '#b8e1dd', '#d1c4e9', '#f8bbd0', '#e1f5fe', '#c5e1a5', '#ffe082'];

export default function AgendaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [eventos, setEventos] = useState<any[]>([]);
  const [perfis, setPerfis] = useState<any[]>([]);
  const [feed, setFeed] = useState<any[]>([]);
  const [perfilAtivo, setPerfilAtivo] = useState<any>(null);
  const [dataAtiva, setDataAtiva] = useState(new Date(2026, 1, 4)); 
  const [showEventModal, setShowEventModal] = useState(false);
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [showPerfilSelector, setShowPerfilSelector] = useState(false);
  const [capaImage, setCapaImage] = useState<string | null>(null);
  const [enviandoZap, setEnviandoZap] = useState(false);
  const [eventosDoDiaSelecionado, setEventosDoDiaSelecionado] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tempEvento, setTempEvento] = useState({
    id: '', dataInicio: '', dataTermino: '', titulo: '', conteudoSecundario: '', 
    linkDrive: '', cor: CORES_PASTEL[0], perfil: '', chatId: '', tipo: 'externo',
    horaInicio: '08:00', horaFim: '09:00'
  });

  const carregarDados = async () => {
    try {
      // --- TRAVA DE SEGURANÇA 2: NO-STORE NO FRONTEND ---
      const res = await fetch('/api/agenda', { 
          cache: 'no-store',
          next: { revalidate: 0 }
      });
      
      const data = await res.json();
      if (data.events) {
          console.log("🔥 Eventos Frescos (Verifique o Link):", data.events);
          setEventos(data.events);
      }
      if (data.feed) setFeed(data.feed);
      if (data.perfis) {
        setPerfis(data.perfis);
        if (!perfilAtivo) {
            const logado = data.perfis.find((p: any) => p.email?.toLowerCase() === session?.user?.email?.toLowerCase());
            setPerfilAtivo(logado || data.perfis[0]);
        }
      }
    } catch (e) { console.error("Erro ao carregar dados:", e); }
  };

  useEffect(() => {
    if (status === "unauthenticated") { router.replace("/login"); return; }
    const savedCapa = localStorage.getItem('agenda_capa_marketing');
    if (savedCapa) setCapaImage(savedCapa);
    if (status === "authenticated") {
        carregarDados();
        const interval = setInterval(carregarDados, 15000); 
        return () => clearInterval(interval);
    }
  }, [status, session, router]);

  const handleDispararWhatsApp = async () => {
    const destino = tempEvento.chatId || perfilAtivo?.chatId;
    if (!destino) return alert("Selecione um perfil com ChatID válido!");
    
    setEnviandoZap(true);
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: perfilAtivo.nome,
          responsavelChatId: destino,
          conteudoPrincipal: tempEvento.titulo,
          conteudoSecundario: tempEvento.conteudoSecundario,
          linkDrive: tempEvento.linkDrive
        })
      });
      if (res.ok) {
        alert("🚀 WhatsApp enviado com sucesso!");
        carregarDados();
      } else { 
        const errData = await res.json();
        alert("Erro ao enviar: " + (errData.error || "Erro no servidor")); 
      }
    } catch (e) { alert("Erro de conexão com o servidor"); } finally { setEnviandoZap(false); }
  };

  const handleSalvar = async () => {
    // 1. Apaga o antigo se for edição
    if (tempEvento.id) {
        try {
            console.log("Editando: Apagando anterior...");
            await fetch('/api/agenda', { 
                method: 'DELETE', 
                body: JSON.stringify({ id: tempEvento.id }) 
            });
        } catch (e) { console.error(e); }
    }

    // 2. Cria o novo
    const payload = { 
      ...tempEvento, 
      dataInicio: `${tempEvento.dataInicio} ${tempEvento.horaInicio}`, 
      dataFim: `${tempEvento.dataTermino} ${tempEvento.horaFim}` 
    };
    
    const res = await fetch('/api/agenda', { method: 'POST', body: JSON.stringify(payload) });
    
    if (res.ok) { 
        alert("Gravado com sucesso!"); 
        setShowEventModal(false); 
        // Pequeno delay para garantir que o Google Sheets processou
        setTimeout(() => carregarDados(), 1000); 
    } else {
        alert("Erro ao gravar.");
    }
  };

  const handleExcluir = async () => {
    if (!tempEvento.id) return;
    if (!confirm("Tem certeza que deseja excluir este evento?")) return;

    try {
        const res = await fetch('/api/agenda', { 
            method: 'DELETE', 
            body: JSON.stringify({ id: tempEvento.id }) 
        });
        if (res.ok) {
            alert("Evento excluído!");
            setShowEventModal(false);
            setTimeout(() => carregarDados(), 1000);
        } else {
            alert("Erro ao excluir.");
        }
    } catch (e) { alert("Erro de conexão."); }
  };

  const meses = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
  const diasSemana = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
  const diasNoMes = useMemo(() => new Date(dataAtiva.getFullYear(), dataAtiva.getMonth() + 1, 0).getDate(), [dataAtiva]);
  const primeiroDiaSemana = useMemo(() => new Date(dataAtiva.getFullYear(), dataAtiva.getMonth(), 1).getDay(), [dataAtiva]);

  const isDiaNoPeriodo = (diaStr: string, ini: string, fim: string) => {
    const d = new Date(diaStr + 'T00:00:00');
    const i = new Date(ini + 'T00:00:00');
    const f = new Date(fim + 'T00:00:00');
    return d >= i && d <= f;
  };

  const handleDiaClick = (dia: number) => {
    const dataStr = `${dataAtiva.getFullYear()}-${String(dataAtiva.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    setDataAtiva(new Date(dataAtiva.getFullYear(), dataAtiva.getMonth(), dia));
    const eventosDoDia = eventos.filter(e => isDiaNoPeriodo(dataStr, e.dataInicio?.split(' ')[0], e.dataFim?.split(' ')[0]));
    setEventosDoDiaSelecionado(eventosDoDia);
    setTempEvento({ 
        id: '', dataInicio: dataStr, dataTermino: dataStr, titulo: '', 
        conteudoSecundario: '', perfil: perfilAtivo?.nome || '', 
        chatId: perfilAtivo?.chatId || '', linkDrive: '', 
        cor: CORES_PASTEL[0], tipo: 'externo', horaInicio: '08:00', horaFim: '09:00'
    });
    setShowEventModal(true);
  };

  const handleEventoClick = (e: React.MouseEvent, evento: any) => {
    e.stopPropagation(); 
    console.log("Abrindo evento:", evento);
    setTempEvento({ 
        id: evento.id, 
        titulo: evento.titulo, 
        dataInicio: evento.dataInicio?.split(' ')[0], 
        dataTermino: evento.dataFim?.split(' ')[0], 
        horaInicio: evento.dataInicio?.split(' ')[1] || '08:00',
        horaFim: evento.dataFim?.split(' ')[1] || '09:00',
        cor: evento.cor, 
        tipo: evento.tipo || 'externo', 
        linkDrive: evento.linkDrive || '', 
        conteudoSecundario: evento.conteudoSecundario || '', 
        perfil: evento.perfil || perfilAtivo?.nome || '', 
        chatId: evento.chatId || perfilAtivo?.chatId || '' 
    });
    const dataStr = evento.dataInicio?.split(' ')[0];
    const eventosDoDia = eventos.filter(ev => isDiaNoPeriodo(dataStr, ev.dataInicio?.split(' ')[0], ev.dataFim?.split(' ')[0]));
    setEventosDoDiaSelecionado(eventosDoDia);
    setShowEventModal(true);
  };

  const selecionarEventoDaLista = (evento: any) => {
      setTempEvento({ 
        id: evento.id, titulo: evento.titulo, 
        dataInicio: evento.dataInicio?.split(' ')[0], 
        dataTermino: evento.dataFim?.split(' ')[0], 
        horaInicio: evento.dataInicio?.split(' ')[1] || '08:00',
        horaFim: evento.dataFim?.split(' ')[1] || '09:00',
        cor: evento.cor, tipo: evento.tipo || 'externo', 
        linkDrive: evento.linkDrive || '', conteudoSecundario: evento.conteudoSecundario || '', 
        perfil: evento.perfil || perfilAtivo?.nome || '',
        chatId: evento.chatId || perfilAtivo?.chatId || '' 
    });
  };

  if (status === "loading") return <div className="h-screen grid place-items-center font-black text-2xl">Sincronizando...</div>;

  return (
    <div className="flex h-screen bg-white font-sans overflow-hidden">
      <aside className="w-80 border-r-2 border-black p-6 overflow-y-auto no-scrollbar bg-gray-50/50 flex flex-col">
        <h2 className="text-2xl font-black uppercase tracking-tighter mb-6 flex items-center gap-2"><MessageSquare size={24} /> Atividade</h2>
        <div className="space-y-4">
          {feed.map((item, idx) => (
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} key={idx} className="bg-white border-2 border-black p-4 rounded-3xl shadow-[4px_4px_0px_black]">
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border border-black ${item.Tipo === 'ENVIO' ? 'bg-blue-100' : 'bg-green-100'}`}>{item.Tipo}</span>
                <span className="text-[8px] font-bold opacity-40">{item.Data?.split(' ')[1]}</span>
              </div>
              <p className="font-black text-xs uppercase truncate">{item.Nome}</p>
              {item.Tipo === 'RESPOSTA' ? (
                <div className="mt-2 flex items-center gap-2 text-sm font-bold">
                  {item.Resposta === 'SIM' ? <CheckCircle2 size={16} className="text-green-600" /> : <XCircle size={16} className="text-red-600" />}
                  <span>{item.Resposta === 'SIM' ? 'Confirmou' : 'Recusou'}</span>
                </div>
              ) : <p className="text-[10px] opacity-60 mt-1 italic truncate">"{item.Evento}"</p>}
            </motion.div>
          ))}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 no-scrollbar bg-white relative">
        <div className="relative mb-10 h-72 rounded-[40px] border-2 border-black overflow-hidden flex items-end p-8">
          <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const r = new FileReader(); r.onloadend = () => { localStorage.setItem('agenda_capa_marketing', r.result as string); setCapaImage(r.result as string); }; r.readAsDataURL(file); } }} />
          <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 cursor-pointer z-0 bg-gray-50 flex items-center justify-center text-gray-400 font-bold">{capaImage ? <img src={capaImage} className="w-full h-full object-cover" /> : "Adicionar Capa"}</div>
          <div className="relative z-10 flex items-center justify-between w-full">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-2 border-black bg-white flex items-center justify-center text-4xl font-black shadow-lg uppercase overflow-hidden">{session?.user?.image ? <img src={session.user.image} alt="P" /> : (perfilAtivo?.nome?.charAt(0) || 'A')}</div>
                <button onClick={() => setShowPerfilModal(true)} className="absolute -top-1 -left-1 bg-white border-2 border-black rounded-full p-2 hover:bg-black hover:text-white transition-all shadow-md"><Settings size={18} /></button>
              </div>
              <div className="bg-white border-2 border-black px-6 py-2 rounded-2xl flex items-center gap-4 cursor-pointer shadow-md" onClick={() => setShowPerfilSelector(!showPerfilSelector)}>
                <div><h3 className="text-xl font-black uppercase leading-none">{perfilAtivo?.nome || "Perfil"}</h3><p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">{session?.user?.email}</p></div>
                <ChevronDown className="opacity-40" />
              </div>
            </div>
            <button onClick={() => signOut({ callbackUrl: '/login' })} className="bg-white border-2 border-black p-4 rounded-2xl hover:bg-red-50 flex items-center gap-2 font-bold uppercase text-xs shadow-md"><LogOut size={18} /> Sair</button>
          </div>
          {showPerfilSelector && (
            <motion.div initial={{opacity:0, y: 10}} animate={{opacity:1, y: 0}} className="absolute bottom-28 left-40 bg-white border-2 border-black rounded-2xl p-4 shadow-xl w-48 z-50">
              {perfis.map(p => <div key={p.nome} onClick={() => { setPerfilAtivo(p); setShowPerfilSelector(false); }} className="p-2 hover:bg-gray-100 rounded-lg font-bold cursor-pointer border-b last:border-0">{p.nome}</div>)}
            </motion.div>
          )}
        </div>

        <div className="flex justify-between items-center mb-8 border-b-2 border-black pb-4">
          <div className="flex items-center gap-4">
            <ChevronLeft size={60} className="cursor-pointer hover:scale-110" onClick={() => setDataAtiva(new Date(dataAtiva.getFullYear(), dataAtiva.getMonth() - 1, 1))} />
            <h1 className="text-8xl font-black uppercase tracking-tighter leading-none">{meses[dataAtiva.getMonth()]}</h1>
          </div>
          <h1 className="text-8xl font-light tracking-tighter leading-none">{dataAtiva.getFullYear()}</h1>
          <ChevronRight size={60} className="cursor-pointer hover:scale-110" onClick={() => setDataAtiva(new Date(dataAtiva.getFullYear(), dataAtiva.getMonth() + 1, 1))} />
        </div>

        <div className="grid grid-cols-7 gap-4">
          {diasSemana.map(d => <div key={d} className="text-center font-black opacity-20 text-xs uppercase">{d}</div>)}
          {Array.from({ length: primeiroDiaSemana }).map((_, i) => <div key={i} />)}
          {Array.from({ length: diasNoMes }, (_, i) => {
            const dia = i + 1;
            const key = `${dataAtiva.getFullYear()}-${String(dataAtiva.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
            const evs = eventos.filter(e => isDiaNoPeriodo(key, e.dataInicio?.split(' ')[0], e.dataFim?.split(' ')[0]));
            return (
              <div key={dia} onClick={() => handleDiaClick(dia)} className={`h-32 border-2 border-black rounded-[30px] p-4 cursor-pointer transition-all hover:scale-105 flex flex-col justify-between shadow-sm ${dataAtiva.getDate() === dia ? 'bg-orange-50' : 'bg-white'}`}>
                <span className="text-2xl font-black tracking-tighter">{dia}</span>
                <div className="flex gap-1 flex-wrap content-start">
                    {evs.map((ev, idx) => (
                        <div key={idx} onClick={(e) => handleEventoClick(e, ev)} className="w-3 h-3 rounded-full border border-black shadow-sm cursor-pointer hover:scale-150 transition-transform" style={{ backgroundColor: ev.cor }} />
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <AnimatePresence>
        {showPerfilModal && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white border-2 border-black rounded-[50px] p-12 w-full max-w-xl shadow-2xl relative">
              <X className="absolute top-8 right-8 cursor-pointer" onClick={() => setShowPerfilModal(false)} />
              <h2 className="text-4xl font-black uppercase mb-8 border-b-2 border-black pb-4">Configurar Perfil</h2>
              <div className="space-y-6">
                <div><p className="text-[10px] font-black uppercase opacity-30 mb-2">Nome</p><input type="text" value={perfilAtivo?.nome || ''} onChange={(e) => setPerfilAtivo({...perfilAtivo, nome: e.target.value})} className="w-full border-2 border-black rounded-2xl p-4 font-bold bg-white focus:bg-blue-50 outline-none" /></div>
                <div><p className="text-[10px] font-black uppercase opacity-30 mb-2">WhatsApp ChatID</p><div className="flex items-center gap-3 border-2 border-black rounded-2xl p-4 bg-white focus-within:bg-blue-50"><MessageSquare size={20} className="opacity-30" /><input type="text" value={perfilAtivo?.chatId || ''} onChange={(e) => setPerfilAtivo({...perfilAtivo, chatId: e.target.value})} className="w-full bg-transparent font-mono font-bold outline-none" /></div></div>
                <button onClick={() => { alert("Perfil alterado localmente!"); setShowPerfilModal(false); }} className="w-full bg-black text-white p-5 rounded-3xl font-black uppercase hover:scale-[1.02] transition-all">Confirmar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEventModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
            <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="bg-white border-2 border-black rounded-[60px] p-12 w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-4">
                <h2 className="text-4xl font-black uppercase leading-none">{tempEvento.id ? 'Editar Registro' : 'Novo Registro'}</h2>
                <div className="flex gap-2">{CORES_PASTEL.map(c => <div key={c} onClick={() => setTempEvento({...tempEvento, cor: c})} className={`w-7 h-7 rounded-full border-2 border-black cursor-pointer ${tempEvento.cor === c ? 'scale-125' : 'opacity-30'}`} style={{ backgroundColor: c }} />)}</div>
                <X className="cursor-pointer" onClick={() => setShowEventModal(false)} />
              </div>

              {eventosDoDiaSelecionado.length > 0 && (
                  <div className="mb-8 flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border-2 border-black/5 overflow-x-auto">
                      <span className="text-[10px] font-black uppercase opacity-40 whitespace-nowrap">Eventos do dia:</span>
                      {eventosDoDiaSelecionado.map((ev, idx) => (
                          <div key={idx} onClick={() => selecionarEventoDaLista(ev)} className={`flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer border transition-all ${tempEvento.id === ev.id ? 'bg-white border-black shadow-[2px_2px_0px_black]' : 'border-transparent hover:bg-white'}`}>
                              <div className="w-3 h-3 rounded-full border border-black" style={{backgroundColor: ev.cor}} />
                              <span className="text-xs font-bold truncate max-w-[100px]">{ev.titulo}</span>
                          </div>
                      ))}
                      <button onClick={() => setTempEvento({ ...tempEvento, id: '', titulo: '', conteudoSecundario: '', linkDrive: '' })} className="w-8 h-8 flex items-center justify-center bg-black text-white rounded-full hover:scale-110 transition-transform"><Plus size={16} /></button>
                  </div>
              )}
              
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <select value={tempEvento.perfil} onChange={e => { const p = perfis.find(it => it.nome === e.target.value); setTempEvento({...tempEvento, perfil: e.target.value, chatId: p?.chatId || ''}); }} className="border-2 border-black rounded-2xl p-4 font-bold bg-gray-50 outline-none uppercase">{perfis.map(p => <option key={p.nome} value={p.nome}>{p.nome}</option>)}</select>
                  <div className="flex border-2 border-black rounded-2xl overflow-hidden font-black text-xs h-[60px]">
                    <button onClick={() => setTempEvento({...tempEvento, tipo: 'externo'})} className={`flex-1 ${tempEvento.tipo === 'externo' ? 'bg-blue-600 text-white' : 'bg-white'}`}>EXTERNO</button>
                    <button onClick={() => setTempEvento({...tempEvento, tipo: 'interno'})} className={`flex-1 ${tempEvento.tipo === 'interno' ? 'bg-black text-white' : 'bg-white'}`}>INTERNO</button>
                  </div>
                </div>
                <div className="bg-gray-50 p-8 rounded-[40px] border-2 border-black/5 grid grid-cols-2 gap-8">
                  <div className="space-y-4"><p className="text-[10px] font-black uppercase opacity-30 flex items-center gap-1"><CalendarIcon size={12}/> Início</p><input type="date" value={tempEvento.dataInicio} onChange={e => setTempEvento({...tempEvento, dataInicio: e.target.value})} className="text-xl font-black bg-transparent w-full border-b border-black outline-none" /><input type="time" value={tempEvento.horaInicio} onChange={e => setTempEvento({...tempEvento, horaInicio: e.target.value})} className="text-3xl font-black bg-transparent w-full outline-none" /></div>
                  <div className="space-y-4"><p className="text-[10px] font-black uppercase opacity-30 flex items-center gap-1"><CalendarIcon size={12}/> Término</p><input type="date" value={tempEvento.dataTermino} onChange={e => setTempEvento({...tempEvento, dataTermino: e.target.value})} className="text-xl font-black bg-transparent w-full border-b border-black outline-none" /><input type="time" value={tempEvento.horaFim} onChange={e => setTempEvento({...tempEvento, horaFim: e.target.value})} className="text-3xl font-black bg-transparent w-full outline-none" /></div>
                </div>
                <div className="space-y-6"><input value={tempEvento.titulo} onChange={e => setTempEvento({...tempEvento, titulo: e.target.value})} className="w-full text-4xl font-black bg-transparent outline-none uppercase border-b-2 border-black/10 py-2" placeholder="CONTEÚDO PRINCIPAL" /><textarea value={tempEvento.conteudoSecundario} onChange={e => setTempEvento({...tempEvento, conteudoSecundario: e.target.value})} className="w-full text-xl font-bold bg-transparent outline-none h-24 resize-none" placeholder="Conteúdo Alternativo..." /></div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-yellow-100 border-2 border-black p-4 rounded-2xl shadow-[5px_5px_0px_black] overflow-hidden"><p className="text-[9px] font-black uppercase opacity-40">WhatsApp ChatID</p><p className="font-mono text-xs truncate underline decoration-blue-500">{tempEvento.chatId}</p></div>
                  <div className="border-2 border-black p-4 rounded-2xl flex flex-col justify-center bg-white shadow-[5px_5px_0px_black]"><p className="text-[9px] font-black uppercase opacity-40 mb-1">Link Drive</p><input placeholder="https://..." value={tempEvento.linkDrive} onChange={e => setTempEvento({...tempEvento, linkDrive: e.target.value})} className="w-full font-bold text-xs outline-none bg-transparent" /></div>
                </div>
                <div className="flex justify-between items-center pt-8 border-t-2 border-black font-black text-2xl uppercase tracking-tighter">
                  <div className="flex gap-4">
                    <button onClick={handleSalvar} className="hover:underline decoration-yellow-400 decoration-[12px]">Gravar</button>
                    {tempEvento.id && <button onClick={handleExcluir} className="text-red-500 hover:scale-110"><Trash2 size={24}/></button>}
                    <button onClick={handleDispararWhatsApp} disabled={enviandoZap} className={`flex items-center gap-2 transition-all ${enviandoZap ? 'opacity-20' : 'hover:underline decoration-green-400 decoration-[12px]'}`}><Send size={24} /> {enviandoZap ? '...' : 'Disparar'}</button>
                  </div>
                  <button onClick={() => setShowEventModal(false)} className="opacity-20 uppercase">Voltar</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
