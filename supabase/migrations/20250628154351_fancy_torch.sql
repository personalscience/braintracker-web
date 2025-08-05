/*
  # Create brain_tests table and profiles table

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, not null)
      - `full_name` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `brain_tests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `test_type` (text, check constraint for 'warmup' or 'test')
      - `reaction_times` (real array, not null)
      - `average_time` (real, not null)
      - `condition` (text, nullable)
      - `notes` (text, nullable)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create brain_tests table
CREATE TABLE IF NOT EXISTS brain_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_type text NOT NULL CHECK (test_type IN ('warmup', 'test')),
  reaction_times real[] NOT NULL,
  average_time real NOT NULL,
  condition text,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brain_tests ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Brain tests policies
CREATE POLICY "Users can read own brain tests"
  ON brain_tests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own brain tests"
  ON brain_tests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own brain tests"
  ON brain_tests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own brain tests"
  ON brain_tests
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_brain_tests_user_id ON brain_tests(user_id);
CREATE INDEX IF NOT EXISTS idx_brain_tests_created_at ON brain_tests(created_at);
CREATE INDEX IF NOT EXISTS idx_brain_tests_test_type ON brain_tests(test_type);