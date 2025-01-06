import { Badge } from "@/components/ui/badge";

interface Language {
  english_name: string;
  name: string;
  iso_639_1: string;
}

interface LanguageSectionProps {
  spokenLanguages?: Language[];
}

export const LanguageSection = ({ spokenLanguages }: LanguageSectionProps) => {
  if (!spokenLanguages || spokenLanguages.length === 0) {
    return (
      <p className="text-gray-400 italic">
        Language information is not available
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Available Languages</h3>
      <div className="flex flex-wrap gap-2">
        {spokenLanguages.map((language) => (
          <Badge
            key={language.iso_639_1}
            variant="secondary"
            className="text-sm"
          >
            {language.english_name}
          </Badge>
        ))}
      </div>
    </div>
  );
};