"use client";

import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ACCEPTED_PROOF_IMAGE_TYPES, MAX_PROOF_IMAGES } from "../constants";
import { resolveMediaUrl } from "../utils/build-help-request-form-data";
import { useFormContext } from "react-hook-form";

type ProofPreview = {
  key: string;
  src: string;
  kind: "url" | "file";
  urlIndex?: number;
  fileIndex?: number;
};

export function ProofImagesUpload() {
  const form = useFormContext();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <FormField
      control={form.control}
      name="proofImageUrls"
      render={() => {
        const urls = (form.watch("proofImageUrls") as string[] | undefined) ?? [];
        const files =
          (form.watch("proofImageFiles") as File[] | undefined) ?? [];
        const totalCount = urls.length + files.length;
        const atLimit = totalCount >= MAX_PROOF_IMAGES;

        const previews: ProofPreview[] = [
          ...urls.map((url, index) => ({
            key: `url-${url}-${index}`,
            src: resolveMediaUrl(url),
            kind: "url" as const,
            urlIndex: index,
          })),
          ...files.map((file, index) => ({
            key: `file-${file.name}-${index}`,
            src: URL.createObjectURL(file),
            kind: "file" as const,
            fileIndex: index,
          })),
        ];

        const addFiles = (fileList: FileList | null) => {
          if (!fileList?.length) return;

          const nextUrls = [...urls];
          const nextFiles = [...files];

          for (const file of Array.from(fileList)) {
            if (nextUrls.length + nextFiles.length >= MAX_PROOF_IMAGES) break;
            if (
              !ACCEPTED_PROOF_IMAGE_TYPES.includes(
                file.type as (typeof ACCEPTED_PROOF_IMAGE_TYPES)[number],
              )
            ) {
              continue;
            }
            nextFiles.push(file);
          }

          form.setValue("proofImageUrls", nextUrls, { shouldDirty: true });
          form.setValue("proofImageFiles", nextFiles, { shouldDirty: true });
        };

        const removePreview = (preview: ProofPreview) => {
          if (preview.kind === "url" && preview.urlIndex !== undefined) {
            form.setValue(
              "proofImageUrls",
              urls.filter((_, index) => index !== preview.urlIndex),
              { shouldDirty: true },
            );
          }
          if (preview.kind === "file" && preview.fileIndex !== undefined) {
            form.setValue(
              "proofImageFiles",
              files.filter((_, index) => index !== preview.fileIndex),
              { shouldDirty: true },
            );
          }
        };

        return (
          <FormItem>
            <FormLabel>Supporting photos (optional)</FormLabel>
            <FormDescription>
              Invoices, medical letters, rent agreements, or other proof of need
              — up to {MAX_PROOF_IMAGES} images.
            </FormDescription>
            <FormControl>
              <div className="space-y-3">
                <input
                  ref={inputRef}
                  type="file"
                  accept={ACCEPTED_PROOF_IMAGE_TYPES.join(",")}
                  multiple
                  className="sr-only"
                  onChange={(e) => {
                    addFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  disabled={atLimit}
                  onClick={() => inputRef.current?.click()}
                >
                  <ImagePlus className="size-4" />
                  Add photos
                </Button>

                {previews.length > 0 ? (
                  <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {previews.map((preview) => (
                      <li
                        key={preview.key}
                        className="group relative aspect-4/3 overflow-hidden rounded-lg border border-border bg-muted"
                      >
                        <img
                          src={preview.src}
                          alt="Proof"
                          className="h-full w-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon-xs"
                          className="absolute top-1 right-1 opacity-90 group-hover:opacity-100"
                          onClick={() => removePreview(preview)}
                          aria-label="Remove photo"
                        >
                          <X className="size-3" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
