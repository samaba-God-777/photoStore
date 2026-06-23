"use client";

import { useState, useEffect, useCallback } from "react";
import {
  galleryService,
  type GalleryPhoto,
} from "@/services/galleryService";

export function useGalleryPhotos() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPhotos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await galleryService.getAll();
      setPhotos(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar la galería"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await galleryService.getAll();
        if (!cancelled) {
          setPhotos(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Error al cargar la galería"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const uploadPhoto = async (file: File, title: string) => {
    const photo = await galleryService.upload(file, title);
    setPhotos((prev) => [photo, ...prev]);
    return photo;
  };

  const updatePhoto = async (id: string, title: string) => {
    const updated = await galleryService.update(id, title);
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, title: updated.title } : p))
    );
    return updated;
  };

  const deletePhoto = async (id: string) => {
    await galleryService.remove(id);
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  return {
    photos,
    loading,
    error,
    fetchPhotos,
    uploadPhoto,
    updatePhoto,
    deletePhoto,
  };
}
