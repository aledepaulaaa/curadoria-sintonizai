'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import type { ConfirmModalProps } from '@/src/types/confirmModal';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  loading = false,
  variant = 'emerald',
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const colorStyles = {
    emerald: {
      border: 'border-emerald-500/40',
      badgeBg: 'bg-emerald-500/20 text-emerald-300',
      btnBg: 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-emerald-500/20',
      icon: <CheckCircle2 className="text-emerald-400" size={24} />,
    },
    amber: {
      border: 'border-amber-500/40',
      badgeBg: 'bg-amber-500/20 text-amber-300',
      btnBg: 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-amber-500/20',
      icon: <AlertTriangle className="text-amber-400" size={24} />,
    },
    purple: {
      border: 'border-purple-500/40',
      badgeBg: 'bg-purple-500/20 text-purple-300',
      btnBg: 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white shadow-purple-500/20',
      icon: <CheckCircle2 className="text-purple-400" size={24} />,
    },
    red: {
      border: 'border-red-500/40',
      badgeBg: 'bg-red-500/20 text-red-300',
      btnBg: 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-red-500/20',
      icon: <AlertTriangle className="text-red-400" size={24} />,
    },
  };

  const style = colorStyles[variant];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className={`relative w-full max-w-md bg-zinc-900 border ${style.border} rounded-3xl p-6 shadow-2xl space-y-4 overflow-hidden`}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-2xl ${style.badgeBg}`}>
                {style.icon}
              </div>
              <h3 className="text-sm font-black uppercase text-white tracking-wider">
                {title}
              </h3>
            </div>

            <button
              onClick={onClose}
              disabled={loading}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-all disabled:opacity-50"
            >
              <X size={18} />
            </button>
          </div>

          {/* Description */}
          <p className="text-xs text-zinc-300 leading-relaxed font-sans">
            {description}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              {cancelText}
            </button>

            <button
              onClick={onConfirm}
              disabled={loading}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all disabled:opacity-50 ${style.btnBg}`}
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              <span>{confirmText}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
