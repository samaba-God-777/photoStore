import { getSupabase } from "@/lib/supabase";

export interface GalleryPhoto {
  id: string;
  title: string;
  image_url: string;
  created_at: string;
}

export interface GalleryPhotoInsert {
  title: string;
  image_url: string;
}

const BUCKET_NAME = "gallery";

const ensureBucket = async (supabase: ReturnType<typeof getSupabase>) => {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BUCKET_NAME);
  if (!exists) {
    await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
      fileSizeLimit: 5 * 1024 * 1024,
    });
  }
};

export const galleryService = {
  async getAll(): Promise<GalleryPhoto[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("gallery_photos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async upload(file: File, title: string): Promise<GalleryPhoto> {
    const supabase = getSupabase();
    await ensureBucket(supabase);

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
    const filePath = `gallery/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    const { data, error } = await supabase
      .from("gallery_photos")
      .insert({ title, image_url: urlData.publicUrl })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, title: string): Promise<GalleryPhoto> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("gallery_photos")
      .update({ title })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async remove(id: string): Promise<void> {
    const supabase = getSupabase();
    const { data: photo, error: fetchError } = await supabase
      .from("gallery_photos")
      .select("image_url")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    if (photo?.image_url) {
      const urlParts = photo.image_url.split("/");
      const bucketIndex = urlParts.indexOf(BUCKET_NAME);
      if (bucketIndex !== -1) {
        const filePath = urlParts.slice(bucketIndex + 1).join("/");
        await supabase.storage.from(BUCKET_NAME).remove([filePath]);
      }
    }

    const { error } = await supabase
      .from("gallery_photos")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
