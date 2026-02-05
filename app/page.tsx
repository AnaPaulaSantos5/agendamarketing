"use client";

import React, { useState, useRef } from 'react';
import { Settings, ChevronDown, ChevronLeft, ChevronRight, X, Camera, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- CONFIGURAÇÃO DE PERFIS ---
const PERFIS = [
  { nome: "Confi", chatId: "12036302@g.us" },
  { nome: "Luiza", chatId: "4599992869@u.s" },
  { nome: "Júlio", chatId: "5541998877@c.us" },
  { nome: "Cecília", chatId: "5541887766@u.s" }
];

const CORES_PASTEL = ['#f5886c', '#1260c7', '#ffce0a', '#b8e1dd', '#d1c4e9', '#f8bbd0', '#e1f5fe'];

export default function AgendaPage() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);

  // --- ESTADO DO FORMULÁRIO ---
  const [form, setForm] = useState({
    id: '',
    inicio: '08:00',
    fim: '09:00',
    titulo: '', // Conteúdo Principal
    conteudoSecundario: '',
    linkDrive: '',
    perfil: PERFIS[0].nome,
    chatId: PERFIS[0].chatId,
    tipo: 'externo', // 'interno' | 'externo'
    cor: CORES_PASTEL[0]
  });

  // Atualiza ChatID automaticamente ao mudar o perfil
  const handlePerfilChange = (nome: string) => {
    const p = PERFIS.find(item => item.nome === nome);
    setForm({ ...form, perfil: nome, chatId: p?.chatId || '' });
  };

  const handleSalvar = () => {
    // Aqui você conectará com sua planilha depois
    console.log("Dados prontos para envio:", form);
    setShowEventModal(false);
  };

  const cardStyle: React.CSSProperties = { border: '2px solid black', borderRadius: '35px', padding: '25px', backgroundColor: 'white' };

  return (
    <div className="p-10 font-sans max-w-[1400px] mx-auto bg-white min-h-screen">
      
      {/* (Cabeçalho e Calendário Grid omitidos aqui para focar no Modal, mantenha os que já temos) */}
      <button onClick={() => setShowEventModal(true)} className="bg-black text-white p-4 rounded-full font-bold">Abrir Modal de Teste</button>

      <AnimatePresence>
        {showEventModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white border-[3px] border-black rounded-[50px] p-12 w-full max-w-2xl shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] relative overflow-y-auto max-h-[90vh] no-scrollbar"
            >
              <div className="flex justify-between items-center mb-10 border-b-4 border-black pb-4">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter">
                  {modoEdicao ? 'Editar Evento' : 'Novo Registro'}
                </h2>
                <X className="cursor-pointer hover:rotate-90 transition-transform" onClick={() => setShowEventModal(false)} />
              </div>

              <div className="space-y-8">
                {/* SELEÇÃO DE PERFIL E TIPO */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <p className="text-[10px] font-bold opacity-30 uppercase mb-2">Responsável (Perfil)</p>
                    <select 
                      value={form.perfil} 
                      onChange={(e) => handlePerfilChange(e.target.value)}
                      className="w-full border-2 border-black rounded-2xl p-3 font-bold bg-gray-50 outline-none"
                    >
                      {PERFIS.map(p => <option key={p.nome} value={p.nome}>{p.nome}</option>)}
                    </select>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold opacity-30 uppercase mb-2">Visibilidade</p>
                    <div className="flex border-2 border-black rounded-2xl overflow-hidden h-[52px]">
                      <button 
                        onClick={() => setForm({...form, tipo: 'externo'})}
                        className={`flex-1 font-bold text-xs uppercase ${form.tipo === 'externo' ? 'bg-blue-600 text-white' : 'bg-white text-black'}`}
                      >Externo</button>
                      <button 
                        onClick={() => setForm({...form, tipo: 'interno'})}
                        className={`flex-1 font-bold text-xs uppercase ${form.tipo === 'interno' ? 'bg-black text-white' : 'bg-white text-black'}`}
                      >Interno</button>
                    </div>
                  </div>
                </div>

                {/* HORÁRIOS (PERÍODO) */}
                <div className="flex gap-6 items-center bg-gray-50 p-6 rounded-[30px] border-2 border-black/5">
                  <div className="flex-1">
                    <p className="text-[10px] font-bold opacity-30 uppercase mb-1">Início</p>
                    <input type="time" value={form.inicio} onChange={e => setForm({...form, inicio: e.target.value})} className="bg-transparent text-2xl font-black outline-none w-full" />
                  </div>
                  <div className="w-10 h-[2px] bg-black/20 mt-4"></div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold opacity-30 uppercase mb-1">Término</p>
                    <input type="time" value={form.fim} onChange={e => setForm({...form, fim: e.target.value})} className="bg-transparent text-2xl font-black outline-none w-full" />
                  </div>
                </div>

                {/* CONTEÚDO PRINCIPAL (TÍTULO) */}
                <div className="border-b-2 border-black/10 pb-2">
                  <p className="text-[10px] font-bold opacity-30 uppercase mb-1">Conteúdo Principal (Título)</p>
                  <input 
                    placeholder="O que será postado?" 
                    className="w-full text-3xl font-bold italic outline-none bg-transparent uppercase"
                    value={form.titulo}
                    onChange={e => setForm({...form, titulo: e.target.value})}
                  />
                </div>

                {/* CONTEÚDO SECUNDÁRIO */}
                <div className="border-b-2 border-black/10 pb-2">
                  <p className="text-[10px] font-bold opacity-30 uppercase mb-1">Conteúdo Alternativo</p>
                  <textarea 
                    placeholder="Caso não consiga postar o principal..." 
                    className="w-full text-lg font-medium outline-none bg-transparent h-20 resize-none"
                    value={form.conteudoSecundario}
                    onChange={e => setForm({...form, conteudoSecundario: e.target.value})}
                  />
                </div>

                {/* LINK DRIVE E CHATID */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#fff9c4] border-2 border-black p-4 rounded-2xl shadow-[4px_4px_0px_black]">
                    <p className="text-[9px] font-bold opacity-40 uppercase">WhatsApp ID (Auto)</p>
                    <p className="font-mono text-sm truncate">{form.chatId}</p>
                  </div>
                  <div className="border-2 border-black p-4 rounded-2xl bg-white">
                    <p className="text-[9px] font-bold opacity-40 uppercase">Link do Drive</p>
                    <input 
                      placeholder="https://..." 
                      className="w-full text-xs outline-none bg-transparent overflow-hidden" 
                      value={form.linkDrive}
                      onChange={e => setForm({...form, linkDrive: e.target.value})}
                    />
                  </div>
                </div>

                {/* SELETOR DE CORES EXPANDIDO */}
                <div className="flex items-center justify-between pt-4">
                  <div className="flex gap-2 items-center flex-wrap">
                    {CORES_PASTEL.map(c => (
                      <div 
                        key={c} 
                        onClick={() => setForm({...form, cor: c})}
                        style={{ backgroundColor: c }} 
                        className={`w-8 h-8 rounded-full border-2 border-black cursor-pointer transition-transform ${form.cor === c ? 'scale-125 shadow-lg' : 'opacity-60 hover:opacity-100'}`}
                      />
                    ))}
                    <button className="w-8 h-8 rounded-full border-2 border-black border-dashed flex items-center justify-center hover:bg-gray-100">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* BOTÕES DE AÇÃO */}
                <div className="flex justify-between items-center pt-8 border-t-2 border-black/5 font-black italic uppercase tracking-widest text-lg">
                  <div className="flex gap-10">
                    <button onClick={handleSalvar} className="hover:underline decoration-yellow-400 decoration-8">Salvar</button>
                    {modoEdicao && <button className="text-red-500">Excluir</button>}
                  </div>
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
