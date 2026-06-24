import { BASE_URL, getToken } from "@/lib/api";

const authHeaders = (): Record<string, string> => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleRes = async (res: Response) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error del servidor.");
  return data;
};

export const settingsService = {
  async get(key: string): Promise<string | null> {
    const res = await fetch(`${BASE_URL}/settings/${key}`);
    const json = await handleRes(res);
    return json.data?.value ?? null;
  },

  async uploadImage(key: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`${BASE_URL}/settings/${key}`, {
      method: "PUT",
      headers: authHeaders(),
      body: formData,
    });
    const json = await handleRes(res);
    return json.data.value;
  },
};
