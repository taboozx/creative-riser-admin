"use client";

import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";

type Props = {
  file: File | null;
  onFile: (file: File) => void;
};

export default function Dropzone({ file, onFile }: Props) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFile(acceptedFiles[0]);
  }, [onFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()} className={`border p-10 rounded-md text-center ${isDragActive ? "bg-gray-700" : "bg-gray-800"}`}>
      <input {...getInputProps()} />
      {file ? (
        <>
          {file.type.startsWith("image/") && <img src={URL.createObjectURL(file)} alt="preview" className="mx-auto max-h-48" />}
          {file.type.startsWith("video/") && <video src={URL.createObjectURL(file)} controls className="mx-auto max-h-48" />}
          <p>{file.name}</p>
        </>
      ) : (
        <p>Drop file here or click to select</p>
      )}
    </div>
  );
}
