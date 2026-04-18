"use client";

import { useState, useEffect } from "react";

interface ToastProps {
  message: string;
  onClose: () => void;
}

export default function Toast({ message, onClose }: ToastProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onClose, 300);
    }, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full glass-card text-sm font-semibold text-white shadow-lg ${
        exiting ? "toast-exit" : "toast-enter"
      }`}
      style={{ border: "1px solid rgba(0, 229, 255, 0.3)" }}
    >
      {message}
    </div>
  );
}
