"use client";

import { useRef, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Link from "next/link";

export default function GetStartedPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [showUploadCard, setShowUploadCard] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileName = file.name;
      const fileExtension = fileName.split(".").pop()?.toLowerCase();

      if (
        fileExtension == "json" ||
        fileExtension == "csv" ||
        fileExtension == "xlsx" ||
        fileExtension == "aasx"
      ) {
        setSelectedFile(file);
        setFileError(null);
      } else {
        setSelectedFile(null);
        setFileError(
          `Invalid file format: .${fileExtension}. Please upload a .json, .csv, or .xlsx file.`
        );
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Get Started
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
          Please upload your files or enter data manually
        </p>
      </div>

      <div className="space-y-10">
        <Card className="max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-6">Choose your method</h2>
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <button
                className={`px-4 py-2 border-2 ${showUploadCard ? "border-red text-red" : "border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300"} rounded-md font-medium hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                onClick={() => setShowUploadCard(!showUploadCard)}
              >
                File Upload
              </button>
              <Link href="/self-assessment">
                <button className="px-4 py-2 border-2 border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
                  Manual Entry
                </button>
              </Link>
            </div>
          </div>
        </Card>

        {showUploadCard && (
          <Card className="max-w-3xl mx-auto">
            <input
              type="file"
              accept=".json, .csv, .xlsx"
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

                {fileError && (
                  <p className="mt-4 text-sm text-red-600 dark:text-red-500">{fileError}</p>
                )}

                <p className="mt-2 mb-2 text-xs text-gray-500 dark:text-gray-400">
                  Supported formats: JSON, CSV, XLSX
                </p>
              </div>

              <div className="flex flex-col items-end">
                <Button
                  onClick={selectedFile ? () => (window.location.href = "/results") : undefined}
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
          </Card>
        )}
      </div>
    </div>
  );
}
