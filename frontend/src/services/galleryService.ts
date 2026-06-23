import { getSupabase } from "@/lib/supabase";
import { BASE_URL, getToken } from "@/lib/api";

export interface GalleryPhoto {
  id: string;
  title: string;
  image_url: string;
  created_at: string;
}

const authHeaders = (): Record<string, string> => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleRes = async (res: Response) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error del servidor.");
  return data;
};

export const galleryService = {
  // Lectura pública: directo a Supabase (RLS permite SELECT a cualquiera)
  async getAll(): Promise<GalleryPhoto[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("gallery_photos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Escrituras: vía backend (usa la service_role key del servidor, evita el
  // bloqueo de RLS que ocurre porque esta app no usa Supabase Auth)
  async upload(file: File, title: string): Promise<GalleryPhoto> {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("title", title);

    const res = await fetch(`${BASE_URL}/gallery`, {
      method: "POST",
      headers: authHeaders(),
      body: formData,
    });
    const json = await handleRes(res);
    return json.data;
  },

  async update(id: string, title: string): Promise<GalleryPhoto> {
    const res = await fetch(`${BASE_URL}/gallery/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ title }),
    });
    const json = await handleRes(res);
    return json.data;
  },

  async remove(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/gallery/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    await handleRes(res);
  },
};
