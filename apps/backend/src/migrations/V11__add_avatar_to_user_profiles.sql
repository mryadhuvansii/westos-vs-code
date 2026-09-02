-- V11__add_avatar_to_user_profiles.sql
-- Add avatar column to user_profiles table

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS avatar VARCHAR(500);

