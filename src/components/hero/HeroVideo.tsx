import { forwardRef } from "react";

interface HeroVideoProps {
  videoKey: string;
  isMuted: boolean;
  quality: string;
}

export const HeroVideo = forwardRef<HTMLIFrameElement, HeroVideoProps>(
  ({ videoKey, isMuted, quality }, ref) => {
    return (
      <div className="absolute inset-0 w-full h-full bg-black">
        <iframe
          ref={ref}
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&mute=${
            isMuted ? 1 : 0
          }&controls=0&modestbranding=1&vq=${quality}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
);

HeroVideo.displayName = "HeroVideo";