import { useState, useEffect, useRef } from 'react';
import { usePlayerSettings } from '../contexts/PlayerSettingsContext';

interface VideoPreviewOptions {
  videoId?: string;
  startTime?: number;
  duration?: number;
  muted?: boolean;
  autoplay?: boolean;
}

interface VideoPreviewState {
  isHovering: boolean;
  isLoaded: boolean;
  isError: boolean;
  isPlaying: boolean;
}

export const useVideoPreview = (options: VideoPreviewOptions = {}) => {
  const { videoId, startTime = 0, duration = 15, muted = true, autoplay = false } = options;
  const { settings } = usePlayerSettings();

  const [state, setState] = useState<VideoPreviewState>({
    isHovering: false,
    isLoaded: false,
    isError: false,
    isPlaying: false,
  });

  const hoverTimeoutRef = useRef<NodeJS.Timeout>();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if video preview is enabled in settings
  const isVideoPreviewEnabled = settings.videoPreviewHover;
  const animationIntensity = settings.animationIntensity;

  // Generate YouTube embed URL with preview settings
  const getYouTubePreviewUrl = () => {
    if (!videoId) return null;

    const baseUrl = 'https://www.youtube.com/embed/';
    const params = new URLSearchParams({
      start: startTime.toString(),
      end: (startTime + duration).toString(),
      autoplay: autoplay ? '1' : '0',
      mute: muted ? '1' : '0',
      controls: '0',
      showinfo: '0',
      rel: '0',
      modestbranding: '1',
      loop: '1',
      playlist: videoId, // Required for looping
      iv_load_policy: '3',
      fs: '0',
      cc_load_policy: '0',
      disablekb: '1',
    });

    return `${baseUrl}${videoId}?${params.toString()}`;
  };

  // Handle hover start with delay
  const handleHoverStart = () => {
    if (!isVideoPreviewEnabled || !videoId) return;

    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Set delay based on animation intensity
    const delay = animationIntensity === 'minimal' ? 800 :
                  animationIntensity === 'reduced' ? 500 : 300;

    hoverTimeoutRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, isHovering: true }));

      // Trigger video play after a short delay for smooth transition
      setTimeout(() => {
        setState(prev => ({ ...prev, isPlaying: true }));
      }, 100);
    }, delay);
  };

  // Handle hover end
  const handleHoverEnd = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    setState(prev => ({
      ...prev,
      isHovering: false,
      isPlaying: false,
    }));
  };

  // Handle video load
  const handleVideoLoad = () => {
    setState(prev => ({ ...prev, isLoaded: true, isError: false }));
  };

  // Handle video error
  const handleVideoError = () => {
    setState(prev => ({ ...prev, isError: true, isLoaded: false }));
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Animation variants based on intensity
  const getAnimationVariants = () => {
    const baseVariants = {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.9 },
    };

    if (animationIntensity === 'minimal') {
      return {
        ...baseVariants,
        animate: { ...baseVariants.animate, transition: { duration: 0.1 } },
        exit: { ...baseVariants.exit, transition: { duration: 0.1 } },
      };
    }

    if (animationIntensity === 'reduced') {
      return {
        ...baseVariants,
        animate: { ...baseVariants.animate, transition: { duration: 0.2 } },
        exit: { ...baseVariants.exit, transition: { duration: 0.2 } },
      };
    }

    // Full animation intensity
    return {
      ...baseVariants,
      animate: {
        ...baseVariants.animate,
        transition: {
          duration: 0.3,
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }
      },
      exit: {
        ...baseVariants.exit,
        transition: {
          duration: 0.2,
          ease: 'easeInOut',
        }
      },
    };
  };

  return {
    // State
    isHovering: state.isHovering,
    isLoaded: state.isLoaded,
    isError: state.isError,
    isPlaying: state.isPlaying,

    // Refs
    containerRef,
    iframeRef,

    // Computed values
    videoUrl: getYouTubePreviewUrl(),
    isVideoPreviewEnabled,
    animationIntensity,

    // Event handlers
    handleHoverStart,
    handleHoverEnd,
    handleVideoLoad,
    handleVideoError,

    // Animation helpers
    animationVariants: getAnimationVariants(),

    // Utility functions
    shouldShowVideo: isVideoPreviewEnabled && videoId && state.isHovering && !state.isError,
    shouldShowFallback: !isVideoPreviewEnabled || !videoId || state.isError,
  };
};