
import { Button } from "@/components/ui/button";
import { Play, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HeroSlideContentProps {
  title: string;
  overview: string;
  mediaType: string;
  id: number;
  onAddToWatchlist: () => void;
  releaseDate?: string;
  genre?: string;
}

export const HeroSlideContent = ({ 
  title, 
  overview, 
  mediaType, 
  id, 
  onAddToWatchlist,
  releaseDate,
  genre
}: HeroSlideContentProps) => {
  const navigate = useNavigate();

  return (
    <div className="absolute inset-0 flex items-end pb-16 md:pb-24 lg:pb-32">
      <div className="container mx-auto">
        <div className="max-w-2xl space-y-3 md:space-y-4 px-4">
          {releaseDate && (
            <p className="text-sm md:text-base text-gray-300">
              {new Date(releaseDate).getFullYear()}
              {genre && ` • ${genre}`}
            </p>
          )}
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
            {title}
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-gray-200 line-clamp-3 md:line-clamp-4 max-w-xl">
            {overview}
          </p>
          <div className="flex items-center gap-3 md:gap-4 pt-2">
            <Button
              size="lg"
              className="bg-white hover:bg-white/90 text-black font-semibold text-base md:text-lg px-8 py-6"
              onClick={() => navigate(`/${mediaType}/${id}`)}
            >
              <Play className="h-5 w-5 md:h-6 md:w-6 mr-2" />
              Watch Now
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 text-white bg-black/20 backdrop-blur-sm hover:bg-black/40 font-semibold text-base md:text-lg px-8 py-6"
              onClick={onAddToWatchlist}
            >
              <Plus className="h-5 w-5 md:h-6 md:w-6 mr-2" />
              Add to Watchlist
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
