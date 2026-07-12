'use client';


 

import { useState, useRef } from 'react';

import { createBrowserSupabaseClient } from '@/lib/supabase/client';

import { Upload, X } from 'lucide-react';


 

interface Props {

  currentUrl: string | null;

  onUpload: (url: string) => void;

}


 

export default function MealImageUpload({ currentUrl, onUpload }: Props) {

  const [uploading, setUploading] = useState(false);

  const [preview,   setPreview]   = useState<string | null>(currentUrl);

  const [error,     setError]     = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);


 

  async function handleFile(file: File) {

    if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return; }

    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5 MB.'); return; }


 

    setUploading(true);

    setError(null);


 

    const supabase = createBrowserSupabaseClient();

    const ext  = file.name.split('.').pop();

    const path = `meals/${Date.now()}.${ext}`;


 

    const { error: uploadError } = await supabase.storage.from('meal-images').upload(path, file, { upsert: true });

    if (uploadError) { setError(uploadError.message); setUploading(false); return; }


 

    const { data } = supabase.storage.from('meal-images').getPublicUrl(path);

    setPreview(data.publicUrl);

    onUpload(data.publicUrl);

    setUploading(false);

  }


 

  return (

    <div className="flex flex-col gap-3">

      {preview ? (

        <div className="relative w-full overflow-hidden rounded-[16px]" style={{ height: '200px' }}>

          {/* eslint-disable-next-line @next/next/no-img-element */}

          <img src={preview} alt="Meal preview" className="h-full w-full object-cover" />

          <button

            type="button"

            onClick={() => { setPreview(null); onUpload(''); }}

            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full"

            style={{ background: 'rgba(0,0,0,.5)' }}

          >

            <X size={14} style={{ color: '#fff' }} />

          </button>

        </div>

      ) : (

        <button

          type="button"

          onClick={() => inputRef.current?.click()}

          disabled={uploading}

          className="flex h-40 w-full flex-col items-center justify-center gap-3 rounded-[16px] transition-colors duration-200"

          style={{ border: '2px dashed rgba(22,32,25,.2)', background: 'rgba(22,32,25,.03)' }}

        >

          <Upload size={24} strokeWidth={1.5} style={{ color: '#4B5A50' }} />

          <span className="text-[13px]" style={{ color: '#4B5A50' }}>

            {uploading ? 'Uploading…' : 'Click to upload image'}

          </span>

        </button>

      )}


 

      <input

        ref={inputRef}

        type="file"

        accept="image/*"

        className="hidden"

        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}

      />


 

      {error && <p className="text-[12px]" style={{ color: '#b93a3a' }}>{error}</p>}

    </div>

  );

}