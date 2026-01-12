-- Create storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true);

-- Allow public access to view profile photos
CREATE POLICY "Profile photos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'profile-photos');

-- Allow users to upload their own profile photos (using associado_id or dependente_id as folder name)
CREATE POLICY "Anyone can upload profile photos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'profile-photos');

-- Allow users to update their own profile photos
CREATE POLICY "Anyone can update profile photos"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'profile-photos');

-- Allow users to delete their own profile photos
CREATE POLICY "Anyone can delete profile photos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'profile-photos');