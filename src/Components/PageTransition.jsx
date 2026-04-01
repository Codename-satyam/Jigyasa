import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { getUserSettings, subscribeSettingsChanges } from "../api/settings";

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 0.98,
  },
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4,
};

function PageTransition({ children }) {
  const [reducedMotion, setReducedMotion] = useState(() => getUserSettings().reducedMotion);

  useEffect(() => {
    const unsubscribe = subscribeSettingsChanges((nextSettings) => {
      setReducedMotion(Boolean(nextSettings.reducedMotion));
    });

    return unsubscribe;
  }, []);

  const transition = useMemo(() => {
    if (reducedMotion) {
      return { duration: 0 };
    }

    return pageTransition;
  }, [reducedMotion]);

  const variants = useMemo(() => {
    if (reducedMotion) {
      return {
        initial: { opacity: 1, y: 0, scale: 1 },
        in: { opacity: 1, y: 0, scale: 1 },
        out: { opacity: 1, y: 0, scale: 1 },
      };
    }

    return pageVariants;
  }, [reducedMotion]);

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={variants}
      transition={transition}
      style={{ width: "100%" }}
    >
      {children}
    </motion.div>
  );
}

export default PageTransition;
