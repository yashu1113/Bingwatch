import { Video } from "lucide-react";
import { Suspense } from "react";

interface VideoSectionProps {
  videos: Array<{
    key: string;
    name: string;
    site: string;
  }>;
}

export const VideoSection = ({ videos }: VideoSectionProps) => {
  if (!videos.length) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
        <Video className="h-5 w-5" />
        Videos
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <Suspense 
            key={video.key} 
            fallback={
              <div className="aspect-video bg-gray-800 animate-pulse rounded-lg" />
            }
          >
            <iframe
              loading="lazy"
              className="w-full aspect-video rounded-lg"
              src={`https://www.youtube.com/embed/${video.key}`}
              title={video.name}
              allowFullScreen
            />
          </Suspense>
        ))}
      </div>
    </section>
  );
};