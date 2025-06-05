import { createClient } from '@supabase/supabase-js';
import type { SavedQuestion } from '../types';

// Replace these with your actual Supabase URL and anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database operations
export const saveQuestion = async (question: SavedQuestion) => {
  // Transform the question data to match the database structure
  const questionData = {
    question: question.question,
    options: question.options, // Should be {type: "text"|"image", value: string}
    image: question.image,
    solution_image: question.solutionImage,
    test_name_id: question.testNameId,
    question_subject_id: question.questionSubjectId,
  };

  const { data, error } = await supabase
    .from('questions')
    .insert([questionData])
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getQuestions = async () => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// Fetch dropdown options from Supabase
export const getTestNames = async () => {
  const { data, error } = await supabase
    .from('test_names')
    .select('id, name, date')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

export const getQuestionSubjects = async () => {
  const { data, error } = await supabase
    .from('question_subjects')
    .select('id, label')
    .order('label', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

// Image upload functions
export const uploadImage = async (file: File, folder: string = 'question-images'): Promise<string> => {
  try {
    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Upload the file to Supabase Storage
    const { error } = await supabase.storage
      .from('general')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('general')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const deleteImage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract the file path from the URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const filePath = pathParts.slice(-2).join('/'); // Get folder/filename

    const { error } = await supabase.storage
      .from('images')
      .remove([filePath]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};
