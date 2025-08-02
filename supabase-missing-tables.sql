-- Missing Supabase Tables for Next.js Volleyball Quiz App
-- Run this in your Supabase SQL Editor AFTER the main schema

-- Quiz Results Table (for storing completed quiz sessions)
CREATE TABLE quiz_results (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  situation_id INTEGER REFERENCES situations(id) ON DELETE CASCADE,
  selected_answer INTEGER NOT NULL CHECK (selected_answer >= 0 AND selected_answer <= 3),
  is_correct BOOLEAN NOT NULL,
  time_taken INTEGER, -- Time in seconds
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX idx_quiz_results_situation_id ON quiz_results(situation_id);
CREATE INDEX idx_quiz_results_created_at ON quiz_results(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quiz_results table
CREATE POLICY "Users can view their own quiz results" ON quiz_results
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own quiz results" ON quiz_results
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Trainers can view all quiz results in their team" ON quiz_results
    FOR SELECT USING (
        user_id IN (
            SELECT up.id 
            FROM user_profiles up 
            WHERE up.team_id IN (
                SELECT team_id 
                FROM user_profiles 
                WHERE id = auth.uid() AND role = 'trainer'
            )
        )
    );

-- Create Storage Bucket for Media Files
-- Note: This needs to be run in Supabase Dashboard -> Storage, not SQL Editor
-- INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

-- Storage Policies (run these in SQL Editor after creating bucket)
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'media');
-- CREATE POLICY "Authenticated users can upload media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');
-- CREATE POLICY "Users can update their own media" ON storage.objects FOR UPDATE USING (bucket_id = 'media' AND auth.uid()::text = owner);
-- CREATE POLICY "Users can delete their own media" ON storage.objects FOR DELETE USING (bucket_id = 'media' AND auth.uid()::text = owner);
