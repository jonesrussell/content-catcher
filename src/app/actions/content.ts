'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import type { Content } from '@/types/content';
import type { Database } from '@/lib/supabase.types';

export async function saveContent(content: string, title: string, tags: string[]) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('Not authenticated');

  // Get the most recent content entry for this user
  const { data: existingContent } = await supabase
    .from("content")
    .select("id, content, tags")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  const contentData = {
    user_id: session.user.id,
    content,
    title,
    tags: tags ?? [],
    ...(existingContent?.[0]?.id ? { id: existingContent[0].id } : {}),
    ...(existingContent?.[0]?.id ? {} : { 
      created_at: new Date().toISOString(),
      version_number: 1 
    })
  };

  const { data, error } = await supabase
    .from("content")
    .upsert(contentData, {
      onConflict: 'id',
      ignoreDuplicates: false
    })
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath('/dashboard');
  return data;
}

export async function fetchUserContent() {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from("content")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data.map((item: Database['public']['Tables']['content']['Row']) => ({
    id: item.id,
    user_id: item.user_id,
    content: item.content,
    tags: item.tags || [],
    created_at: item.created_at,
    updated_at: item.created_at,
    version_number: item.version_number || 1,
    archived: false,
    attachments: item.attachments || [],
    parent_version_id: item.parent_version_id || null,
    fts: item.fts || null
  })) as Content[];
}

export async function updateContent(id: string, updates: Partial<Content>) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('Not authenticated');

  // Filter out fields that don't exist in the database schema
  const dbUpdates = Object.fromEntries(
    Object.entries(updates).filter(([key]) => 
      key !== 'updated_at' && key !== 'archived'
    )
  );

  const { data, error } = await supabase
    .from("content")
    .update({
      ...dbUpdates,
      created_at: new Date().toISOString()
    })
    .eq("id", id)
    .eq("user_id", session.user.id)
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath('/dashboard');
  return data;
}

export async function deleteContent(id: string) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from("content")
    .delete()
    .eq("id", id)
    .eq("user_id", session.user.id);

  if (error) throw error;
  
  revalidatePath('/dashboard');
  return true;
} 