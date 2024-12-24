import React, { useState } from 'react';
import { getImageUrl } from '../utils/imageUrl';

const HeroSlider = ({ items, trailers }) => {
  const [imagesLoaded, setImagesLoaded] = useState([]);

  const handleImageLoad = (index) => {
    setImagesLoaded((prevState) => {
      const updatedState = [...prevState];
      updatedState[index] = true;
      return updatedState;
    });
  };

  return (
    <div className="relative w-full overflow-hidden" style={{ height: 'calc(50vh)' }}>
      {/* Dynamic container height for responsiveness */}
      <div className="md:h-[70vh] lg:h-[90vh]">
        {items.map((item, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === 0 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Image element */}
            <img
              src={getImageUrl(item.backdrop_path, 'original')}
              alt={item.title || item.name}
              className={`h-full w-full object-cover object-center transition-opacity duration-300 ${
                imagesLoaded[index] ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                objectFit: 'cover',
                height: '100%',
                width: '100%',
              }}
              loading="lazy"
              onLoad={() => handleImageLoad(index)}
            />

            {/* Trailer (if available) */}
            {trailers && trailers[index]?.key && (
              <div className="absolute inset-0 flex justify-center items-center">
                <iframe
                  src={`https://www.youtube.com/embed/${trailers[index]?.key}`}
                  title="Trailer"
                  allowFullScreen
                  className="w-full h-full object-contain"
                  style={{
                    aspectRatio: '16/9',
                    maxHeight: '70%',
                  }}
                ></iframe>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
