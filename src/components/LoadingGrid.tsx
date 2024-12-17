import { Skeleton } from "@/components/ui/skeleton";

interface LoadingGridProps {
  count?: number;
  className?: string;
}

export const LoadingGrid = ({ count = 10, className }: LoadingGridProps) => {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="w-full">
          <Skeleton className="aspect-[2/3] w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
};