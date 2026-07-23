'use client';


 

import { useState } from 'react';

import { createBrowserSupabaseClient } from '@/lib/supabase/client';


 

interface Props {

  /** FormData field name the server action will read */

  name?: string;

  defaultValue?: string | null;

  /** Supabase storage bucket */

  bucket?: string;

  /** Path prefix inside the bucket */

  folder?: string;

}


 

export default function ImageUploadField({

  name = 'image_url',

  defaultValue,

  bucket = 'meal-images',

  folder = 'menu',

}: Props) {

  const [url,       setUrl]       = useState(defaultValue ?? '');

  const [uploading, setUploading] = useState(false);

  const [error,     setError]     = useState<string | null>(null);


 

  async function handleFile(file: File) {

    if (!file.type.startsWith('image/')) { setError('Select an image file.'); return; }

    if (file.size > 5 * 1024 * 1024)    { setError('Max file size is 5 MB.'); return; }


 

    setUploading(true);

    setError(null);


 

    const supabase = createBrowserSupabaseClient();

    const ext  = file.name.split('.').pop();

    const path = `${folder}/${Date.now()}.${ext}`;


 

    const { error: uploadErr } = await supabase.storage

      .from(bucket)

      .upload(path, file, { upsert: true });


 

    if (uploadErr) { setError(uploadErr.message); setUploading(false); return; }


 

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);

    setUrl(data.publicUrl);

    setUploading(false);

  }


 

  return (

    <div className="flex flex-col gap-2">

      {/* Hidden input — server action reads this via FormData */}

      <input type="hidden" name={name} value={url} />


 

      <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Image</label>


 

      {/* Preview */}

      {url ? (

        <div className="relative w-24 h-24">

          {/* eslint-disable-next-line @next/next/no-img-element */}

          <img src={url} alt="Preview" className="w-24 h-24 rounded-[12px] object-cover" />

          <button

            type="button"

            onClick={() => setUrl('')}

            className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"

            style={{ background: '#b93a3a', color: 'white' }}

          >

            ✕

          </button>

        </div>

      ) : (

        <div

          className="flex h-24 w-24 items-center justify-center rounded-[12px] text-[11px]"

          style={{ border: '2px dashed rgba(22,32,25,.18)', color: '#4B5A50' }}

        >

          No image

        </div>

      )}


 

      {/* Upload button */}

      <label

        className="w-fit cursor-pointer rounded-[12px] px-3 py-2 text-[12px] font-medium"

        style={{ border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50', background: 'white' }}

      >

        {uploading ? 'Uploading…' : url ? 'Replace Image' : 'Upload Image'}

        <input

          type="file"

          accept="image/*"

          className="hidden"

          disabled={uploading}

          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}

        />

      </label>


 

      {/* Paste URL fallback */}

      <input

        type="text"

        value={url}

        onChange={(e) => setUrl(e.target.value)}

        placeholder="Or paste image URL…"

        className="rounded-[12px] px-3 py-2 text-[12px]"

        style={{ border: '1px solid rgba(22,32,25,.1)', background: 'white', color: '#162019', outline: 'none', maxWidth: '300px' }}

      />


 

      {error && <p className="text-[11px]" style={{ color: '#b93a3a' }}>{error}</p>}

    </div>

  );

}