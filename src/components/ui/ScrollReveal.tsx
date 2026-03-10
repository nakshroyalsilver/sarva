import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right" | "none";
  delay?: number;
  duration?: number;
}

const ScrollReveal = ({
  children,
  direction = "up", // sliding up animation 
  delay = 0,
  duration = 0.7, // Smooth, slow elegant luxury speed
}: ScrollRevealProps) => {
  
  // Define where the element starts before it enters the screen
  const getVariants = () => {
    switch (direction) {
      case "up":
        return { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 } };
      case "down":
        return { hidden: { opacity: 0, y: -50 }, visible: { opacity: 1, y: 0 } };
      case "left":
        return { hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0 } };
      case "right":
        return { hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0 } };
      case "none":
        return { hidden: { opacity: 0 }, visible: { opacity: 1 } };
      default:
        return { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 } };
    }
  };

  return (
    <motion.div
      variants={getVariants()}
      initial="hidden"
      // whileInView triggers the animation EXACTLY when the user scrolls to it
      whileInView="visible" 
      // once: true means it only happens the first time they scroll down (like Giva)
      // amount: 0.15 means the animation starts when 15% of the element is visible
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration, delay, ease: [0.21, 0.47, 0.32, 0.98] }} // Custom easing for that "luxury" feel
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;