
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
    <section className="space-y-5 py-2">
      <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
        <Video className="h-5 w-5" />
        Videos
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {videos.map((video) => (
          <Suspense 
            key={video.key} 
            fallback={
              <div className="aspect-video bg-gray-800 animate-pulse rounded-lg" />
            }
          >
            <div className="overflow-hidden rounded-lg shadow-lg hover:ring-2 hover:ring-white/20 transition-all duration-300">
              <iframe
                loading="lazy"
                className="w-full aspect-video rounded-lg"
                src={`https://www.youtube.com/embed/${video.key}`}
                title={video.name}
                allowFullScreen
              />
            </div>
          </Suspense>
        ))}
      </div>
    </section>
  );
};
