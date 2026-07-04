import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Check, Loader2 } from "lucide-react";

interface ToastProps {
  status: { type: 'error' | 'success' | 'pending'; message: string } | null;
}

export function Toast({ status }: ToastProps) {
  return (
    <AnimatePresence>
      {status && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: "-50%", scale: 0.9 }}
          animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
          exit={{ opacity: 0, y: 10, x: "-50%", scale: 0.9 }}
          className={`toast ${status.type}`}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {status.type === 'error' && <AlertCircle size={20} style={{flexShrink: 0}} />}
          {status.type === 'success' && <Check size={20} style={{flexShrink: 0}} />}
          {status.type === 'pending' && <Loader2 size={20} className="icon-spin" style={{flexShrink: 0}} />}
          <p title={status.message}>{status.message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
