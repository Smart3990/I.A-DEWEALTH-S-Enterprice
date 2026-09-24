import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Btn, PageHead, Panel } from "@/components/admin/kit";
import { logActivity } from "@/lib/admin-auth";
import { uploadMediaFile, deleteMediaFile } from "@/lib/media.functions";

export const Route = createFileRoute("/admin/media")({
  component: MediaAdmin,
});

function MediaAdmin() {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const { data: rows = [] } = useQuery({
    queryKey: ["admin", "media"],
    queryFn: async () => {
      const { data, error: e } = await supabase
        .from("media")
        .select("*")
        .order("created_at", { ascending: false });
      if (e) return [];
      return data ?? [];
    },
  });

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await uploadMediaFile({
        data: {
          filename: file.name,
          base64Data,
          mimeType: file.type || "image/jpeg",
          size: file.size,
        },
      });
      await logActivity(`Uploaded image ${file.name}`);
      return res;
    },
    onError: (e) => setError((e as Error).message),
    onSuccess: () => {
      setError("");
      qc.invalidateQueries({ queryKey: ["admin", "media"] });
    },
  });

  const remove = useMutation({
    mutationFn: async (row: { id: string; path: string; name: string }) => {
      await deleteMediaFile({
        data: {
          id: row.id,
          path: row.path,
        },
      });
      await logActivity(`Deleted image ${row.name}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "media"] }),
  });

  return (
    <div>
      <PageHead
        title="Media"
        description="Upload images, then copy a link to use on products, categories or banners."
        action={
          <Btn onClick={() => inputRef.current?.click()} disabled={upload.isPending}>
            <Upload className="h-4 w-4" /> {upload.isPending ? "Uploading…" : "Upload image"}
          </Btn>
        }
      />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload.mutate(file);
          e.target.value = "";
        }}
      />
      {error && <p className="mb-3 text-sm text-destructive">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((r) => (
          <Panel key={r.id}>
            <div className="mb-3 flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-secondary">
              <img src={r.url} alt={r.name} className="h-full w-full object-contain" />
            </div>
            <p className="truncate text-sm font-bold">{r.name}</p>
            <p className="mb-3 text-xs text-muted-foreground">{Math.round(r.size / 1024)} KB</p>
            <div className="flex gap-2">
              <Btn tone="ghost" onClick={() => navigator.clipboard?.writeText(r.url)}>
                <Copy className="h-3.5 w-3.5" /> Copy link
              </Btn>
              <Btn
                tone="danger"
                onClick={() => {
                  if (confirm("Delete this image?")) remove.mutate(r);
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Btn>
            </div>
          </Panel>
        ))}
        {!rows.length && (
          <Panel>
            <p className="text-sm text-muted-foreground">No images uploaded yet.</p>
          </Panel>
        )}
      </div>
    </div>
  );
}
