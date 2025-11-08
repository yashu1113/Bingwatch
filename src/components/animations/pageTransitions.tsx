import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { usePlayerSettings } from '../../contexts/PlayerSettingsContext';
import React from 'react';

// Page transition variants based on animation intensity
const createPageVariants = (intensity: 'full' | 'reduced' | 'minimal'): Variants => {
  const duration = intensity === 'minimal' ? 0.1 :
                   intensity === 'reduced' ? 0.2 : 0.3;

  if (intensity === 'minimal') {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    };
  }

  if (intensity === 'reduced') {
    return {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -10 },
    };
  }

  // Full animation
  return {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration,
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.98,
      transition: {
        duration: duration * 0.8,
        ease: 'easeInOut',
      }
    },
  };
};

// Page transition component
export const PageTransition: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const location = useLocation();
  const { settings } = usePlayerSettings();

  const pageVariants = createPageVariants(settings.animationIntensity);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        className={className}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Fade transition variant
export const FadeTransition: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const location = useLocation();
  const { settings } = usePlayerSettings();

  const duration = settings.animationIntensity === 'minimal' ? 0.1 :
                   settings.animationIntensity === 'reduced' ? 0.2 : 0.3;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        className={className}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Slide transition variant
export const SlideTransition: React.FC<{
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  className?: string;
}> = ({ children, direction = 'right', className }) => {
  const location = useLocation();
  const { settings } = usePlayerSettings();

  const duration = settings.animationIntensity === 'minimal' ? 0.1 :
                   settings.animationIntensity === 'reduced' ? 0.2 : 0.3;

  const getSlideVariants = () => {
    if (settings.animationIntensity === 'minimal') {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      };
    }

    const slideDistance = 20;
    const getInitialPosition = () => {
      switch (direction) {
        case 'left': return { x: -slideDistance };
        case 'right': return { x: slideDistance };
        case 'up': return { y: -slideDistance };
        case 'down': return { y: slideDistance };
        default: return { x: slideDistance };
      }
    };

    const getExitPosition = () => {
      switch (direction) {
        case 'left': return { x: slideDistance };
        case 'right': return { x: -slideDistance };
        case 'up': return { y: slideDistance };
        case 'down': return { y: -slideDistance };
        default: return { x: -slideDistance };
      }
    };

    return {
      initial: { opacity: 0, ...getInitialPosition() },
      animate: { opacity: 1, x: 0, y: 0 },
      exit: { opacity: 0, ...getExitPosition() },
    };
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        className={className}
        variants={getSlideVariants()}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Scale transition variant
export const ScaleTransition: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const location = useLocation();
  const { settings } = usePlayerSettings();

  const duration = settings.animationIntensity === 'minimal' ? 0.1 :
                   settings.animationIntensity === 'reduced' ? 0.2 : 0.3;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        className={className}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{
          duration,
          ease: 'easeInOut',
          type: settings.animationIntensity === 'full' ? 'spring' : 'tween',
          ...(settings.animationIntensity === 'full' && {
            stiffness: 300,
            damping: 30
          })
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Custom transition hooks for different page types
export const usePageTransition = () => {
  const { settings } = usePlayerSettings();

  const getTransitionComponent = (type: 'default' | 'fade' | 'slide' | 'scale' = 'default') => {
    switch (type) {
      case 'fade':
        return FadeTransition;
      case 'slide':
        return SlideTransition;
      case 'scale':
        return ScaleTransition;
      default:
        return PageTransition;
    }
  };

  const getTransitionDuration = () => {
    return settings.animationIntensity === 'minimal' ? 100 :
           settings.animationIntensity === 'reduced' ? 200 : 300;
  };

  return {
    getTransitionComponent,
    getTransitionDuration,
    animationIntensity: settings.animationIntensity,
  };
};

// Layout transition for children routes
export const LayoutTransition: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const { settings } = usePlayerSettings();

  return (
    <motion.div
      className={className}
      layout
      transition={{
        duration: settings.animationIntensity === 'minimal' ? 0.1 :
                 settings.animationIntensity === 'reduced' ? 0.2 : 0.3,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
};