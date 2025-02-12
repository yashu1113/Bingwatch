
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HeroControlsProps {
  autoplayTrailers: boolean;
  setAutoplayTrailers: (value: boolean) => void;
}

export const HeroControls = ({ autoplayTrailers, setAutoplayTrailers }: HeroControlsProps) => {
  const { toast } = useToast();

  const toggleAutoplay = () => {
    setAutoplayTrailers(!autoplayTrailers);
    toast({
      title: `Autoplay ${!autoplayTrailers ? 'Enabled' : 'Disabled'}`,
      description: `Trailer autoplay has been ${!autoplayTrailers ? 'enabled' : 'disabled'}`,
    });
  };

  return (
    <div className="absolute top-8 right-8 z-10">
      <Button
        size="lg"
        variant="outline"
        className="gap-2 border-white/30 text-white bg-black/20 backdrop-blur-sm hover:bg-black/40 border-2 rounded-lg
          font-semibold flex items-center justify-center transition-all duration-300"
        onClick={toggleAutoplay}
      >
        {autoplayTrailers ? (
          <>
            <Volume2 className="h-5 w-5" />
            Autoplay On
          </>
        ) : (
          <>
            <VolumeX className="h-5 w-5" />
            Autoplay Off
          </>
        )}
      </Button>
    </div>
  );
};
