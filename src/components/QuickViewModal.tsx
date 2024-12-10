import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { Plus, Check } from "lucide-react";

interface QuickViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  id: number;
  posterPath: string;
  mediaType: 'movie' | 'tv';
}

export function QuickViewModal({
  open,
  onOpenChange,
  title,
  id,
  posterPath,
  mediaType,
}: QuickViewModalProps) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const inWatchlist = isInWatchlist(id);

  const handleWatchlistClick = () => {
    if (inWatchlist) {
      removeFromWatchlist(id);
    } else {
      addToWatchlist({ id, title, posterPath, mediaType });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <Button
            onClick={handleWatchlistClick}
            variant={inWatchlist ? "secondary" : "default"}
            className="w-full"
          >
            {inWatchlist ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                In Watchlist
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add to Watchlist
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}