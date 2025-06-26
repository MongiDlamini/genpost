"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"
import Image from "next/image"

interface MediaUploaderProps {
  onMediaUpload: (files: string[]) => void
  maxFiles?: number
  mode: "quick" | "standard"
}

export function MediaUploader({ onMediaUpload, maxFiles = 10, mode }: MediaUploaderProps) {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // TODO: Implement actual file upload to Cloudflare R2
      const newFiles = acceptedFiles.map((file) => URL.createObjectURL(file))
      const updatedFiles = [...uploadedFiles, ...newFiles].slice(0, maxFiles)
      setUploadedFiles(updatedFiles)
      onMediaUpload(updatedFiles)
    },
    [uploadedFiles, maxFiles, onMediaUpload],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    maxFiles: maxFiles - uploadedFiles.length,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const removeFile = (index: number) => {
    const updatedFiles = uploadedFiles.filter((_, i) => i !== index)
    setUploadedFiles(updatedFiles)
    onMediaUpload(updatedFiles)
  }

  return (
    <div className="space-y-4">
      {uploadedFiles.length < maxFiles && (
        <Card
          {...getRootProps()}
          className={`border-2 border-dashed cursor-pointer transition-colors ${
            isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <CardContent className="flex flex-col items-center justify-center py-8">
            <input {...getInputProps()} />
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 text-center">
              {isDragActive ? (
                "Drop the files here..."
              ) : (
                <>
                  Drag & drop images here, or <span className="text-blue-600">browse</span>
                  <br />
                  <span className="text-xs text-gray-500">
                    Max {maxFiles} file{maxFiles > 1 ? "s" : ""}, up to 10MB each
                  </span>
                </>
              )}
            </p>
          </CardContent>
        </Card>
      )}

      {uploadedFiles.length > 0 && (
        <div className={`grid gap-3 ${mode === "quick" ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3"}`}>
          {uploadedFiles.map((file, index) => (
            <div key={index} className="relative group">
              <Image
                src={file || "/placeholder.svg"}
                alt={`Upload ${index + 1}`}
                width={200}
                height={200}
                className="w-full h-32 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
