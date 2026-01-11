import { useState, useEffect, useCallback } from "react";
import { X, Maximize2, Minimize2, Loader2 } from "lucide-react";
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

/**
 * Generates the vidking.net embed URL based on media type and IDs
 * Movies: /embed/movie/{tmdbId}?autoPlay=true&nextEpisode=true
 * TV: /embed/tv/{tmdbId}/{season}/{episode}?autoPlay=true&nextEpisode=true
 */
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
  const [iframeRef, setIframeRef] = useState<HTMLIFrameElement | null>(null);

  // Generate the embed URL
  const embedUrl = getVidkingUrl(mediaType, tmdbId, season, episode);

  // Handle escape key to close player
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
      // Prevent body scroll when player is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, isFullscreen, onClose]);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!iframeRef) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    } else {
      iframeRef.requestFullscreen?.();
      setIsFullscreen(true);
    }
  }, [iframeRef]);

  // Handle iframe load
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  // Reset loading state when URL changes
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
    }
  }, [embedUrl, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] bg-black/95 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
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

      {/* Control buttons */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
        {/* Fullscreen button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFullscreen}
          className="bg-gray-800/80 hover:bg-gray-700 text-white rounded-full h-10 w-10"
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? (
            <Minimize2 className="h-5 w-5" />
          ) : (
            <Maximize2 className="h-5 w-5" />
          )}
        </Button>

        {/* Close button */}
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
        ref={setIframeRef}
        src={embedUrl}
        className="w-full h-full max-w-[95vw] max-h-[90vh] rounded-lg bg-black"
        onLoad={handleIframeLoad}
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        title={title}
      />
    </div>
  );
};

export default VideoPlayer;
