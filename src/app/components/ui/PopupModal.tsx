"use client";

import {ReactNode, useEffect, useState} from "react";
import ReactDOM from "react-dom";
import Button from "./Button";

interface PopupModalProps {
    title: string;
    confirmationRequiredText?: string;
    confirmLabel?: string;
    onConfirm?: () => void;
    onClose: () => void;
    children: ReactNode;
}

export default function PopupModal({
                                       title,
                                       confirmationRequiredText = "",
                                       confirmLabel = "Confirm",
                                       onConfirm,
                                       onClose,
                                       children,
                                   }: PopupModalProps) {
    // Prevent background scrolling while modal is open
    useEffect(() => {
        const origOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = origOverflow;
        };
    }, []);

    // Local state for the “type-to-confirm” input
    const [inputValue, setInputValue] = useState("");
    // Only enable confirm when (a) no text required or (b) input matches exactly
    const isMatch = confirmationRequiredText ? inputValue === confirmationRequiredText : true;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
                <header className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
                    <Button
                        variant="icon"
                        onClick={onClose}
                        aria-label="Close modal"
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        &times;
                    </Button>
                </header>

                <div className="mb-4 text-gray-700 dark:text-gray-300">{children}</div>

                {confirmationRequiredText && (
                    <div className="mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            To confirm, type{" "}
                            <strong className="text-gray-900 dark:text-gray-100">
                                {confirmationRequiredText}
                            </strong>{" "}
                            below:
                        </p>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            className="mt-2 w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                )}

                {(onConfirm || confirmationRequiredText) && (
                    <footer className="flex justify-end space-x-2 mt-4">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            onClick={onConfirm}
                            disabled={!isMatch}
                            className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
                        >
                            {confirmLabel}
                        </Button>
                    </footer>
                )}
            </div>
        </div>,
        document.body
    );
}
