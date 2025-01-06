import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

interface CastSectionProps {
  cast?: CastMember[];
}

export const CastSection = ({ cast }: CastSectionProps) => {
  const [showAll, setShowAll] = useState(false);
  
  if (!cast || cast.length === 0) {
    return null;
  }

  const displayedCast = showAll ? cast : cast.slice(0, 12);

  return (
    <section className="space-y-6">
      <h2 className="text-xl md:text-2xl font-bold">Cast</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {displayedCast.map((member) => (
          <div key={member.id} className="flex flex-col items-center text-center space-y-2">
            <Avatar className="w-24 h-24">
              <AvatarImage
                src={member.profile_path ? `https://image.tmdb.org/t/p/w185${member.profile_path}` : undefined}
                alt={member.name}
              />
              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="font-semibold text-sm">{member.name}</p>
              <p className="text-sm text-gray-400">{member.character}</p>
            </div>
          </div>
        ))}
      </div>
      {cast.length > 12 && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={() => setShowAll(!showAll)}
            className="px-6 py-2 bg-netflix-black text-white rounded-full hover:bg-netflix-black/90 transition-colors"
          >
            {showAll ? "Show Less" : "View More Cast"}
          </Button>
        </div>
      )}
    </section>
  );
};