import { Badge } from "@/components/ui/badge";
import { useLanguagePreference } from "@/contexts/LanguagePreferenceContext";

interface Language {
  english_name: string;
  name: string;
  iso_639_1: string;
}

interface LanguageSectionProps {
  spokenLanguages?: Language[];
  originalLanguage?: string;
}

export const LanguageSection = ({ spokenLanguages, originalLanguage }: LanguageSectionProps) => {
  const { preferredLanguage } = useLanguagePreference();

  if (!spokenLanguages || spokenLanguages.length === 0) {
    return null;
  }

  // Find the original language name
  const originalLang = spokenLanguages.find(lang => lang.iso_639_1 === originalLanguage);

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Available Languages</h3>
      <div className="flex flex-wrap gap-2">
        {spokenLanguages.map((language) => {
          const isOriginal = language.iso_639_1 === originalLanguage;
          const isPreferred = preferredLanguage?.code === language.iso_639_1;
          
          return (
            <Badge
              key={language.iso_639_1}
              variant={isPreferred ? "default" : "secondary"}
              className={
                isOriginal 
                  ? "border border-netflix-red bg-gray-800" 
                  : isPreferred
                  ? "bg-green-600 hover:bg-green-700"
                  : ""
              }
            >
              {language.english_name}
              {isOriginal && " (Original)"}
              {isPreferred && " ✓"}
            </Badge>
          );
        })}
      </div>
      {originalLang && (
        <p className="text-sm text-gray-400">
          Original audio: {originalLang.english_name}
        </p>
      )}
    </div>
  );
};
