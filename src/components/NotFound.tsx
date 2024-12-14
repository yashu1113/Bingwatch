import { SearchX } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

interface NotFoundProps {
  message?: string;
}

export const NotFound = ({ message = "No results found" }: NotFoundProps) => {
  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center space-y-6 px-4 text-center animate-fade-up">
      <div className="rounded-full bg-netflix-black/10 p-6">
        <SearchX className="h-12 w-12 text-netflix-red sm:h-16 sm:w-16" />
      </div>
      
      <h2 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl">
        {message}
      </h2>
      
      <p className="max-w-md text-base text-white/60 sm:text-lg">
        Try adjusting your search or browse our trending content
      </p>
      
      <Link to="/">
        <Button
          variant="default"
          className="bg-netflix-red hover:bg-netflix-red/90 text-base sm:text-lg"
        >
          Back to Home
        </Button>
      </Link>
    </div>
  );
};