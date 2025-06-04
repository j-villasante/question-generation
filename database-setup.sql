-- Database setup for Deep Kafka Question Generation App
-- Run these SQL commands in your Supabase SQL editor

-- Create test_names table
CREATE TABLE IF NOT EXISTS test_names (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create question_subjects table
CREATE TABLE IF NOT EXISTS question_subjects (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table with updated structure
CREATE TABLE IF NOT EXISTS questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Changed to JSONB to store {type: "text"|"image", value: string}
  answer TEXT NOT NULL,
  image TEXT NOT NULL,
  solution_image TEXT,
  test_name_id UUID NOT NULL REFERENCES test_names(id), -- Foreign key reference
  question_subject_id TEXT NOT NULL REFERENCES question_subjects(id), -- Foreign key reference
  question_difficulty TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample test names
INSERT INTO test_names (name, date) VALUES
  ('Midterm Exam', '2022-05-01'),
  ('Final Exam', '2022-05-01'),
  ('Quiz 1', '2022-05-01'),
  ('Quiz 2', '2022-05-01'),
  ('Quiz 3', '2022-05-01'),
  ('Practice Test', '2022-05-01'),
  ('Homework Assignment', '2022-05-01'),
  ('Lab Exam', '2022-05-01'),
  ('Pop Quiz', '2022-05-01'),
  ('Unit Test', '2022-05-01');

-- Insert sample question subjects
INSERT INTO question_subjects (id, label) VALUES
  ('mathematics', 'Mathematics'),
  ('physics', 'Physics'),
  ('chemistry', 'Chemistry'),
  ('biology', 'Biology'),
  ('computer-science', 'Computer Science'),
  ('engineering', 'Engineering'),
  ('statistics', 'Statistics'),
  ('calculus', 'Calculus'),
  ('algebra', 'Algebra'),
  ('geometry', 'Geometry'),
  ('trigonometry', 'Trigonometry'),
  ('linear-algebra', 'Linear Algebra'),
  ('discrete-math', 'Discrete Mathematics'),
  ('data-structures', 'Data Structures'),
  ('algorithms', 'Algorithms'),
  ('programming', 'Programming'),
  ('database-systems', 'Database Systems'),
  ('software-engineering', 'Software Engineering'),
  ('machine-learning', 'Machine Learning'),
  ('artificial-intelligence', 'Artificial Intelligence')
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE test_names ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Create policies to allow read access to all users
CREATE POLICY "Allow read access to test_names" ON test_names
  FOR SELECT USING (true);

CREATE POLICY "Allow read access to question_subjects" ON question_subjects
  FOR SELECT USING (true);

-- Create policies for questions table
CREATE POLICY "Allow read access to questions" ON questions
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert questions" ON questions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update their questions" ON questions
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete their questions" ON questions
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_test_name_id ON questions(test_name_id);
CREATE INDEX IF NOT EXISTS idx_questions_subject_id ON questions(question_subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(question_difficulty);

-- Optional: Create policies for authenticated users to insert/update dropdown options
-- Uncomment these if you want to allow users to add new options
/*
CREATE POLICY "Allow authenticated users to insert test_names" ON test_names
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update test_names" ON test_names
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert question_subjects" ON question_subjects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update question_subjects" ON question_subjects
  FOR UPDATE USING (auth.role() = 'authenticated');
*/

-- STORAGE SETUP:
-- Create a storage bucket for images (run this in Supabase Dashboard > Storage)
-- 1. Go to Storage in your Supabase dashboard
-- 2. Create a new bucket named 'images'
-- 3. Set it to public if you want direct access to images
-- 4. Or use the following SQL to create the bucket:

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('general', 'general', true);

-- Create storage policies for the images bucket
CREATE POLICY "Allow public read access on general" ON storage.objects
  FOR SELECT USING (bucket_id = 'general');

CREATE POLICY "Allow authenticated users to upload general" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'general');

CREATE POLICY "Allow authenticated users to update their general" ON storage.objects
  FOR UPDATE USING (bucket_id = 'general' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete their general" ON storage.objects
  FOR DELETE USING (bucket_id = 'general' AND auth.role() = 'authenticated');

-- IMPORTANT NOTES:
-- 1. The 'options' field is now JSONB and should store: {"type": "text"|"image", "value": "option text"}
-- 2. test_name_id and question_subject_id are foreign keys to their respective tables
-- 3. The 'image' field now stores the full Supabase Storage URL
-- 4. Make sure to create the 'images' storage bucket before running the application
-- 5. Images are uploaded to Supabase Storage before saving the question
