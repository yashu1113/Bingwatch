import { TrendingSlider } from "@/components/TrendingSlider";
import { Genres } from "@/components/Genres";

const Index = () => {
  return (
    <div className="space-y-8">
      <div className="-mt-16">
        <TrendingSlider />
      </div>
      
      <div className="container">
        <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl">
          Explore by Genre
        </h2>
        <Genres />
      </div>
    </div>
  );
};

export default Index;