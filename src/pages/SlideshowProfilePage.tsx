import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Play, Pause, ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAllProfilesIncludingCelebrities } from "@/hooks/useProfiles";
import "../styles/slideshow.css";

const SlideshowProfilePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [loadedFrames, setLoadedFrames] = useState<Set<number>>(new Set());
  const [scale, setScale] = useState(1);

  const intervalTime = parseInt(searchParams.get("time") || "30") * 1000;
  const selectedProfileIds = searchParams.get("profiles")?.split(",").filter(Boolean) || [];

  const { data: allProfiles, isLoading: isLoadingProfiles } = useAllProfilesIncludingCelebrities();

  // Filter to only published profiles, and optionally filter by selected IDs
  const profiles = (allProfiles || [])
    .filter(p => p.is_published)
    .filter(p => selectedProfileIds.length === 0 || selectedProfileIds.includes(p.id))
    .map(p => ({
      id: p.slug || p.id,
      name: p.name,
    }));

  // Calculate scale to fit 1080x1920 content into current viewport
  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const targetWidth = 1080;
      const targetHeight = 1920;

      const scaleX = windowWidth / targetWidth;
      const scaleY = windowHeight / targetHeight;

      // Use the smaller scale to fit entirely within screen
      const newScale = Math.min(scaleX, scaleY);
      setScale(newScale);
    };

    handleResize(); // Initial calc
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.title = "Trình Chiếu - Sổ Tang Điện Tử";
    document.body.classList.add('slideshow-mode');

    return () => {
      document.body.classList.remove('slideshow-mode');
    };
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

  // Handle touch/click interactions for controls visibility
  const toggleControls = () => setShowControls(prev => !prev);



  // Calculate scale to fit 1080x1920 content into current viewport

  return (
    <div
      className="slideshow-container bg-black"
      onClick={toggleControls} // Click anywhere to toggle controls
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

      {/* Slideshow Frame - 1080x1920 Portrait */}
      <div
        className="slideshow-frame"
        style={{ transform: `scale(${scale})` }}
      >
        {profiles.map((profile, index) => (
          <iframe
            key={profile.id}
            src={`/profile/${profile.id}?slideshow=1`}
            className={`
              transition-opacity duration-1000 ease-in-out
              ${index === currentIndex ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
            `}
            onLoad={() => handleFrameLoad(index)}
            title={profile.name}
            // Add style to prevent iframe from capturing clicks so parent onClick works
            style={{ pointerEvents: 'none' }}
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
          fixed top-6 left-6 bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm z-[1001]
          border border-white/10 font-medium
          transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <span>{currentIndex + 1}</span> <span className="text-white/50">/</span> <span>{profiles.length}</span>
      </div>

      {/* Controls Overlay - Responsive & Touch Friendly */}
      <div
        className={`
          fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-[1001]
          p-2 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl
          transition-all duration-300 
          ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}
        `}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking controls
      >
        <button
          onClick={prevSlide}
          className="p-3 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-colors active:scale-95 touch-manipulation"
          title="Trước"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          onClick={togglePause}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold transition-colors active:scale-95 touch-manipulation"
        >
          {isPaused ? <Play className="h-5 w-5 fill-current" /> : <Pause className="h-5 w-5 fill-current" />}
          <span className="hidden sm:inline">{isPaused ? "Tiếp tục" : "Tạm dừng"}</span>
        </button>

        <button
          onClick={exitSlideshow}
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-white/90 hover:text-red-400 hover:bg-red-500/10 transition-colors active:scale-95 touch-manipulation"
          title="Thoát"
        >
          <X className="h-5 w-5" />
          <span className="hidden sm:inline">Thoát</span>
        </button>

        <div className="w-px h-8 bg-white/10 mx-1 hidden sm:block"></div>

        <button
          onClick={nextSlide}
          className="p-3 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-colors active:scale-95 touch-manipulation"
          title="Sau"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default SlideshowProfilePage;
