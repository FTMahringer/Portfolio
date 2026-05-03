'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface ProjectImageGalleryProps {
  images: string[];
  title: string;
}

export function ProjectImageGallery({ images, title }: ProjectImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) return null;

  const selectedImage = images[selectedIndex];

  return (
    <div className="mb-10">
      {/* Hero Image */}
      <div className="relative aspect-video rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--card)] mb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative w-full h-full"
          >
            <Image
              src={selectedImage}
              alt={`${title} - Image ${selectedIndex + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              priority={selectedIndex === 0}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Thumbnail Belt */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-2">
          {images.map((img, index) => (
            <button
              key={img}
              onClick={() => setSelectedIndex(index)}
              className={`relative flex-shrink-0 w-24 h-16 rounded border-2 transition-all overflow-hidden ${
                index === selectedIndex
                  ? 'border-[var(--accent)] scale-105 shadow-lg'
                  : 'border-[var(--border)] hover:border-[var(--muted)] opacity-70 hover:opacity-100'
              }`}
              title={`View image ${index + 1}`}
            >
              <Image
                src={img}
                alt={`${title} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
