
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

// Map of genre names to their corresponding background images
const genreBackgrounds: Record<string, string> = {
  Thriller: "/public/Thriller bg.jpg",
  Action: "/public/lovable-uploads/4894d372-ede4-475b-bf70-304e7791478f.png", // Adventure/mountain climber
  Comedy: "https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?auto=format&fit=crop&q=80&w=400",
  Horror: "/public/lovable-uploads/3f6eb3e2-03c0-444d-827a-d59ae97be156.png", // Annabelle doll
  Romance: "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?auto=format&fit=crop&q=80&w=400",
  Crime: "/public/lovable-uploads/512be544-151c-4496-95e6-c737fe1859e7.png", // Get Out scene
  Drama: "https://images.unsplash.com/photo-1585951237318-9ea5e175b891?auto=format&fit=crop&q=80&w=400",
  Documentary: "https://images.unsplash.com/photo-1594322436404-5a0526db4d13?auto=format&fit=crop&q=80&w=400",
  "Sci-Fi & Fantasy": "/public/lovable-uploads/01f37c1a-3c21-4b48-96a8-1b7f60719fa7.png", // Game of Thrones
  Animation: "/public/lovable-uploads/fc0c8f83-153c-4bbe-9d15-6c2f33618cd5.png", // Lion King
  Family: "https://images.unsplash.com/photo-1478071573915-66c28d497d6f?auto=format&fit=crop&q=80&w=400",
  Adventure: "/public/lovable-uploads/4894d372-ede4-475b-bf70-304e7791478f.png", // Mountain climber
  Mystery: "/public/lovable-uploads/6b533116-db4f-4344-9658-a65b5c1f9331.png", // Documentary-style image
  Western: "/public/lovable-uploads/2cde8923-b264-4c26-8407-f4356a10562e.png", // Western/cowboy image
  // Default background for any other genres
  default: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=400"
};

// Color gradients for each genre with reduced opacity to improve visibility of background images
const genreGradients: Record<string, string> = {
  Thriller: "linear-gradient(to bottom right, rgba(20, 30, 48, 0.5), rgba(36, 59, 85, 0.55))",
  Action: "linear-gradient(to bottom right, rgba(211, 87, 60, 0.5), rgba(169, 57, 53, 0.55))",
  Comedy: "linear-gradient(to bottom right, rgba(255, 167, 38, 0.5), rgba(251, 140, 0, 0.55))",
  Horror: "linear-gradient(to bottom right, rgba(33, 33, 33, 0.5), rgba(66, 66, 66, 0.55))",
  Romance: "linear-gradient(to bottom right, rgba(233, 30, 99, 0.5), rgba(156, 39, 176, 0.55))",
  Crime: "linear-gradient(to bottom right, rgba(38, 50, 56, 0.5), rgba(55, 71, 79, 0.55))",
  Drama: "linear-gradient(to bottom right, rgba(49, 27, 146, 0.5), rgba(26, 35, 126, 0.55))",
  Documentary: "linear-gradient(to bottom right, rgba(1, 87, 155, 0.5), rgba(2, 119, 189, 0.55))",
  "Sci-Fi & Fantasy": "linear-gradient(to bottom right, rgba(13, 71, 161, 0.5), rgba(21, 101, 192, 0.55))",
  Animation: "linear-gradient(to bottom right, rgba(0, 150, 136, 0.5), rgba(0, 121, 107, 0.55))",
  Family: "linear-gradient(to bottom right, rgba(124, 179, 66, 0.5), rgba(104, 159, 56, 0.55))",
  Adventure: "linear-gradient(to bottom right, rgba(255, 111, 0, 0.5), rgba(230, 81, 0, 0.55))",
  Mystery: "linear-gradient(to bottom right, rgba(74, 20, 140, 0.5), rgba(49, 27, 146, 0.55))",
  Western: "linear-gradient(to bottom right, rgba(121, 85, 72, 0.5), rgba(93, 64, 55, 0.55))",
  // Default gradient for any other genres
  default: "linear-gradient(to bottom right, rgba(109, 40, 217, 0.5), rgba(91, 33, 182, 0.55))"
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
        "w-full rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 text-white font-semibold relative overflow-hidden border border-white/10",
        isMobile ? "h-16 p-2 text-sm" : "h-24 p-4 text-lg",
        className
      )}
      style={{
        backgroundImage: `${gradient}, url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <span className="z-10 text-shadow-md tracking-wide">{name}</span>
    </button>
  );
};
