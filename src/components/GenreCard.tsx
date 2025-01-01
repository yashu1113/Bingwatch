import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface GenreCardProps {
  id: number;
  name: string;
  className?: string;
}

export const GenreCard = ({ id, name, className }: GenreCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/genre/${id}`);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full h-20 rounded-lg bg-gradient-to-br from-purple-600/90 to-purple-800/90 flex items-center justify-center p-4 text-white font-semibold text-base shadow-md hover:shadow-lg transition-all duration-200",
        className
      )}
    >
      {name}
    </button>
  );
};