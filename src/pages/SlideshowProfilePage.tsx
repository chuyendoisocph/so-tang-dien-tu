import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Play, Pause, ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAllProfiles } from "@/hooks/useProfiles";

const SlideshowProfilePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [loadedFrames, setLoadedFrames] = useState<Set<number>>(new Set());

  const intervalTime = parseInt(searchParams.get("time") || "30") * 1000;
  const useKioskMode = searchParams.get("kiosk") === "1";
  const selectedProfileIds = searchParams.get("profiles")?.split(",").filter(Boolean) || [];

  const { data: allProfiles, isLoading: isLoadingProfiles } = useAllProfiles();

  // Filter to only published profiles, and optionally filter by selected IDs
  const profiles = (allProfiles || [])
    .filter(p => p.is_published)
    .filter(p => selectedProfileIds.length === 0 || selectedProfileIds.includes(p.id))
    .map(p => ({
      id: p.slug || p.id,
      name: p.name,
    }));

  useEffect(() => {
    document.title = "Trình Chiếu - Giao diện Profile";
  }, []);

  useEffect(() => {
    if (!isLoadingProfiles && profiles.length > 0) {
      const timeout = setTimeout(() => setIsLoading(false), 1500);
      return () => clearTimeout(timeout);
    }
  }, [isLoadingProfiles, profiles.length]);

  // Progress and auto-advance
  useEffect(() => {
    if (isPaused || profiles.length === 0 || isLoading) return;

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0;
        }
        return prev + (100 / (intervalTime / 100));
      });
    }, 100);

    return () => clearInterval(progressTimer);
  }, [isPaused, intervalTime, profiles.length, isLoading]);

  useEffect(() => {
    if (progress >= 100) {
      nextSlide();
    }
  }, [progress]);

  const handleFrameLoad = (index: number) => {
    setLoadedFrames(prev => new Set(prev).add(index));
    if (index === 0) {
      setIsLoading(false);
    }
  };

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % profiles.length);
    setProgress(0);
  }, [profiles.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + profiles.length) % profiles.length);
    setProgress(0);
  }, [profiles.length]);

  const togglePause = () => setIsPaused(!isPaused);
  const exitSlideshow = () => navigate("/");

  if (isLoadingProfiles) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#101828] to-[#05080F] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-amber-400 mb-4" />
        <p className="text-lg text-slate-400">Đang tải danh sách...</p>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#101828] to-[#05080F] flex flex-col items-center justify-center">
        <div className="text-center text-card">
          <p className="text-xl mb-4 text-amber-400">Không có hồ sơ nào được xuất bản</p>
          <p className="text-slate-400 mb-6">Vui lòng xuất bản ít nhất một hồ sơ trước khi trình chiếu.</p>
          <Button onClick={exitSlideshow} className="bg-card/10 hover:bg-card/20">
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-foreground overflow-hidden relative"
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Loading Screen */}
      {isLoading && (
        <div className="fixed inset-0 bg-gradient-to-b from-[#101828] to-[#05080F] flex flex-col items-center justify-center z-[3000]">
          <div
            className="w-[50px] h-[50px] border-4 border-card/20 border-t-amber-400 rounded-full animate-spin mb-5"
          />
          <p className="text-lg text-slate-400">Đang tải trình chiếu...</p>
        </div>
      )}

      {/* Slideshow Container */}
      <div className="w-screen h-screen relative">
        {profiles.map((profile, index) => (
          <iframe
            key={profile.id}
            src={`/profile/${profile.id}?${useKioskMode ? 'kiosk=1' : 'slideshow=1'}`}
            className={`
              w-full h-full border-none absolute top-0 left-0
              transition-opacity duration-1000 ease-in-out
              ${index === currentIndex ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
            `}
            onLoad={() => handleFrameLoad(index)}
            title={profile.name}
          />
        ))}
      </div>

      {/* Progress Bar - 6px height as per HTML spec */}
      <div className="fixed bottom-0 left-0 right-0 h-[6px] bg-foreground/30 z-[1000]">
        <div
          className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-[width] duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Slide Counter */}
      <div
        className={`
          fixed top-5 left-5 bg-foreground/70 text-card px-5 py-2.5 rounded-lg text-sm z-[1001]
          transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <span>{currentIndex + 1}</span> / <span>{profiles.length}</span>
      </div>

      {/* Controls Overlay */}
      <div
        className={`
          fixed top-5 right-5 flex gap-2.5 z-[1001]
          transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <button
          onClick={prevSlide}
          className="bg-foreground/70 hover:bg-foreground/90 text-card border-none px-3 py-1.5 rounded-md cursor-pointer text-xs flex items-center gap-1.5 transition-colors"
        >
          <ChevronLeft className="h-3 w-3" /> Trước
        </button>
        <button
          onClick={togglePause}
          className="bg-foreground/70 hover:bg-foreground/90 text-card border-none px-3 py-1.5 rounded-md cursor-pointer text-xs flex items-center gap-1.5 transition-colors"
        >
          {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          {isPaused ? "Tiếp tục" : "Tạm dừng"}
        </button>
        <button
          onClick={nextSlide}
          className="bg-foreground/70 hover:bg-foreground/90 text-card border-none px-3 py-1.5 rounded-md cursor-pointer text-xs flex items-center gap-1.5 transition-colors"
        >
          Sau <ChevronRight className="h-3 w-3" />
        </button>
        <button
          onClick={exitSlideshow}
          className="bg-foreground/70 hover:bg-foreground/90 text-card border-none px-3 py-1.5 rounded-md cursor-pointer text-xs flex items-center gap-1.5 transition-colors"
        >
          <X className="h-3 w-3" /> Thoát
        </button>
      </div>
    </div>
  );
};

export default SlideshowProfilePage;
