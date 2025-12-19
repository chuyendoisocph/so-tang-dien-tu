import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Play, Pause, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock data - replace with real API data
const mockProfiles = [
  {
    id: "HNT2025",
    name: "Hoàng Nam Tiến",
    dateRange: "1969 - 2025",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=820&fit=crop&crop=face"
  },
  {
    id: "NVA2025",
    name: "Nguyễn Văn An",
    dateRange: "1955 - 2025",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=820&fit=crop&crop=face"
  },
  {
    id: "TTB2025",
    name: "Trần Thị Bình",
    dateRange: "1948 - 2025",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=820&fit=crop&crop=face"
  },
];

const SlideshowPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isVisible, setIsVisible] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const intervalTime = parseInt(searchParams.get("time") || "15") * 1000;
  const profiles = mockProfiles;

  useEffect(() => {
    document.title = "Trình Chiếu Tưởng Niệm";
    setIsVisible(true);
  }, []);

  // Clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Progress and auto-advance
  useEffect(() => {
    if (isPaused || profiles.length === 0) return;

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0;
        }
        return prev + (100 / (intervalTime / 100));
      });
    }, 100);

    return () => clearInterval(progressTimer);
  }, [isPaused, intervalTime, profiles.length]);

  // Handle slide change when progress reaches 100
  useEffect(() => {
    if (progress >= 100) {
      nextSlide();
    }
  }, [progress]);

  const nextSlide = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % profiles.length);
      setProgress(0);
      setIsVisible(true);
    }, 400);
  }, [profiles.length]);

  const prevSlide = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + profiles.length) % profiles.length);
      setProgress(0);
      setIsVisible(true);
    }, 400);
  }, [profiles.length]);

  const togglePause = () => setIsPaused(!isPaused);
  const exitSlideshow = () => navigate("/");

  const currentProfile = profiles[currentIndex];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  if (profiles.length === 0) {
    return (
      <div className="min-h-screen bg-foreground flex items-center justify-center">
        <div className="text-center text-card">
          <p className="text-xl mb-4">Không có hồ sơ nào được chọn</p>
          <Button onClick={exitSlideshow}>Quay lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-foreground flex items-center justify-center overflow-hidden"
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Standee Container */}
      <div
        className={`
          w-[1080px] h-[1920px]
          bg-gradient-to-b from-slate-800 to-slate-950
          flex flex-col items-center
          p-24 text-card
          origin-center
          shadow-2xl
          transition-all duration-700 ease-in-out
          scale-[0.5] lg:scale-[0.45] xl:scale-[0.5]
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
      >
        {/* Clock Widget */}
        <div className="absolute top-8 right-10 flex items-center gap-5 text-card/90">
          <span className="text-2xl font-medium">{formatDate(currentTime)}</span>
          <span className="text-2xl font-medium">{formatTime(currentTime)}</span>
        </div>

        {/* Top Text */}
        <h2 className="font-serif text-5xl font-semibold uppercase tracking-widest text-gold mb-3">
          Hoa Viên Bình Dương
        </h2>

        {/* Ornament */}
        <div className="flex items-center gap-5 mb-6 opacity-90">
          <div className="w-44 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-gold" />
            <div className="w-3 h-3 bg-gold rotate-45" />
            <div className="w-1.5 h-1.5 rounded-full bg-gold" />
          </div>
          <div className="w-44 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />
        </div>

        {/* Main Title */}
        <h1 className="font-serif text-7xl font-bold uppercase tracking-[0.2em] text-card mb-8">
          Vĩnh Biệt
        </h1>

        {/* Portrait Frame */}
        <div className="p-3 bg-card/10 border border-card/20 shadow-2xl mb-12">
          <img
            src={currentProfile.avatarUrl}
            alt={currentProfile.name}
            className="w-[500px] h-[680px] object-cover grayscale"
          />
        </div>

        {/* Info Section */}
        <div className="text-center mb-auto">
          <h2 className="text-6xl font-bold uppercase text-card mb-4 tracking-wide">
            {currentProfile.name}
          </h2>
          <p className="text-4xl text-slate-400 font-light">
            {currentProfile.dateRange}
          </p>
        </div>

        {/* Divider */}
        <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent my-8" />

        {/* QR Section */}
        <div className="flex flex-col items-center gap-5 pb-10">
          <h3 className="text-3xl font-bold uppercase text-gold">
            Sổ Tang Điện Tử
          </h3>
          <div className="bg-card p-4 rounded-xl shadow-lg">
            <div className="w-36 h-36 bg-slate-200 flex items-center justify-center text-slate-500 text-sm">
              QR Code
            </div>
          </div>
          <p className="text-xl text-slate-300 text-center leading-relaxed">
            Quét mã để gửi lời chia buồn<br />
            Scan to visit memorial page
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-1.5 bg-foreground/30 z-50">
        <div
          className="h-full bg-gradient-to-r from-gold to-amber-500 shadow-[0_-2px_10px_rgba(251,191,36,0.5)] transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Slide Counter */}
      <div className={`fixed top-5 left-5 bg-foreground/70 text-card px-5 py-2.5 rounded-lg z-50 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {currentIndex + 1} / {profiles.length}
      </div>

      {/* Controls */}
      <div className={`fixed top-5 right-5 flex gap-3 z-50 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <Button variant="secondary" onClick={prevSlide} className="bg-foreground/70 hover:bg-foreground/90 text-card border-0">
          <ChevronLeft className="h-4 w-4 mr-1" /> Trước
        </Button>
        <Button variant="secondary" onClick={togglePause} className="bg-foreground/70 hover:bg-foreground/90 text-card border-0">
          {isPaused ? <Play className="h-4 w-4 mr-1" /> : <Pause className="h-4 w-4 mr-1" />}
          {isPaused ? "Tiếp tục" : "Tạm dừng"}
        </Button>
        <Button variant="secondary" onClick={nextSlide} className="bg-foreground/70 hover:bg-foreground/90 text-card border-0">
          Sau <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
        <Button variant="secondary" onClick={exitSlideshow} className="bg-foreground/70 hover:bg-foreground/90 text-card border-0">
          <X className="h-4 w-4 mr-1" /> Thoát
        </Button>
      </div>
    </div>
  );
};

export default SlideshowPage;
