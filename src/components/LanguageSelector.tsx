import { useLanguagePreference, SUPPORTED_LANGUAGES } from '@/contexts/LanguagePreferenceContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const LanguageSelector = () => {
  const { preferredLanguage, setPreferredLanguage } = useLanguagePreference();
  const { toast } = useToast();

  const handleLanguageSelect = (language: typeof SUPPORTED_LANGUAGES[0]) => {
    setPreferredLanguage(language);
    toast({
      title: "Language Preference Updated",
      description: `${language.englishName} set as your preferred audio language`,
    });
  };

  const handleClearPreference = () => {
    setPreferredLanguage(null);
    toast({
      title: "Language Preference Cleared",
      description: "Original audio will be used for all content",
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="text-white hover:bg-white/10 relative"
        >
          <Languages className="h-5 w-5" />
          {preferredLanguage && (
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-netflix-red rounded-full" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-64 bg-[#141414] border-gray-700 text-white max-h-96 overflow-y-auto z-50"
      >
        <DropdownMenuLabel className="text-gray-400">
          Audio Language Preference
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-700" />
        
        {preferredLanguage && (
          <>
            <DropdownMenuItem
              onClick={handleClearPreference}
              className="text-netflix-red hover:bg-white/10 cursor-pointer"
            >
              Clear Preference
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-700" />
          </>
        )}

        <div className="py-1">
          {SUPPORTED_LANGUAGES.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageSelect(language)}
              className="cursor-pointer hover:bg-white/10 flex items-center justify-between"
            >
              <div className="flex flex-col">
                <span className="font-medium">{language.name}</span>
                <span className="text-xs text-gray-400">{language.englishName}</span>
              </div>
              {preferredLanguage?.code === language.code && (
                <Check className="h-4 w-4 text-netflix-red" />
              )}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
