import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OMDbMovie } from "@/services/omdb";
import { Star, Calendar, Clock, Globe, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface OMDbModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: OMDbMovie | null;
  isLoading: boolean;
}

export const OMDbModal = ({ isOpen, onClose, data, isLoading }: OMDbModalProps) => {
  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-netflix-black border-gray-800">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-netflix-red"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!data) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl bg-netflix-black border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Information Not Available</DialogTitle>
          </DialogHeader>
          <p className="text-gray-400">Sorry, we couldn't find detailed information for this title.</p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-netflix-black border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white font-bold">{data.Title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Poster and Basic Info */}
          <div className="flex flex-col md:flex-row gap-6">
            {data.Poster && data.Poster !== 'N/A' && (
              <img 
                src={data.Poster} 
                alt={data.Title}
                className="w-full md:w-64 rounded-lg shadow-xl"
              />
            )}
            
            <div className="flex-1 space-y-4">
              {/* Meta Info */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-netflix-red/20 border-netflix-red text-white">
                  {data.Type}
                </Badge>
                <Badge variant="outline" className="border-gray-600 text-gray-300">
                  {data.Rated}
                </Badge>
                <Badge variant="outline" className="border-gray-600 text-gray-300">
                  {data.Year}
                </Badge>
              </div>

              {/* Key Details */}
              <div className="space-y-3">
                {data.Runtime && data.Runtime !== 'N/A' && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <Clock className="w-4 h-4 text-netflix-red" />
                    <span>{data.Runtime}</span>
                  </div>
                )}
                
                {data.Released && data.Released !== 'N/A' && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="w-4 h-4 text-netflix-red" />
                    <span>Released: {data.Released}</span>
                  </div>
                )}
                
                {data.Language && data.Language !== 'N/A' && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <Globe className="w-4 h-4 text-netflix-red" />
                    <span>Languages: {data.Language}</span>
                  </div>
                )}

                {data.Awards && data.Awards !== 'N/A' && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <Award className="w-4 h-4 text-netflix-red" />
                    <span>{data.Awards}</span>
                  </div>
                )}
              </div>

              {/* Ratings */}
              {data.Ratings && data.Ratings.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    Ratings
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {data.imdbRating && data.imdbRating !== 'N/A' && (
                      <div className="bg-yellow-500/20 px-3 py-1 rounded">
                        <span className="text-yellow-500 font-bold">IMDb: {data.imdbRating}</span>
                      </div>
                    )}
                    {data.Ratings.map((rating, index) => (
                      <div key={index} className="bg-gray-800 px-3 py-1 rounded">
                        <span className="text-gray-300 text-sm">
                          {rating.Source}: <span className="font-semibold text-white">{rating.Value}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Plot */}
          {data.Plot && data.Plot !== 'N/A' && (
            <div className="space-y-2">
              <h3 className="text-white font-semibold">Plot</h3>
              <p className="text-gray-300 leading-relaxed">{data.Plot}</p>
            </div>
          )}

          {/* Genre */}
          {data.Genre && data.Genre !== 'N/A' && (
            <div className="space-y-2">
              <h3 className="text-white font-semibold">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {data.Genre.split(', ').map((genre, index) => (
                  <Badge key={index} variant="secondary" className="bg-gray-800 text-gray-300">
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Cast and Crew */}
          <div className="grid md:grid-cols-2 gap-4">
            {data.Director && data.Director !== 'N/A' && (
              <div className="space-y-1">
                <h3 className="text-white font-semibold">Director</h3>
                <p className="text-gray-300">{data.Director}</p>
              </div>
            )}
            
            {data.Writer && data.Writer !== 'N/A' && (
              <div className="space-y-1">
                <h3 className="text-white font-semibold">Writer</h3>
                <p className="text-gray-300">{data.Writer}</p>
              </div>
            )}
          </div>

          {data.Actors && data.Actors !== 'N/A' && (
            <div className="space-y-2">
              <h3 className="text-white font-semibold">Cast</h3>
              <p className="text-gray-300">{data.Actors}</p>
            </div>
          )}

          {/* Additional Info */}
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            {data.Country && data.Country !== 'N/A' && (
              <div className="space-y-1">
                <h3 className="text-gray-400">Country</h3>
                <p className="text-gray-300">{data.Country}</p>
              </div>
            )}
            
            {data.BoxOffice && data.BoxOffice !== 'N/A' && (
              <div className="space-y-1">
                <h3 className="text-gray-400">Box Office</h3>
                <p className="text-gray-300">{data.BoxOffice}</p>
              </div>
            )}
            
            {data.Production && data.Production !== 'N/A' && (
              <div className="space-y-1">
                <h3 className="text-gray-400">Production</h3>
                <p className="text-gray-300">{data.Production}</p>
              </div>
            )}
            
            {data.Website && data.Website !== 'N/A' && (
              <div className="space-y-1">
                <h3 className="text-gray-400">Website</h3>
                <a href={data.Website} target="_blank" rel="noopener noreferrer" className="text-netflix-red hover:underline">
                  Visit Official Website
                </a>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
