
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

// Map of genre names to their corresponding background images
const genreBackgrounds: Record<string, string> = {
  Thriller: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=400",
  Action: "https://images.unsplash.com/photo-1547756536-cde3673fa2e5?auto=format&fit=crop&q=80&w=400",
  Comedy: "https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?auto=format&fit=crop&q=80&w=400",
  Horror: "https://images.unsplash.com/photo-1533167649158-6d508895b680?auto=format&fit=crop&q=80&w=400",
  Romance: "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?auto=format&fit=crop&q=80&w=400",
  Crime: "https://images.unsplash.com/photo-1453873531674-2151bcd01707?auto=format&fit=crop&q=80&w=400",
  Drama: "https://images.unsplash.com/photo-1585951237318-9ea5e175b891?auto=format&fit=crop&q=80&w=400",
  Documentary: "https://images.unsplash.com/photo-1594322436404-5a0526db4d13?auto=format&fit=crop&q=80&w=400",
  "Sci-Fi & Fantasy": "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?auto=format&fit=crop&q=80&w=400",
  Animation: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=400",
  Family: "https://images.unsplash.com/photo-1478071573915-66c28d497d6f?auto=format&fit=crop&q=80&w=400",
  Adventure: "https://images.unsplash.com/photo-1482881497185-d4a9ddbe4151?auto=format&fit=crop&q=80&w=400",
  Mystery: "https://images.unsplash.com/photo-1548181864-7f082c57a816?auto=format&fit=crop&q=80&w=400",
  // Default background for any other genres
  default: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=400"
};

interface GenreCardProps {
  id: number;
  name: string;
  className?: string;
}

export const GenreCard = ({ id, name, className }: GenreCardProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleClick = () => {
    navigate(`/genre/${id}`);
  };

  // Get the background image for this genre, or use the default
  const backgroundImage = genreBackgrounds[name] || genreBackgrounds.default;

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 text-white font-semibold relative overflow-hidden",
        isMobile ? "h-12 p-2 text-xs" : "h-20 p-4 text-base",
        className
      )}
      style={{
        backgroundImage: `linear-gradient(to bottom right, rgba(109, 40, 217, 0.85), rgba(91, 33, 182, 0.9)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <span className="z-10 text-shadow">{name}</span>
    </button>
  );
};
