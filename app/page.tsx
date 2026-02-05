"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Settings, ChevronDown, ChevronLeft, ChevronRight, X, Camera, Plus, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CORES_PASTEL = ['#f5886c', '#1260c7', '#ffce0a', '#b8e1dd', '#d1c4e9', '#f8bbd0', '#e1f5fe'];

export default function AgendaPage() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [perfis, setPerfis] = useState<any[]>([]);
  const [dataAtiva, setDataAtiva] = useState(new Date(2026, 1, 4)); 
  const [showEventModal, setShowEventModal] = useState(false);
  const [capaImage, setCapaImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tempEvento, setTempEvento] = useState({
    id: '', dataKey: '', titulo: '', conteudoSecundario: '', linkDrive: '',
    cor: CORES_PASTEL[0], perfil: '', chatId: '', tipo: 'externo',
    horaInicio: '08:00', horaFim: '09:00', dataTermino: '2026-02-04'
  });

  // Carregar dados da Planilha ao iniciar
  useEffect(() => {
    fetch('/api/agenda')
      .then(res => res.json())
      .then(data => {
        if (data.events) setEventos(data.events);
        if (data.perfis) {
          setPerfis(data.perfis);
          setTempEvento(prev => ({ ...prev, perfil: data.perfis[0].nome, chatId: data.perfis[0].chatId }));
        }
      });
  }, []);

  const meses = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
  const diasSemana = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
  const diasNoMes = useMemo(() => new Date(dataAtiva.getFullYear(), dataAtiva.getMonth() + 1, 0).getDate(), [dataAtiva]);
  const primeiroDiaSemana = useMemo(() => new Date(dataAtiva.getFullYear(), dataAtiva.getMonth(), 1).getDay(), [dataAtiva]);

  const handleDiaClick = (dia: number) => {
    const dataStr = `${dataAtiva.getFullYear()}-${String(dataAtiva.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    setDataAtiva(new Date(dataAtiva.getFullYear(), dataAtiva.getMonth(), dia));
    setTempEvento(prev => ({ ...prev, dataKey: dataStr, dataTermino: dataStr, id: '' }));
    setShowEventModal(true);
  };

  const handleSalvar = async () => {
    const payload = {
      dataInicio: `${tempEvento.dataKey} ${tempEvento.horaInicio}`,
      dataFim: `${tempEvento.dataTermino} ${tempEvento.horaFim}`,
      titulo: tempEvento.titulo,
      conteudoSecundario: tempEvento.conteudoSecundario,
      linkDrive: tempEvento.linkDrive,
      perfil: tempEvento.perfil,
      chatId: tempEvento.chatId,
      tipo: tempEvento.tipo,
      cor: tempEvento.cor
    };

    const res = await fetch('/api/agenda', { method: 'POST', body: JSON.stringify(payload) });
    if (res.ok) {
      setShowEventModal(false);
      window.location.reload(); // Recarrega para puxar o novo evento
    }
  };

  return (
    <div className="p-5 max-w-[1400px] mx-auto bg-white min-h-screen font-sans">
      
      {/* CAPA NEO-BRUTALISTA */}
      <div className="relative mb-10 h-80 rounded-[40px] border-[3px] border-black overflow-hidden flex items-end p-8 shadow-[10px_10px_0px_black]">
        <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const r = new FileReader();
            r.onloadend = () => setCapaImage(r.result as string);
            r.readAsDataURL(file);
          }
        }} />
        <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 cursor-pointer z-0 bg-gray-50 flex items-center justify-center">
          {capaImage ? <img src={capaImage} className="w-full h-full object-cover" /> : <Camera size={48} className="text-gray-200" />}
        </div>
        
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-24 h-24 rounded-full border-4 border-black bg-white flex items-center justify-center text-4xl font-black shadow-xl">A</div>
          <div className="bg-white border-[3px] border-black px-6 py-2 rounded-2xl shadow-[5px_5px_0px_black]">
            <h3 className="text-2xl font-black italic uppercase">Agenda Marketing</h3>
          </div>
        </div>
      </div>

      {/* TITULO E CALENDÁRIO GRID */}
      <div className="flex justify-between items-center mb-8 border-b-4 border-black pb-4">
        <div className="flex items-center gap-4">
          <ChevronLeft size={60} className="cursor-pointer" onClick={() => setDataAtiva(new Date(dataAtiva.getFullYear(), dataAtiva.getMonth() - 1, 1))} />
          <h1 className="text-8xl font-black italic uppercase tracking-tighter">{meses[dataAtiva.getMonth()]}</h1>
        </div>
        <h1 className="text-8xl font-light opacity-10">{dataAtiva.getFullYear()}</h1>
        <ChevronRight size={60} className="cursor-pointer" onClick={() => setDataAtiva(new Date(dataAtiva.getFullYear(), dataAtiva.getMonth() + 1, 1))} />
      </div>

      <div className="grid grid-cols-7 gap-4">
        {diasSemana.map(d => <div key={d} className="text-center font-black opacity-20 text-xs uppercase">{d}</div>)}
        {Array.from({ length: primeiroDiaSemana }).map((_, i) => <div key={i} />)}
        {Array.from({ length: diasNoMes }, (_, i) => {
          const dia = i + 1;
          const key = `${dataAtiva.getFullYear()}-${String(dataAtiva.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
          const temEvento = eventos.find(e => e.dataInicio.startsWith(key));
          return (
            <div key={dia} onClick={() => handleDiaClick(dia)} className={`h-36 border-2 border-black rounded-[30px] p-4 cursor-pointer transition-all hover:scale-105 flex flex-col justify-between ${dataAtiva.getDate() === dia ? 'bg-orange-50 border-orange-500 shadow-lg' : 'bg-white'}`}>
              <span className="text-2xl font-black italic">{dia}</span>
              {temEvento && <div className="w-4 h-4 rounded-full border border-black" style={{ backgroundColor: temEvento.cor }} />}
            </div>
          );
        })}
      </div>

      {/* MODAL FLUTUANTE DE COMANDO */}
      <AnimatePresence>
        {showEventModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/10 backdrop-blur-md p-4">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white border-[4px] border-black rounded-[60px] p-12 w-full max-w-2xl shadow-[30px_30px_0px_rgba(0,0,0,1)] max-h-[90vh] overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-center mb-10 border-b-4 border-black pb-4">
                <h2 className="text-4xl font-black italic uppercase italic tracking-tighter">Novo Evento</h2>
                <X className="cursor-pointer" onClick={() => setShowEventModal(false)} />
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <select value={tempEvento.perfil} onChange={e => {
                    const p = perfis.find(it => it.nome === e.target.value);
                    setTempEvento({...tempEvento, perfil: e.target.value, chatId: p?.chatId || ''});
                  }} className="border-2 border-black rounded-2xl p-4 font-bold bg-gray-50 outline-none">
                    {perfis.map(p => <option key={p.nome} value={p.nome}>{p.nome}</option>)}
                  </select>
                  <div className="flex border-2 border-black rounded-2xl overflow-hidden font-black text-xs h-[58px]">
                    <button onClick={() => setTempEvento({...tempEvento, tipo: 'externo'})} className={`flex-1 ${tempEvento.tipo === 'externo' ? 'bg-blue-600 text-white' : 'bg-white'}`}>EXTERNO</button>
                    <button onClick={() => setTempEvento({...tempEvento, tipo: 'interno'})} className={`flex-1 ${tempEvento.tipo === 'interno' ? 'bg-black text-white' : 'bg-white'}`}>INTERNO</button>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-[40px] border-2 border-black/5 grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-black opacity-30 uppercase flex items-center gap-1 mb-2"><Clock size={12}/> Horário Início</p>
                    <input type="time" value={tempEvento.horaInicio} onChange={e => setTempEvento({...tempEvento, horaInicio: e.target.value})} className="text-3xl font-black bg-transparent outline-none w-full" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black opacity-30 uppercase flex items-center gap-1 mb-2"><Clock size={12}/> Horário Fim</p>
                    <input type="time" value={tempEvento.horaFim} onChange={e => setTempEvento({...tempEvento, horaFim: e.target.value})} className="text-3xl font-black bg-transparent outline-none w-full" />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="border-b-4 border-black/10">
                    <p className="text-[10px] font-black opacity-30 uppercase">Conteúdo Principal</p>
                    <input value={tempEvento.titulo} onChange={e => setTempEvento({...tempEvento, titulo: e.target.value})} className="w-full text-4xl font-black italic bg-transparent outline-none uppercase placeholder:opacity-10" placeholder="Título da Postagem" />
                  </div>
                  <div className="border-b-4 border-black/10">
                    <p className="text-[10px] font-black opacity-30 uppercase">Conteúdo Secundário</p>
                    <textarea value={tempEvento.conteudoSecundario} onChange={e => setTempEvento({...tempEvento, conteudoSecundario: e.target.value})} className="w-full text-xl font-bold bg-transparent outline-none h-24 resize-none" placeholder="Texto alternativo..." />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 bg-yellow-100 border-2 border-black p-4 rounded-2xl shadow-[5px_5px_0px_black] overflow-hidden">
                    <p className="text-[9px] font-black uppercase opacity-40">ChatID</p>
                    <p className="font-mono text-xs truncate underline">{tempEvento.chatId}</p>
                  </div>
                  <input placeholder="Link do Drive" value={tempEvento.linkDrive} onChange={e => setTempEvento({...tempEvento, linkDrive: e.target.value})} className="flex-1 border-2 border-black rounded-2xl p-4 font-bold text-xs outline-none" />
                </div>

                <div className="flex justify-between items-center pt-8 border-t-4 border-black font-black italic text-2xl uppercase tracking-tighter">
                  <button onClick={handleSalvar} className="hover:underline decoration-yellow-400 decoration-[12px]">Salvar na Planilha</button>
                  <button onClick={() => setShowEventModal(false)} className="opacity-20 hover:opacity-100 transition-opacity">Fechar</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
