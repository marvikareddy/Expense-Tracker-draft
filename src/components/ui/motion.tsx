
import { motion as framerMotion } from 'framer-motion';

// Re-export motion from framer-motion for consistency with shadcn/ui pattern
export const motion = framerMotion;

// Common animation variants
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } }
};

export const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
};

export const staggerChildren = {
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};
