import { useState, useEffect, useCallback, useRef } from "react";
import { X, Maximize2, Minimize2, Loader2, ArrowLeft, ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  mediaType: "movie" | "tv";
  tmdbId: number;
  season?: number;
  episode?: number;
  title?: string;
}

const getVidkingUrl = (
  mediaType: "movie" | "tv",
  tmdbId: number,
  season?: number,
  episode?: number
): string => {
  const baseUrl = "https://www.vidking.net";
  if (mediaType === "tv" && season && episode) {
    return `${baseUrl}/embed/tv/${tmdbId}/${season}/${episode}?autoPlay=true&nextEpisode=true`;
  }
  return `${baseUrl}/embed/movie/${tmdbId}?autoPlay=true&nextEpisode=true`;
};

export const VideoPlayer = ({
  isOpen,
  onClose,
  mediaType,
  tmdbId,
  season = 1,
  episode = 1,
  title = "Video Player",
}: VideoPlayerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const embedUrl = getVidkingUrl(mediaType, tmdbId, season, episode);

  // Auto-hide hint after 5 seconds
  useEffect(() => {
    if (isOpen && showHint) {
      const timer = setTimeout(() => setShowHint(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, showHint]);

  // Focus iframe on load so embedded player receives keyboard events
  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
    // Try to focus the iframe so keyboard shortcuts work inside it
    setTimeout(() => {
      iframeRef.current?.focus();
    }, 500);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isFullscreen && document.fullscreenElement) {
          document.exitFullscreen();
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, isFullscreen, onClose]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    } else {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    }
  }, []);

  // Reset state when URL changes
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setShowHint(true);
    }
  }, [embedUrl, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[99999] bg-black flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={() => iframeRef.current?.focus()}
    >
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-white" />
            <p className="text-white text-lg">Loading player...</p>
          </div>
        </div>
      )}

      {/* Keyboard hint overlay */}
      {showHint && !isLoading && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 animate-fade-in">
          <div className="bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl px-5 py-3 flex items-center gap-4 text-white text-sm">
            <Info className="h-4 w-4 text-blue-400 shrink-0" />
            <span>Click on the video and use</span>
            <div className="flex items-center gap-2">
              <kbd className="bg-white/10 border border-white/20 rounded px-2 py-0.5 text-xs font-mono flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" /> ←
              </kbd>
              <span className="text-white/60">10s back</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="bg-white/10 border border-white/20 rounded px-2 py-0.5 text-xs font-mono flex items-center gap-1">
                → <ArrowRight className="h-3 w-3" />
              </kbd>
              <span className="text-white/60">10s forward</span>
            </div>
            <kbd className="bg-white/10 border border-white/20 rounded px-2 py-0.5 text-xs font-mono">Space</kbd>
            <span className="text-white/60">play/pause</span>
          </div>
        </div>
      )}

      {/* Control buttons */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFullscreen}
          className="bg-gray-800/80 hover:bg-gray-700 text-white rounded-full h-10 w-10"
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="bg-red-600/80 hover:bg-red-700 text-white rounded-full h-10 w-10"
          aria-label="Close player"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Title bar */}
      <div className="absolute top-4 left-4 z-20">
        <h2 className="text-white text-lg font-semibold drop-shadow-lg">
          {title}
          {mediaType === "tv" && (
            <span className="ml-2 text-sm bg-gray-800/80 px-2 py-1 rounded">
              S{season}:E{episode}
            </span>
          )}
        </h2>
      </div>

      {/* Video iframe */}
      <iframe
        ref={iframeRef}
        src={embedUrl}
        className="w-full h-full"
        onLoad={handleIframeLoad}
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        title={title}
        tabIndex={0}
      />
    </div>
  );
};

export default VideoPlayer;
