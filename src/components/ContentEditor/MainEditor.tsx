"use client";

import { useRef } from "react";
import TextareaAutosize from "react-textarea-autosize";
import type { User } from "@supabase/supabase-js";

interface MainEditorProps {
  content: string;
  setContent: (content: string) => void;
  pushContent: (content: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  user: User | null;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  contentId?: string;
}

import { useCollaboration } from "@/hooks/useCollaboration";

export function MainEditor({
  content,
  setContent,
  pushContent,
  handleKeyDown,
  user,
  textareaRef,
  contentId
}: MainEditorProps) {
  const { collaborators, updatePresence, broadcastContentUpdate } = useCollaboration(contentId, user);

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    
    const pastedText = e.clipboardData.getData('text');
    const cursorPosition = e.currentTarget.selectionStart ?? 0;
    const textBeforeCursor = content.substring(0, cursorPosition);
    const textAfterCursor = content.substring(cursorPosition);
    
    const newContent = textBeforeCursor + pastedText + textAfterCursor;
    setContent(newContent);
    pushContent(newContent);
    broadcastContentUpdate(newContent);
    
    // Set cursor position after pasted text
    if (textareaRef.current) {
      const newPosition = cursorPosition + pastedText.length;
      textareaRef.current.setSelectionRange(newPosition, newPosition);
      updatePresence(newPosition, newPosition, newPosition);
    }
  };

  const handleSelectionChange = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    updatePresence(target.selectionStart, target.selectionStart, target.selectionEnd);
  };

  return (
    <div className="relative w-full">
      <TextareaAutosize
        ref={textareaRef}
        value={content}
        onChange={(e) => {
          const newContent = e.target.value;
          setContent(newContent);
          pushContent(newContent);
        }}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        placeholder={user ? "Start typing or paste your content here..." : "Please login to start adding content..."}
        className="w-full p-3 md:p-6 text-base md:text-lg bg-white/50 backdrop-blur-sm border-2 border-primary/10 rounded-xl shadow-xl focus:outline-none focus:border-primary/30 transition-all duration-300 min-h-[150px] md:min-h-[300px] resize-none leading-relaxed"
        autoFocus
        disabled={!user}
      />
    </div>
  );
}
