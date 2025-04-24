"use client";

import TextareaAutosize from "react-textarea-autosize";
import type { User } from "@supabase/supabase-js";

interface MainEditorProps {
  content: string;
  setContent: (content: string) => void;
  pushContent: (content: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  user: User | null;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
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
  contentId,
}: MainEditorProps) {
  const { updatePresence, broadcastContentUpdate } = useCollaboration(
    contentId ?? "",
    user,
  );

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();

    const pastedText = e.clipboardData.getData("text");
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
        placeholder={
          user
            ? "Start typing or paste your content here..."
            : "Please login to start adding content..."
        }
        className="border-primary/10 focus:border-primary/30 min-h-[150px] w-full resize-none rounded-xl border-2 bg-white/50 p-3 text-base leading-relaxed shadow-xl backdrop-blur-sm transition-all duration-300 focus:outline-none md:min-h-[300px] md:p-6 md:text-lg"
        autoFocus
        disabled={!user}
      />
    </div>
  );
}
