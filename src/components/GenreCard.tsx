
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

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

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full rounded-lg bg-gradient-to-br from-purple-600/90 to-purple-800/90 flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 text-white font-semibold",
        isMobile ? "h-12 p-2 text-xs" : "h-20 p-4 text-base",
        className
      )}
    >
      {name}
    </button>
  );
};
