"use client";

import { useState, useCallback, useRef } from "react";
import { useAISuggestions, type AISuggestion } from "@/hooks/useAISuggestions";
import TextareaAutosize from "react-textarea-autosize";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Upload, FileText } from "lucide-react";
import { toast } from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

export default function ContentEditor() {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const { suggestions, loading: suggestionsLoading } = useAISuggestions(content ?? "");
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [showApplyBar, setShowApplyBar] = useState(false);

  const handleSave = useCallback(async () => {
    if (!user) {
      toast.error("Please login to save content");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("content")
        .insert([{ user_id: user.id, content, attachments, tags }]);
      
      if (error) throw error;
      toast.success("Content saved successfully!");
    } catch (error) {
      toast.error("Failed to save content");
    } finally {
      setIsSaving(false);
    }
  }, [content, attachments, user]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("attachments")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("attachments")
        .getPublicUrl(filePath);

      setAttachments(prev => [...prev, publicUrl]);
      toast.success("File uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  }, [user]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    },
    [handleSave]
  );

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="space-y-4 relative">
        {/* AI Suggestions Panel */}
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute -right-96 top-0 w-80 bg-white/80 backdrop-blur-sm 
                rounded-xl shadow-xl p-4 border border-primary/10"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-primary">AI Suggestions</h3>
                {suggestionsLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 
                    border-primary"></div>
                )}
              </div>
              <div className="space-y-3">
                {suggestions.map((suggestion: AISuggestion) => (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md 
                      transition-all cursor-pointer"
                    onClick={() => {
                      setSelectedSuggestion(suggestion.suggestion);
                      setShowApplyBar(true);
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        suggestion.type === 'structure' ? 'bg-blue-100 text-blue-700' :
                        suggestion.type === 'enhancement' ? 'bg-green-100 text-green-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {suggestion.type}
                      </span>
                    </div>
                    <p className="text-sm text-primary/80 mt-2">
                      {suggestion.suggestion}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex flex-wrap gap-2 min-h-[32px]">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2"
            >
              {tag}
              <button
                onClick={() => setTags(tags.filter((_, i) => i !== index))}
                className="hover:text-primary/70"
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && tagInput.trim()) {
                e.preventDefault();
                if (!tags.includes(tagInput.trim())) {
                  setTags([...tags, tagInput.trim()]);
                }
                setTagInput("");
              }
            }}
            placeholder="Add tags..."
            className="px-2 py-1 bg-transparent border-none outline-none text-sm flex-grow"
          />
        </div>
        {showApplyBar && selectedSuggestion && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg mb-4"
          >
            <p className="text-sm text-primary/80 flex-grow">
              {selectedSuggestion}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setContent(selectedSuggestion);
                  setSelectedSuggestion(null);
                  setShowApplyBar(false);
                  toast.success("Suggestion applied!");
                }}
                className="px-3 py-1 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors"
              >
                Apply
              </button>
              <button
                onClick={() => {
                  setSelectedSuggestion(null);
                  setShowApplyBar(false);
                }}
                className="px-3 py-1 bg-white text-primary rounded-lg text-sm hover:bg-primary/5 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
        <TextareaAutosize
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={user ? "Start typing or paste your content here..." : "Please login to start adding content..."}
        className="w-full p-6 text-lg bg-white/50 backdrop-blur-sm border-2 border-primary/10 rounded-xl shadow-xl focus:outline-none focus:border-primary/30 transition-all duration-300 min-h-[300px] resize-none"
        autoFocus
        disabled={!user}
      />
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx"
      />

      <div className="absolute bottom-6 right-6 flex items-center gap-3">
        {user ? (
          <a
            href="/profile"
            className="px-4 py-2 text-primary hover:bg-white/90 transition-colors rounded-lg"
          >
            View Profile
          </a>
        ) : (
          <a
            href="/login"
            className="px-4 py-2 bg-primary text-white rounded-lg shadow-lg hover:bg-primary/90 transition-colors"
          >
            Login
          </a>
        )}
        {attachments.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-white/80 rounded-lg">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary">{attachments.length} files</span>
          </div>
        )}
        
        {user && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-4 py-2 bg-white text-primary rounded-lg shadow-lg hover:bg-white/90 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {isUploading ? "Uploading..." : "Upload"}
          </motion.button>
        )}

        {content && user && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 bg-primary text-white rounded-lg shadow-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save"}
          </motion.button>
        )}
        </div>
      </div>
    </div>
  );
}
