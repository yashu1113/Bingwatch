import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const LoadingScreen = () => {
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisitedBefore");
    
    if (hasVisited) {
      setShow(false);
      return;
    }

    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setShow(false);
        localStorage.setItem("hasVisitedBefore", "true");
      }, 500); // Wait for fade out animation
    }, 2000); // Show loader for 2 seconds minimum

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur transition-opacity duration-500",
        fadeOut && "opacity-0"
      )}
      role="status"
      aria-label="Loading BingeWatch"
    >
      <div className="flex flex-col items-center gap-6 text-white">
        <h1 className="text-4xl font-bold text-netflix-red animate-pulse">
          Bingwatch
        </h1>
        <Loader2 className="h-12 w-12 animate-spin text-netflix-red" />
        <p className="text-lg font-medium animate-fade-up">
          Your gateway to endless entertainment
        </p>
      </div>
    </div>
  );
};