
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

// Map of genre names to their corresponding background images
const genreBackgrounds: Record<string, string> = {
  Thriller: "/lovable-uploads/6a0b881d-530f-425a-9175-818d41992b50.png", // First image
  Adventure: "/lovable-uploads/cf6aa6e9-743a-4187-b7d2-c49934b16291.png", // Second image
  Family: "/lovable-uploads/d185f2d3-0bfb-4352-adba-13c40a9a018c.png", // Third image
  Documentary: "/lovable-uploads/1542bd5a-7354-4b1c-bed3-d3a2c9f37c56.png", // Fourth image
  "Sci-Fi & Fantasy": "/lovable-uploads/2de5889f-106b-4feb-a382-66fe713f4ce1.png", // Fifth image
  Horror: "/lovable-uploads/8aa946c7-199c-469c-8f8a-bc09f432bbdc.png", // Sixth image
  Western: "/lovable-uploads/a5a40db4-1677-41ad-885a-e9d8a45cf180.png", // Seventh image
  Action: "https://images.unsplash.com/photo-1547756536-cde3673fa2e5?auto=format&fit=crop&q=80&w=400",
  Comedy: "https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?auto=format&fit=crop&q=80&w=400",
  Romance: "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?auto=format&fit=crop&q=80&w=400",
  Crime: "https://images.unsplash.com/photo-1453873531674-2151bcd01707?auto=format&fit=crop&q=80&w=400",
  Drama: "https://images.unsplash.com/photo-1585951237318-9ea5e175b891?auto=format&fit=crop&q=80&w=400",
  Animation: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=400",
  Mystery: "https://images.unsplash.com/photo-1548181864-7f082c57a816?auto=format&fit=crop&q=80&w=400",
  // Default background for any other genres
  default: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=400"
};

// Color gradients for each genre with very light opacity to show more of the background image
const genreGradients: Record<string, string> = {
  Thriller: "linear-gradient(to bottom right, rgba(20, 30, 48, 0.5), rgba(36, 59, 85, 0.55))",
  Adventure: "linear-gradient(to bottom right, rgba(255, 111, 0, 0.5), rgba(230, 81, 0, 0.55))",
  Family: "linear-gradient(to bottom right, rgba(124, 179, 66, 0.5), rgba(104, 159, 56, 0.55))",
  Documentary: "linear-gradient(to bottom right, rgba(1, 87, 155, 0.5), rgba(2, 119, 189, 0.55))",
  "Sci-Fi & Fantasy": "linear-gradient(to bottom right, rgba(13, 71, 161, 0.5), rgba(21, 101, 192, 0.55))",
  Horror: "linear-gradient(to bottom right, rgba(33, 33, 33, 0.5), rgba(66, 66, 66, 0.55))",
  Western: "linear-gradient(to bottom right, rgba(121, 85, 72, 0.5), rgba(93, 64, 55, 0.55))",
  Action: "linear-gradient(to bottom right, rgba(211, 87, 60, 0.5), rgba(169, 57, 53, 0.55))",
  Comedy: "linear-gradient(to bottom right, rgba(255, 167, 38, 0.5), rgba(251, 140, 0, 0.55))",
  Romance: "linear-gradient(to bottom right, rgba(233, 30, 99, 0.5), rgba(156, 39, 176, 0.55))",
  Crime: "linear-gradient(to bottom right, rgba(38, 50, 56, 0.5), rgba(55, 71, 79, 0.55))",
  Drama: "linear-gradient(to bottom right, rgba(49, 27, 146, 0.5), rgba(26, 35, 126, 0.55))",
  Animation: "linear-gradient(to bottom right, rgba(0, 150, 136, 0.5), rgba(0, 121, 107, 0.55))",
  Mystery: "linear-gradient(to bottom right, rgba(74, 20, 140, 0.5), rgba(49, 27, 146, 0.55))",
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
        "w-full rounded-lg flex items-center justify-center shadow-md hover:shadow-xl transition-all duration-300 text-white font-bold relative overflow-hidden",
        isMobile ? "h-14 p-2 text-sm" : "h-24 p-4 text-lg",
        className
      )}
      style={{
        backgroundImage: `${gradient}, url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <span className="z-10 text-shadow-md drop-shadow-lg">{name}</span>
    </button>
  );
};
