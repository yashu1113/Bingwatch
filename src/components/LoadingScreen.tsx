import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";

export const LoadingScreen = () => {
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const location = useLocation();
  
  // Check if current route is a detail page
  const isDetailPage = /^\/(movie|tv)\/\d+/.test(location.pathname);
  
  // Track all ongoing queries and mutations, excluding specific pages
  const isFetching = useIsFetching({
    predicate: (query) => {
      // Don't show loader for movie details, show details, and genre pages
      const excludedKeys = ['movie', 'tv', 'movies/genre', 'tv/genre'];
      return !excludedKeys.some(key => 
        query.queryKey[0] === key || 
        (Array.isArray(query.queryKey[0]) && query.queryKey[0].includes(key))
      );
    }
  });
  
  const isMutating = useIsMutating();
  const isLoading = (isFetching > 0 || isMutating > 0) && !isDetailPage;

  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisitedBefore");
    
    if (hasVisited) {
      setShow(isLoading);
      return;
    }

    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setShow(false);
        localStorage.setItem("hasVisitedBefore", "true");
      }, 500);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isLoading]);

  useEffect(() => {
    if (localStorage.getItem("hasVisitedBefore")) {
      setShow(isLoading);
      if (!isLoading) {
        setFadeOut(true);
      } else {
        setFadeOut(false);
      }
    }
  }, [isLoading]);

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