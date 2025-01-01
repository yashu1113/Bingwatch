import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

interface HeroControlsProps {
  autoplayTrailers: boolean;
  toggleAutoplay: () => void;
  isMuted: boolean;
  toggleMute: () => void;
}

export const HeroControls = ({
  autoplayTrailers,
  toggleAutoplay,
  isMuted,
  toggleMute,
}: HeroControlsProps) => {
  return (
    <div className="absolute top-4 right-4 flex gap-2">
      <Button
        size="sm"
        variant="outline"
        className="gap-2 border-white text-white bg-black/50 backdrop-blur-sm border-2 rounded-lg text-xs md:text-sm lg:text-base h-9 font-semibold flex items-center justify-center hover:bg-white/20"
        onClick={toggleAutoplay}
      >
        {autoplayTrailers ? (
          <>
            <Volume2 className="h-4 w-4 md:h-5 md:w-5" />
            Autoplay On
          </>
        ) : (
          <>
            <VolumeX className="h-4 w-4 md:h-5 md:w-5" />
            Autoplay Off
          </>
        )}
      </Button>
      {autoplayTrailers && (
        <Button
          size="sm"
          variant="outline"
          className="gap-2 border-white text-white bg-black/50 backdrop-blur-sm border-2 rounded-lg"
          onClick={toggleMute}
        >
          {isMuted ? <VolumeX /> : <Volume2 />}
        </Button>
      )}
    </div>
  );
};