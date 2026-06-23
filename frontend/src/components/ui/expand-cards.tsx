"use client";

import { useState, useCallback } from "react";
import Image from "next/image";

interface GalleryImage {
  id: string;
  title: string;
  image_url: string;
}

interface ExpandCardsProps {
  images: GalleryImage[];
}

export default function ExpandCards({ images }: ExpandCardsProps) {
  const [expandedImage, setExpandedImage] = useState(0);

  const handleMouseEnter = useCallback((index: number) => {
    setExpandedImage(index);
  }, []);

  if (images.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-[#f5f4f3] rounded-3xl">
        <p className="text-neutral-500 text-lg">No hay imágenes en la galería</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#f5f4f3]">
      {/* Desktop: expand on hover */}
      <div className="hidden lg:flex w-full items-center justify-center p-2">
        <div className="w-full overflow-hidden rounded-3xl">
          <div className="flex h-[24rem] w-full items-center justify-center overflow-hidden bg-[#f5f4f3]">
            <div className="relative w-full max-w-6xl px-5">
              <div className="flex w-full items-center justify-center gap-1">
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    className="relative cursor-pointer overflow-hidden rounded-3xl transition-all duration-500 ease-in-out"
                    style={{
                      width: idx === expandedImage ? "24rem" : "5rem",
                      height: "24rem",
                    }}
                    onMouseEnter={() => handleMouseEnter(idx)}
                  >
                    <Image
                      src={img.image_url}
                      alt={img.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    {idx === expandedImage && img.title && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <p className="text-white text-sm font-semibold">{img.title}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet: horizontal scroll carousel */}
      <div className="lg:hidden overflow-x-auto snap-x snap-mandatory">
        <div className="flex gap-3 p-4" style={{ minWidth: "max-content" }}>
          {images.map((img) => (
            <div
              key={img.id}
              className="relative flex-shrink-0 snap-center overflow-hidden rounded-3xl"
              style={{ width: "16rem", height: "20rem" }}
            >
              <Image
                src={img.image_url}
                alt={img.title}
                fill
                className="object-cover"
                sizes="16rem"
              />
              {img.title && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <p className="text-white text-sm font-semibold">{img.title}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
