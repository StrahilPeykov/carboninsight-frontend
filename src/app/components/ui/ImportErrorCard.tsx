"use client";

import React from "react";
import Card from "./Card";
import { translateImportError } from "@/utils/translateImportError";

type ErrorItem = {
  attr: string;
  detail: string;
};

type Props = {
  row: string;
  errors: ErrorItem[];
};

export default function ImportErrorCard({ row, errors }: Props) {
  const summary = errors.find(e => e.attr.endsWith(".error"))?.detail;
  const fieldErrors = errors.filter(e => !e.attr.endsWith(".error"));

  return (
    <Card className="p-4 bg-red-50 border-l-4 border-red-500 text-sm text-gray-900">
      <p className="font-bold text-red-800 mb-1">⚠️ Import Error in Row {row}</p>
      <p className="text-gray-800 mb-2">
        {translateImportError(summary || fieldErrors[0]?.detail)}
      </p>

      {fieldErrors.length > 0 && (
        <div className="bg-white border rounded p-3 text-sm text-gray-700">
          <p className="font-semibold mb-1">Affected Fields:</p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-xs">
            {fieldErrors.map((e, i) => {
              const field = e.attr.replace(/^\d+\.row\./, "");
              return (
                <li key={i}>
                  <strong>{field}</strong>: {translateImportError(e.detail, field)}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Card>
  );
}
