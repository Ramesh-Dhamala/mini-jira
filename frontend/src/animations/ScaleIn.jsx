import { motion } from "framer-motion";

export default function ScaleIn({ children }) {
  return (
    <motion.div
      initial={{
        scale: 0.95,
        opacity: 0,
      }}
      animate={{
        scale: 1,
        opacity: 1,
      }}
      transition={{
        duration: 0.3,
      }}
    >
      {children}
    </motion.div>
  );
}
