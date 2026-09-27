import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'motion/react';

export const GlassCursor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(true);

  // Position motion values
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth springs for cursor position
  const springConfig = { damping: 28, stiffness: 350, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Check if device supports fine hover
    const isTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    setIsTouchDevice(isTouch);

    if (isTouch) return;

    // Enable custom cursor class on body
    document.body.classList.add('custom-cursor-enabled');

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    // Check hovered interactive elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const interactive = target.closest('a, button, [role="button"], input, textarea, .interactive-card');
      setIsHovered(!!interactive);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    document.documentElement.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.body.classList.remove('custom-cursor-enabled');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [mouseX, mouseY, isVisible]);

  if (isTouchDevice || !isVisible) {
    return null;
  }

  const size = isHovered ? 64 : 36;

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-[9999] rounded-full transform-gpu"
      style={{
        x: smoothX,
        y: smoothY,
        translateX: '-50%',
        translateY: '-50%',
        width: size,
        height: size,
        backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        border: isHovered ? '1px solid var(--accent)' : '1px solid rgba(255, 255, 255, 0.22)',
        boxShadow: isHovered
          ? '0 0 25px var(--accent-glow), inset 0 0 10px var(--accent-soft)'
          : '0 0 10px rgba(255, 255, 255, 0.05)',
      }}
      animate={{
        scale: 1,
        transition: { type: 'spring', damping: 25, stiffness: 300 },
      }}
    />
  );
};
