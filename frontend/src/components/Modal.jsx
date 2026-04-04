import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ open, onClose, title, children, wide = false }) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`bg-white rounded-xl shadow-lg p-6 ${wide ? 'max-w-2xl' : 'max-w-md'} w-full max-h-[85vh] overflow-y-auto relative`}>
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-ink-muted hover:text-ink text-xl leading-none"
        >
          &times;
        </button>
        {title && <h2 className="text-xl font-bold text-ink mb-4 pr-8">{title}</h2>}
        {children}
      </div>
    </div>,
    document.body
  );
}
