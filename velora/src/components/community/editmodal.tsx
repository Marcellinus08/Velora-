"use client";

import { useState, useRef, useEffect } from "react";
import type { CommunityPost } from "./types";

interface EditModalProps {
  post: CommunityPost;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPost: { title: string; content: string }) => Promise<void>;
}

export function EditModal({ post, isOpen, onClose, onSave }: EditModalProps) {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content || "");
  const [isSaving, setIsSaving] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle ESC key
  useEffect(() => {
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    }
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave({ title, content });
      onClose();
    } catch (error) {
      console.error("Failed to save post:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div 
        ref={modalRef}
        className="w-full max-w-[500px] rounded-lg bg-neutral-900 p-6 shadow-lg"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-50">Edit Post</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 cursor-pointer"
          >
            <span className="material-icons-round">close</span>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <input
              type="text"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder="Post title"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-neutral-100 placeholder:text-neutral-500 focus:border-[var(--primary-500)] focus:outline-none"
            />
          </div>
          
          <div>
            <textarea
              value={content}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
              placeholder="Write your post content..."
              rows={5}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-neutral-100 placeholder:text-neutral-500 focus:border-[var(--primary-500)] focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-neutral-700 bg-transparent px-4 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-neutral-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !title.trim() || !content.trim()}
            className="rounded-lg bg-[var(--primary-500)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}