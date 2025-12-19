-- Create memorial profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  birth_date DATE,
  death_date DATE,
  biography TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  qr_code_url TEXT,
  slug TEXT UNIQUE,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create photos table for gallery
CREATE TABLE public.photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create timeline events table
CREATE TABLE public.timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  event_date DATE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;

-- Public read access for published profiles
CREATE POLICY "Anyone can view published profiles"
ON public.profiles FOR SELECT
USING (is_published = true);

CREATE POLICY "Anyone can view photos of published profiles"
ON public.photos FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = photos.profile_id 
  AND profiles.is_published = true
));

CREATE POLICY "Anyone can view timeline of published profiles"
ON public.timeline_events FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = timeline_events.profile_id 
  AND profiles.is_published = true
));

-- Admin full access (no auth required for now - public admin)
CREATE POLICY "Full access for all profiles"
ON public.profiles FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Full access for all photos"
ON public.photos FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Full access for all timeline events"
ON public.timeline_events FOR ALL
USING (true)
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_photos_profile_id ON public.photos(profile_id);
CREATE INDEX idx_timeline_events_profile_id ON public.timeline_events(profile_id);
CREATE INDEX idx_profiles_slug ON public.profiles(slug);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.photos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.timeline_events;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();