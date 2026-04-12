import type { Variants } from "framer-motion";

export const sidebarVariants: Variants = {
  expanded: { width: 256 },
  collapsed: { width: 72 },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
};

export const modalSnap: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 400, damping: 30 },
  },
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.15 } },
};

export const rowHover = {
  rest: { y: 0, boxShadow: "0 0 0 rgba(0,0,0,0)" },
  hover: {
    y: -2,
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    transition: { duration: 0.2, ease: "easeOut" },
  },
};
