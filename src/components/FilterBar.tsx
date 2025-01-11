import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useQuery } from "@tanstack/react-query";
import { getGenres } from "@/services/tmdb";

interface FilterBarProps {
  onFilterChange: (filters: {
    genre?: string;
    year?: string;
    rating?: number;
    sort?: string;
  }) => void;
}

export const FilterBar = ({ onFilterChange }: FilterBarProps) => {
  const [filters, setFilters] = useState({
    genre: "",
    year: "",
    rating: 0,
    sort: "",
  });

  const { data: genres } = useQuery({
    queryKey: ["genres", "movie"],
    queryFn: () => getGenres("movie"),
  });

  const years = Array.from(
    { length: new Date().getFullYear() - 1900 + 1 },
    (_, i) => new Date().getFullYear() - i
  );

  const handleFilterChange = (key: string, value: string | number) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 bg-black/50 rounded-lg mb-6">
      <Select
        onValueChange={(value) => handleFilterChange("genre", value)}
        value={filters.genre}
      >
        <SelectTrigger className="w-full md:w-[180px] bg-black/50">
          <SelectValue placeholder="Select Genre" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Genres</SelectItem>
          {genres?.genres.map((genre: { id: number; name: string }) => (
            <SelectItem key={genre.id} value={genre.id.toString()}>
              {genre.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        onValueChange={(value) => handleFilterChange("year", value)}
        value={filters.year}
      >
        <SelectTrigger className="w-full md:w-[180px] bg-black/50">
          <SelectValue placeholder="Select Year" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Years</SelectItem>
          {years.slice(0, 30).map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        onValueChange={(value) => handleFilterChange("sort", value)}
        value={filters.sort}
      >
        <SelectTrigger className="w-full md:w-[180px] bg-black/50">
          <SelectValue placeholder="Sort By" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Default</SelectItem>
          <SelectItem value="popularity.desc">Most Popular</SelectItem>
          <SelectItem value="vote_average.desc">Highest Rated</SelectItem>
          <SelectItem value="release_date.desc">Newest First</SelectItem>
          <SelectItem value="release_date.asc">Oldest First</SelectItem>
        </SelectContent>
      </Select>

      <div className="w-full md:w-[200px] space-y-2">
        <label className="text-sm text-gray-300">Minimum Rating: {filters.rating}</label>
        <Slider
          defaultValue={[0]}
          max={10}
          step={0.5}
          value={[filters.rating]}
          onValueChange={(value) => handleFilterChange("rating", value[0])}
          className="w-full"
        />
      </div>
    </div>
  );
};