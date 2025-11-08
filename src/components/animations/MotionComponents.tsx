import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { usePlayerSettings } from '../../contexts/PlayerSettingsContext';
import React, { forwardRef } from 'react';

// Animation presets based on intensity
const getAnimationPreset = (intensity: 'full' | 'reduced' | 'minimal') => {
  switch (intensity) {
    case 'minimal':
      return {
        duration: 0.1,
        ease: 'linear',
      };
    case 'reduced':
      return {
        duration: 0.2,
        ease: 'easeInOut',
      };
    case 'full':
    default:
      return {
        duration: 0.3,
        type: 'spring' as const,
        stiffness: 300,
        damping: 30,
      };
  }
};

// Enhanced Motion Div with animation intensity awareness
export const MotionDiv = forwardRef<HTMLDivElement, HTMLMotionProps<'div'>>(
  ({ children, ...props }, ref) => {
    const { settings } = usePlayerSettings();
    const preset = getAnimationPreset(settings.animationIntensity);

    return (
      <motion.div
        ref={ref}
        transition={preset}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

MotionDiv.displayName = 'MotionDiv';

// Fade In Component
export const FadeIn = forwardRef<HTMLDivElement, HTMLMotionProps<'div'>>(
  ({ children, delay = 0, duration, ...props }, ref) => {
    const { settings } = usePlayerSettings();
    const preset = getAnimationPreset(settings.animationIntensity);

    return (
      <MotionDiv
        ref={ref}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          ...preset,
          delay,
          duration: duration || preset.duration,
        }}
        {...props}
      >
        {children}
      </MotionDiv>
    );
  }
);

FadeIn.displayName = 'FadeIn';

// Slide Up Component
export const SlideUp = forwardRef<HTMLDivElement, HTMLMotionProps<'div'>>(
  ({ children, delay = 0, distance = 20, ...props }, ref) => {
    const { settings } = usePlayerSettings();
    const preset = getAnimationPreset(settings.animationIntensity);

    return (
      <MotionDiv
        ref={ref}
        initial={{ opacity: 0, y: distance }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: distance }}
        transition={{
          ...preset,
          delay,
        }}
        {...props}
      >
        {children}
      </MotionDiv>
    );
  }
);

SlideUp.displayName = 'SlideUp';

// Scale In Component
export const ScaleIn = forwardRef<HTMLDivElement, HTMLMotionProps<'div'>>(
  ({ children, delay = 0, scale = 0.9, ...props }, ref) => {
    const { settings } = usePlayerSettings();
    const preset = getAnimationPreset(settings.animationIntensity);

    return (
      <MotionDiv
        ref={ref}
        initial={{ opacity: 0, scale }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale }}
        transition={{
          ...preset,
          delay,
        }}
        {...props}
      >
        {children}
      </MotionDiv>
    );
  }
);

ScaleIn.displayName = 'ScaleIn';

// Stagger Container for list animations
export const StaggerContainer: React.FC<{
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}> = ({ children, staggerDelay = 0.1, className }) => {
  const { settings } = usePlayerSettings();
  const preset = getAnimationPreset(settings.animationIntensity);

  const containerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: staggerDelay * (settings.animationIntensity === 'minimal' ? 0.3 :
                                      settings.animationIntensity === 'reduced' ? 0.6 : 1),
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {children}
    </motion.div>
  );
};

// Stagger Item for list items
export const StaggerItem = forwardRef<HTMLDivElement, Omit<HTMLMotionProps<'div'>, 'variants'>>(
  ({ children, ...props }, ref) => {
    const { settings } = usePlayerSettings();
    const preset = getAnimationPreset(settings.animationIntensity);

    const itemVariants = {
      initial: { opacity: 0, y: 20 },
      animate: {
        opacity: 1,
        y: 0,
        transition: preset,
      },
    };

    return (
      <motion.div
        ref={ref}
        variants={itemVariants}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

StaggerItem.displayName = 'StaggerItem';

// Hover Scale Component for interactive elements
export const HoverScale = forwardRef<HTMLDivElement, HTMLMotionProps<'div'>>(
  ({ children, scale = 1.05, disabled = false, ...props }, ref) => {
    const { settings } = usePlayerSettings();
    const preset = getAnimationPreset(settings.animationIntensity);

    if (disabled || settings.animationIntensity === 'minimal') {
      return <div ref={ref} {...props}>{children}</div>;
    }

    return (
      <MotionDiv
        ref={ref}
        whileHover={{ scale }}
        whileTap={{ scale: 0.98 }}
        transition={preset}
        {...props}
      >
        {children}
      </MotionDiv>
    );
  }
);

HoverScale.displayName = 'HoverScale';

// Animated Presence Component for conditional rendering
export const AnimatedPresence: React.FC<{
  children: React.ReactNode;
  mode?: 'sync' | 'wait' | 'popLayout';
  className?: string;
}> = ({ children, mode = 'wait', className }) => {
  const { settings } = usePlayerSettings();
  const preset = getAnimationPreset(settings.animationIntensity);

  return (
    <AnimatePresence mode={mode}>
      <motion.div
        className={className}
        transition={preset}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Loading Shimmer Component
export const LoadingShimmer: React.FC<{
  className?: string;
  height?: string;
  width?: string;
}> = ({ className = '', height = 'h-20', width = 'w-full' }) => {
  const { settings } = usePlayerSettings();
  const duration = settings.animationIntensity === 'minimal' ? 1 :
                   settings.animationIntensity === 'reduced' ? 1.5 : 2;

  return (
    <motion.div
      className={`${height} ${width} bg-muted rounded-md overflow-hidden ${className}`}
    >
      <motion.div
        className="h-full bg-gradient-to-r from-transparent via-muted-foreground/20 to-transparent"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration,
          ease: 'linear',
          repeat: Infinity,
        }}
      />
    </motion.div>
  );
};

// Pulse Animation Component
export const Pulse = forwardRef<HTMLDivElement, HTMLMotionProps<'div'>>(
  ({ children, intensity = 0.1, ...props }, ref) => {
    const { settings } = usePlayerSettings();

    if (settings.animationIntensity === 'minimal') {
      return <div ref={ref} {...props}>{children}</div>;
    }

    return (
      <MotionDiv
        ref={ref}
        animate={{
          opacity: [1, 1 - intensity, 1],
        }}
        transition={{
          duration: 2,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
        {...props}
      >
        {children}
      </MotionDiv>
    );
  }
);

Pulse.displayName = 'Pulse';

// Bounce In Component for notifications
export const BounceIn = forwardRef<HTMLDivElement, HTMLMotionProps<'div'>>(
  ({ children, delay = 0, ...props }, ref) => {
    const { settings } = usePlayerSettings();
    const preset = getAnimationPreset(settings.animationIntensity);

    if (settings.animationIntensity === 'minimal') {
      return (
        <FadeIn ref={ref} delay={delay} {...props}>
          {children}
        </FadeIn>
      );
    }

    return (
      <MotionDiv
        ref={ref}
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.3 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 30,
          delay,
          ...preset,
        }}
        {...props}
      >
        {children}
      </MotionDiv>
    );
  }
);

BounceIn.displayName = 'BounceIn';