
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

// Color gradients for each genre to match with the backgrounds
const genreGradients: Record<string, string> = {
  Thriller: "linear-gradient(to bottom right, rgba(20, 30, 48, 0.85), rgba(36, 59, 85, 0.9))",
  Action: "linear-gradient(to bottom right, rgba(211, 87, 60, 0.85), rgba(169, 57, 53, 0.9))",
  Comedy: "linear-gradient(to bottom right, rgba(255, 167, 38, 0.85), rgba(251, 140, 0, 0.9))",
  Horror: "linear-gradient(to bottom right, rgba(33, 33, 33, 0.85), rgba(66, 66, 66, 0.9))",
  Romance: "linear-gradient(to bottom right, rgba(233, 30, 99, 0.85), rgba(156, 39, 176, 0.9))",
  Crime: "linear-gradient(to bottom right, rgba(38, 50, 56, 0.85), rgba(55, 71, 79, 0.9))",
  Drama: "linear-gradient(to bottom right, rgba(49, 27, 146, 0.85), rgba(26, 35, 126, 0.9))",
  Documentary: "linear-gradient(to bottom right, rgba(1, 87, 155, 0.85), rgba(2, 119, 189, 0.9))",
  "Sci-Fi & Fantasy": "linear-gradient(to bottom right, rgba(13, 71, 161, 0.85), rgba(21, 101, 192, 0.9))",
  Animation: "linear-gradient(to bottom right, rgba(0, 150, 136, 0.85), rgba(0, 121, 107, 0.9))",
  Family: "linear-gradient(to bottom right, rgba(124, 179, 66, 0.85), rgba(104, 159, 56, 0.9))",
  Adventure: "linear-gradient(to bottom right, rgba(255, 111, 0, 0.85), rgba(230, 81, 0, 0.9))",
  Mystery: "linear-gradient(to bottom right, rgba(74, 20, 140, 0.85), rgba(49, 27, 146, 0.9))",
  // Default gradient for any other genres
  default: "linear-gradient(to bottom right, rgba(109, 40, 217, 0.85), rgba(91, 33, 182, 0.9))"
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

  // Get the background image and gradient for this genre, or use defaults
  const backgroundImage = genreBackgrounds[name] || genreBackgrounds.default;
  const gradient = genreGradients[name] || genreGradients.default;

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 text-white font-semibold relative overflow-hidden",
        isMobile ? "h-12 p-2 text-xs" : "h-20 p-4 text-base",
        className
      )}
      style={{
        backgroundImage: `${gradient}, url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <span className="z-10 text-shadow">{name}</span>
    </button>
  );
};
