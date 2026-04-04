"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Global cache to avoid refetching across pages or unmounts
const imageCache = new Map<string, string>();
const requestQueue: (() => Promise<void>)[] = [];
let isProcessingQueue = false;

// Simple queue to respect Jikan API rate limit (3 req/sec)
const processQueue = async () => {
  if (isProcessingQueue) return;
  isProcessingQueue = true;
  
  while (requestQueue.length > 0) {
    const task = requestQueue.shift();
    if (task) {
      await task();
      // Jikan limit is generous but 600ms stagger prevents 429 Too Many Requests
      await new Promise(r => setTimeout(r, 600)); 
    }
  }
  isProcessingQueue = false;
};

export function AnimeCover({ title, type = 'anime' }: { title: string, type?: string }) {
  const cacheKey = `${title}_${type}`;
  const [imageUrl, setImageUrl] = useState<string | null>(imageCache.get(cacheKey) || null);

  useEffect(() => {
    const cached = imageCache.get(cacheKey);
    if (cached) {
      setImageUrl(cached);
      return;
    }
    
    // Clear image immediately if type changed and isn't cached yet
    setImageUrl(null);

    requestQueue.push(async () => {
      try {
        if (type.toLowerCase() === 'series' || type.toLowerCase() === 'movie') {
          // Query TVMaze for Non-Anime content
          const res = await fetch(`https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(title)}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.image && data.image.original) {
              setImageUrl(data.image.original);
              imageCache.set(cacheKey, data.image.original);
            }
          }
        } else {
          // Query Jikan for Anime content
          const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}&limit=1`);
          if (res.ok) {
            const data = await res.json();
            if (data.data && data.data.length > 0) {
              const img = data.data[0].images.webp.large_image_url || data.data[0].images.jpg.large_image_url;
              setImageUrl(img);
              imageCache.set(cacheKey, img);
            }
          }
        }
      } catch (e) {
        console.error("Failed to fetch cover", e);
      }
    });
    
    processQueue();
  }, [title, type, cacheKey]);

  return (
    <>
      {imageUrl ? (
        <motion.img 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          src={imageUrl} 
          alt={title} 
          className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity z-0">
          <span className="text-6xl font-black rotate-[-10deg] italic uppercase whitespace-nowrap overflow-hidden blur-[1px]">
            {title}
          </span>
        </div>
      )}
      
      {/* Subtle shine effect on hover */}
      <div className="absolute inset-0 translate-x-[-100%] group-hover:animate-[shine_1.5s_ease-out] bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg] z-10" />
      
      {/* Bottom gradient overlay to make overlapping badges pop */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none z-10" />
    </>
  );
}
