import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAllProfiles } from '@/hooks/useProfiles';
import { usePlaylist } from '@/hooks/usePlaylists';

export interface SlideshowProfile {
  id: string;
  name: string;
  dateRange: string;
  avatarUrl: string;
}

export const useSlideshow = () => {
  const [searchParams] = useSearchParams();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'stay' | 'exit'>('stay');

  // Parse URL parameters
  const intervalTime = parseInt(searchParams.get("time") || "15") * 1000;
  const selectedProfileIds = useMemo(() => 
    searchParams.get("profiles")?.split(",").filter(Boolean) || [], 
    [searchParams]
  );
  const playlistId = searchParams.get("playlist");

  const { data: allProfiles, isLoading: isLoadingProfiles } = useAllProfiles();
  const { data: playlist, isLoading: isLoadingPlaylist } = usePlaylist(playlistId);

  // Memoize playlist settings
  const playlistSettings = useMemo(() => {
    if (playlist) {
      return {
        profileIds: playlist.profile_ids,
        slideTime: playlist.slide_duration * 1000,
        autoPlay: playlist.auto_play,
        loop: playlist.loop
      };
    }
    return {
      profileIds: selectedProfileIds,
      slideTime: intervalTime,
      autoPlay: true,
      loop: true
    };
  }, [playlist, selectedProfileIds, intervalTime]);

  // Memoize processed profiles
  const profiles = useMemo<SlideshowProfile[]>(() => {
    if (!allProfiles) return [];
    
    return allProfiles
      .filter(p => p.is_published)
      .filter(p => playlistSettings.profileIds.length === 0 || playlistSettings.profileIds.includes(p.id))
      .map(p => ({
        id: p.slug || p.id,
        name: p.name,
        dateRange: `${p.birth_date ? new Date(p.birth_date).getFullYear() : '?'} - ${p.death_date ? new Date(p.death_date).getFullYear() : '?'}`,
        avatarUrl: p.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=820&fit=crop&crop=face",
      }));
  }, [allProfiles, playlistSettings.profileIds]);

  // Initialize next index when profiles change
  useEffect(() => {
    if (profiles.length > 0) {
      setNextIndex(1 % profiles.length);
      setAnimationPhase('stay');
    }
  }, [profiles.length]);

  // Progress timer
  useEffect(() => {
    if (isPaused || profiles.length === 0 || isTransitioning) return;

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0;
        }
        return prev + (100 / (playlistSettings.slideTime / 100));
      });
    }, 100);

    return () => clearInterval(progressTimer);
  }, [isPaused, playlistSettings.slideTime, profiles.length, isTransitioning]);

  // Auto advance
  useEffect(() => {
    if (progress >= 100 && !isTransitioning) {
      nextSlide();
    }
  }, [progress, isTransitioning]);

  const nextSlide = useCallback(() => {
    if (isTransitioning || profiles.length === 0) return;
    
    setIsTransitioning(true);
    setAnimationPhase('exit');
    
    setTimeout(() => {
      const newIndex = (currentIndex + 1) % profiles.length;
      setCurrentIndex(newIndex);
      setNextIndex((newIndex + 1) % profiles.length);
      setProgress(0);
      setAnimationPhase('enter');
      
      setTimeout(() => {
        setAnimationPhase('stay');
        setIsTransitioning(false);
      }, 300);
    }, 300);
  }, [profiles.length, isTransitioning, currentIndex]);

  const prevSlide = useCallback(() => {
    if (isTransitioning || profiles.length === 0) return;
    
    setIsTransitioning(true);
    setAnimationPhase('exit');
    
    setTimeout(() => {
      const newIndex = (currentIndex - 1 + profiles.length) % profiles.length;
      setCurrentIndex(newIndex);
      setNextIndex((newIndex + 1) % profiles.length);
      setProgress(0);
      setAnimationPhase('enter');
      
      setTimeout(() => {
        setAnimationPhase('stay');
        setIsTransitioning(false);
      }, 300);
    }, 300);
  }, [profiles.length, isTransitioning, currentIndex]);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  // Current and next profiles
  const currentProfile = profiles[currentIndex];
  const nextProfile = profiles[nextIndex];

  return {
    // State
    currentIndex,
    nextIndex,
    isPaused,
    progress,
    isTransitioning,
    animationPhase,
    
    // Data
    profiles,
    currentProfile,
    nextProfile,
    playlist,
    
    // Loading states
    isLoading: isLoadingProfiles || isLoadingPlaylist,
    
    // Actions
    nextSlide,
    prevSlide,
    togglePause,
  };
};