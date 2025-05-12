"use client";

import { ReactNode, useEffect } from "react";
import ReactDOM from "react-dom";
import Button from "./Button";

interface ModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export default function Modal({ title, children, onClose }: ModalProps) {
  // Lock background scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Render modal into document.body via a portal
  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-md p-6 transform">
        <header className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          {/* Icon button to close */}
          <Button variant="icon" onClick={onClose} aria-label="Close">
            ×
          </Button>
        </header>
        <div>{children}</div>
      </div>
    </div>,
    document.body
  );
}
