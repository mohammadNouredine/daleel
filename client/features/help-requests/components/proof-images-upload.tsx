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
import { useFormContext } from "react-hook-form";

export function ProofImagesUpload() {
  const form = useFormContext();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <FormField
      control={form.control}
      name="proofImageUrls"
      render={({ field }) => {
        const urls = (field.value as string[] | undefined) ?? [];
        const atLimit = urls.length >= MAX_PROOF_IMAGES;

        const addFiles = (files: FileList | null) => {
          if (!files?.length) return;

          const next = [...urls];
          for (const file of Array.from(files)) {
            if (next.length >= MAX_PROOF_IMAGES) break;
            if (
              !ACCEPTED_PROOF_IMAGE_TYPES.includes(
                file.type as (typeof ACCEPTED_PROOF_IMAGE_TYPES)[number],
              )
            ) {
              continue;
            }
            next.push(URL.createObjectURL(file));
          }
          field.onChange(next);
        };

        const removeAt = (index: number) => {
          const target = urls[index];
          if (target?.startsWith("blob:")) {
            URL.revokeObjectURL(target);
          }
          field.onChange(urls.filter((_, i) => i !== index));
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

                {urls.length > 0 ? (
                  <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {urls.map((url, index) => (
                      <li
                        key={`${url}-${index}`}
                        className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted"
                      >
                        <img
                          src={url}
                          alt={`Proof ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon-xs"
                          className="absolute top-1 right-1 opacity-90 group-hover:opacity-100"
                          onClick={() => removeAt(index)}
                          aria-label={`Remove photo ${index + 1}`}
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
