import { useEffect, useState } from 'react';

export function useInfiniteScroll(callback: () => void) {
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
      
      if (scrollHeight - scrollTop <= clientHeight * 1.5 && !isFetching) {
        setIsFetching(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isFetching]);

  useEffect(() => {
    if (!isFetching) return;

    callback();
    setIsFetching(false);
  }, [isFetching, callback]);

  return { isFetching };
}