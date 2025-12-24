import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSlideshow } from "@/hooks/useSlideshow";
import { useImagePreloader } from "@/hooks/useImagePreloader";
import { SlideshowContainer } from "@/components/slideshow/SlideshowContainer";
import { SlideshowControls } from "@/components/slideshow/SlideshowControls";
import { SlideshowProgress } from "@/components/slideshow/SlideshowProgress";
import { SlideshowBackground } from "@/components/slideshow/SlideshowBackground";
import "@/styles/slideshow-animations.css";

const SlideshowPage = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showControls, setShowControls] = useState(false);

  const {
    currentIndex,
    isPaused,
    progress,
    isTransitioning,
    animationPhase,
    profiles,
    currentProfile,
    nextProfile,
    playlist,
    isLoading,
    nextSlide,
    prevSlide,
    togglePause,
  } = useSlideshow();

  // Preload next profile image
  useImagePreloader(nextProfile?.avatarUrl);

  // Clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const exitSlideshow = () => navigate("/");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-foreground flex items-center justify-center">
        <div className="text-center text-card">
          <Loader2 className="w-12 h-12 animate-spin text-amber-400 mx-auto mb-4" />
          <p className="text-lg text-slate-400">
            {playlist ? `Đang tải playlist "${playlist.name}"...` : "Đang tải danh sách..."}
          </p>
        </div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="min-h-screen bg-foreground flex items-center justify-center">
        <div className="text-center text-card">
          <p className="text-xl mb-4 text-amber-400">
            {playlist ? `Playlist "${playlist.name}" không có hồ sơ nào` : "Không có hồ sơ nào được xuất bản"}
          </p>
          <p className="text-slate-400 mb-6">
            {playlist ? "Vui lòng cập nhật playlist với các hồ sơ đã xuất bản." : "Vui lòng xuất bản ít nhất một hồ sơ trước khi trình chiếu."}
          </p>
          <Button onClick={exitSlideshow}>Quay lại</Button>
        </div>
      </div>
    );
  }

  if (!currentProfile) {
    return null;
  }

  return (
    <div
      className="min-h-screen bg-foreground flex items-center justify-center overflow-hidden relative"
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <SlideshowBackground currentIndex={currentIndex} />
      
      <SlideshowContainer
        profile={currentProfile}
        animationPhase={animationPhase}
        currentTime={currentTime}
        playlist={playlist}
      />

      <SlideshowProgress progress={progress} />

      <SlideshowControls
        showControls={showControls}
        isPaused={isPaused}
        isTransitioning={isTransitioning}
        currentIndex={currentIndex}
        totalProfiles={profiles.length}
        onPrevSlide={prevSlide}
        onNextSlide={nextSlide}
        onTogglePause={togglePause}
        onExit={exitSlideshow}
      />
    </div>
  );
};

export default SlideshowPage;