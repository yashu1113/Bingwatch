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
        "w-full h-24 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 transition-all duration-300 flex items-center justify-center p-4 text-white font-semibold text-lg shadow-lg hover:shadow-xl",
        className
      )}
    >
      {name}
    </button>
  );
};