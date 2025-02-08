import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast"

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
    <div className="absolute top-4 right-4">
      <Button
        size="sm"
        variant="outline"
        className="gap-2 border-white text-white bg-transparent border-2 rounded-lg text-xs md:text-sm lg:text-base h-9 font-semibold flex items-center justify-center"
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
    </div>
  );
};
