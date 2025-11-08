import { useLanguagePreference } from '@/contexts/LanguagePreferenceContext';
import { Languages } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageIndicatorProps {
  originalLanguage?: string;
  className?: string;
}

export const LanguageIndicator = ({ originalLanguage, className }: LanguageIndicatorProps) => {
  const { preferredLanguage } = useLanguagePreference();

  if (!preferredLanguage || !originalLanguage) {
    return null;
  }

  // Check if the original language matches the user's preference
  const isPreferredLanguageAvailable = originalLanguage === preferredLanguage.code;

  if (!isPreferredLanguageAvailable) {
    return null;
  }

  return (
    <div className={cn(
      "absolute top-2 right-2 z-10 bg-green-600 text-white px-2 py-1 rounded flex items-center gap-1 text-xs font-semibold",
      className
    )}>
      <Languages className="h-3 w-3" />
      {preferredLanguage.englishName}
    </div>
  );
};
