"use client";

import { useRef, useState } from "react";
import Button from "./Button";

type Props = {
  onSuccess?: (redirectPath: string) => void;
  allowedExtensions?: string[];
  acceptedFormatsLabel?: string;
};

export default function ReusableFileImport({
  onSuccess,
  allowedExtensions = ["json", "csv", "xlsx", "aasx"],
  acceptedFormatsLabel = "Supported formats: JSON, CSV, XLSX, AASX",
}: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileName = file.name;
      const fileExtension = fileName.split(".").pop()?.toLowerCase();

      if (allowedExtensions.includes(fileExtension || "")) {
        setSelectedFile(file);
        setFileError(null);
      } else {
        setSelectedFile(null);
        setFileError(`Invalid file format: .${fileExtension}. Please upload a valid file.`);
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    const companyId = localStorage.getItem("selected_company_id");
    const token = localStorage.getItem("access_token");
    const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();

    if (!companyId || !token) {
      setFileError("Missing company or token.");
      return;
    }

    let endpoint = "";
    let redirectPath = "";

    switch (fileExtension) {
      case "aasx":
        endpoint = `/companies/${companyId}/products/import/aas_aasx/`;
        redirectPath = "/product-list/product";
        break;
      case "json":
        endpoint = `/companies/${companyId}/products/import/aas_json/`;
        redirectPath = "/product-list/product";
        break;
      case "csv":
      case "xlsx":
        endpoint = `/companies/${companyId}/products/import/tabular/`;
        redirectPath = "/product-list/emissions-tree";
        break;
      default:
        setFileError("Unsupported file format.");
        return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.status === 413) {
        setFileError("File too large. Must be under 25MB.");
        return;
      }

      if (!res.ok) {
        const err = await res.json();
        setFileError(err?.detail || "Upload failed.");
        return;
      }

      if (fileExtension === "aasx") {
        const data = await res.json();
        const productId = data?.product_id;
        if (productId) {
          onSuccess?.(`/product-list/emissions-tree?id=${productId}&cid=${companyId}`);
        } else {
          setFileError("Upload succeeded, but product ID is missing.");
        }
      } else {
        onSuccess?.(redirectPath);
      }
    } catch (error) {
      console.error(error);
      setFileError("Unexpected error occurred.");
    }
  };

  return (
    <>
      <input
        type="file"
        accept={allowedExtensions.map(ext => `.${ext}`).join(", ")}
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <div className="flex justify-between">
        <div className="flex flex-col items-start">
          <Button onClick={handleUploadClick}>Upload</Button>

          {selectedFile && (
            <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">
              Selected file: {selectedFile.name}
            </p>
          )}

          {fileError && <p className="mt-4 text-sm text-red-600 dark:text-red-500">{fileError}</p>}

          <p className="mt-2 mb-2 text-xs text-gray-500 dark:text-gray-400">
            {acceptedFormatsLabel}
          </p>
        </div>

        <div className="flex flex-col items-end">
          <Button
            onClick={selectedFile ? handleSubmit : undefined}
            disabled={!selectedFile}
            className={!selectedFile ? "opacity-50 cursor-not-allowed" : ""}
          >
            Go to results
          </Button>
          {!selectedFile && (
            <p className="mt-2 text-xs text-amber-500">Please upload a valid file first</p>
          )}
        </div>
      </div>
    </>
  );
}
