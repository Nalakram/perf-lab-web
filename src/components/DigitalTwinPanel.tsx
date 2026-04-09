// src/components/DigitalTwinPanel.tsx
import { motion } from "framer-motion";

export function DigitalTwinPanel() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-12 text-center"
    >
      <div className="text-6xl font-bold text-neon-cyan mb-4">
        ✅ DIGITAL TWIN UPGRADED
      </div>
      <p className="text-2xl text-zinc-400">
        If you see this big neon text, the new file is live.
      </p>
      <p className="mt-8 text-sm text-zinc-500">
        (Close this and tell me what you see)
      </p>
    </motion.div>
  );
}