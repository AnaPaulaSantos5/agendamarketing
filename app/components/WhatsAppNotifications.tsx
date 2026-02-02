import React from 'react';
import { motion } from 'framer-motion';

export default function WhatsAppNotifications() {
  const notifications = ['Mensagem recebida', 'Mensagem enviada'];
  return (
    <div className="fixed top-4 right-4 flex flex-col gap-2">
      {notifications.map((msg, idx) => (
        <motion.div
          key={idx}
          className="bg-green-500 text-white p-2 rounded shadow"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          {msg}
        </motion.div>
      ))}
    </div>
  );
}