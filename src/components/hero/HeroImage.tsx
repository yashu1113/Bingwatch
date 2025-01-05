import { Skeleton } from "@/components/ui/skeleton";
import { getImageUrl } from "@/services/tmdb";

interface HeroImageProps {
  imagePath: string;
  title: string;
  networkQuality: string;
  isLoaded: boolean;
  hasError: boolean;
  onLoad: () => void;
  onError: () => void;
}

export const HeroImage = ({
  imagePath,
  title,
  networkQuality,
  isLoaded,
  hasError,
  onLoad,
  onError,
}: HeroImageProps) => {
  if (hasError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
        <p className="text-white text-center">Failed to load image</p>
      </div>
    );
  }

  if (!isLoaded) {
    return <Skeleton className="absolute inset-0 w-full h-full" />;
  }

  return (
    <img
      src={getImageUrl(imagePath, networkQuality === 'low' ? 'w780' : 'original')}
      alt={title}
      className="h-full w-full object-contain md:object-cover object-center transition-opacity duration-300"
      loading="lazy"
      onLoad={onLoad}
      onError={onError}
    />
  );
};