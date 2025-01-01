import { Button } from "@/components/ui/button";
import { Play, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HeroContentProps {
  item: {
    id: number;
    title?: string;
    name?: string;
    overview: string;
    media_type?: "movie" | "tv";
  };
  handleAddToWatchlist: (item: any) => void;
}

export const HeroContent = ({ item, handleAddToWatchlist }: HeroContentProps) => {
  const navigate = useNavigate();

  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8 z-10">
      <div className="container mx-auto">
        <div className="max-w-2xl space-y-2 md:space-y-4">
          <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-white line-clamp-2">
            {item.title || item.name}
          </h2>
          <p className="line-clamp-2 text-xs md:text-sm lg:text-base text-gray-200">
            {item.overview}
          </p>
          <div className="flex flex-wrap gap-2 md:gap-4">
            <Button
              size="sm"
              className="gap-1 md:gap-2 bg-netflix-red hover:bg-netflix-red/90 text-xs md:text-base"
              onClick={() =>
                navigate(`/${item.media_type || "movie"}/${item.id}`)
              }
            >
              <Play className="h-4 w-4" />
              Watch Now
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-white text-white bg-transparent border-2 rounded-lg text-xs md:text-sm lg:text-base h-9 md:h-10 font-semibold flex items-center justify-center hover:bg-white/20"
              onClick={() => handleAddToWatchlist(item)}
            >
              <Plus className="h-4 w-4 md:h-5 md:w-5" />
              Add to Watchlist
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};