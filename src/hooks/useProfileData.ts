import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ProfileData = {
  id: string;
  name: string;
  birth_date: string | null;
  death_date: string | null;
  biography: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  maps_url: string | null;
  is_buried: boolean | null;
  slug: string | null;
  is_published: boolean | null;
};

export type PhotoData = {
  id: string;
  url: string;
  caption: string | null;
  display_order: number | null;
};

export type TimelineEventData = {
  id: string;
  event_date: string | null;
  title: string;
  description: string | null;
  image_url: string | null;
  display_order: number | null;
};

function formatDateRange(birthDate: string | null, deathDate: string | null): string {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "?";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };
  return `${formatDate(birthDate)} - ${formatDate(deathDate)}`;
}

export function useProfileData(profileIdOrSlug: string | undefined) {
  const profileQuery = useQuery({
    queryKey: ["profile", profileIdOrSlug],
    queryFn: async () => {
      if (!profileIdOrSlug) throw new Error("No profile ID provided");

      // Try to find by slug first, then by id
      let query = supabase
        .from("profiles")
        .select("*")
        .eq("slug", profileIdOrSlug)
        .maybeSingle();

      let { data, error } = await query;

      // If not found by slug, try by id
      if (!data && !error) {
        const idQuery = supabase
          .from("profiles")
          .select("*")
          .eq("id", profileIdOrSlug)
          .maybeSingle();

        const result = await idQuery;
        data = result.data;
        error = result.error;
      }

      if (error) throw error;
      if (!data) throw new Error("Profile not found");

      return data as ProfileData;
    },
    enabled: !!profileIdOrSlug,
  });

  const photosQuery = useQuery({
    queryKey: ["profile-photos", profileQuery.data?.id],
    queryFn: async () => {
      if (!profileQuery.data?.id) return [];

      const { data, error } = await supabase
        .from("photos")
        .select("*")
        .eq("profile_id", profileQuery.data.id)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return (data || []) as PhotoData[];
    },
    enabled: !!profileQuery.data?.id,
  });

  const timelineQuery = useQuery({
    queryKey: ["profile-timeline", profileQuery.data?.id],
    queryFn: async () => {
      if (!profileQuery.data?.id) return [];

      const { data, error } = await supabase
        .from("timeline_events")
        .select("*")
        .eq("profile_id", profileQuery.data.id)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return (data || []) as TimelineEventData[];
    },
    enabled: !!profileQuery.data?.id,
  });

  // Transform profile data to the format expected by MemorialProfileWeb
  const transformedProfile = profileQuery.data
    ? {
        id: profileQuery.data.slug || profileQuery.data.id,
        name: profileQuery.data.name,
        dateRange: formatDateRange(
          profileQuery.data.birth_date,
          profileQuery.data.death_date
        ),
        avatarUrl:
          profileQuery.data.avatar_url ||
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=800&fit=crop&crop=face",
        coverUrl: profileQuery.data.cover_url,
        biography: profileQuery.data.biography || "",
        roles: timelineQuery.data?.map((event) => event.title) || [],
        mapsUrl: profileQuery.data.maps_url,
        isBuried: profileQuery.data.is_buried,
      }
    : null;

  return {
    profile: transformedProfile,
    photos: photosQuery.data || [],
    timeline: timelineQuery.data || [],
    actualProfileId: profileQuery.data?.id, // Return the actual UUID
    isLoading:
      profileQuery.isLoading ||
      photosQuery.isLoading ||
      timelineQuery.isLoading,
    error: profileQuery.error || photosQuery.error || timelineQuery.error,
  };
}
