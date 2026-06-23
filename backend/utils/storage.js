const { createClient } = require('@supabase/supabase-js');

const BUCKET = 'photo-store';

let supabase = null;
let bucketReady = false;

function getSupabase() {
  if (!supabase) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      throw new Error('SUPABASE_URL y SUPABASE_SERVICE_KEY deben estar configuradas');
    }
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  }
  return supabase;
}

async function ensureBucket() {
  if (bucketReady) return;
  const client = getSupabase();
  const { data: buckets } = await client.storage.listBuckets();
  const exists = buckets?.find((b) => b.name === BUCKET);
  if (!exists) {
    await client.storage.createBucket(BUCKET, { public: true, fileSizeLimit: 5242880 });
  }
  bucketReady = true;
}

// Sube un buffer (req.file.buffer de multer.memoryStorage) y devuelve la URL pública
async function uploadBuffer(buffer, originalName, folder = 'misc') {
  await ensureBucket();
  const client = getSupabase();
  const ext = (originalName.split('.').pop() || 'jpg').toLowerCase();
  const filename = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;

  const { error } = await client.storage.from(BUCKET).upload(filename, buffer, {
    contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
    upsert: false,
  });
  if (error) throw new Error(error.message);

  const { data } = client.storage.from(BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

// Elimina un archivo dado su URL pública (best-effort, no lanza si falla)
async function deleteByUrl(url) {
  try {
    if (!url) return;
    const client = getSupabase();
    const marker = `/object/public/${BUCKET}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return;
    const path = url.slice(idx + marker.length);
    await client.storage.from(BUCKET).remove([path]);
  } catch (err) {
    console.error('[storage] No se pudo eliminar el archivo:', err.message);
  }
}

module.exports = { uploadBuffer, deleteByUrl };
