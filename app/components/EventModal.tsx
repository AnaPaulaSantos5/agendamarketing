import React from 'react';
import { motion } from 'framer-motion';

export default function EventModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white p-6 rounded w-96"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
      >
        <h2 className="font-bold mb-4">Novo Evento</h2>
        <input type="text" placeholder="Título" className="w-full mb-2 p-2 border rounded" />
        <textarea placeholder="Conteúdo" className="w-full mb-2 p-2 border rounded" />
        <input type="text" placeholder="Link Drive" className="w-full mb-2 p-2 border rounded" />
        <input type="datetime-local" className="w-full mb-2 p-2 border rounded" />
        <button className="bg-yellow-500 text-white px-4 py-2 rounded mt-2" onClick={onClose}>
          Fechar
        </button>
      </motion.div>
    </motion.div>
  );
}