import { motion } from 'framer-motion';

function DarkReveal({ children, delay = 0, y = 40, duration = 0.8 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: 'brightness(0.2) blur(4px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'brightness(1) blur(0px)' }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default DarkReveal;
