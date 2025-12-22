import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Play, Pause, ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { useAllProfiles } from "@/hooks/useProfiles";
import { usePlaylist } from "@/hooks/usePlaylists";

const SlideshowPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isVisible, setIsVisible] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [animationPhase, setAnimationPhase] = useState('enter'); // 'enter', 'stay', 'exit'

  const intervalTime = parseInt(searchParams.get("time") || "15") * 1000;
  const selectedProfileIds = searchParams.get("profiles")?.split(",").filter(Boolean) || [];
  const playlistId = searchParams.get("playlist");

  const { data: allProfiles, isLoading: isLoadingProfiles } = useAllProfiles();
  const { data: playlist, isLoading: isLoadingPlaylist } = usePlaylist(playlistId);

  // Determine which profiles to show and settings to use
  const getPlaylistSettings = () => {
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
  };

  const playlistSettings = getPlaylistSettings();

  // Filter to only published profiles, and optionally filter by selected IDs or playlist
  const profiles = (allProfiles || [])
    .filter(p => p.is_published)
    .filter(p => playlistSettings.profileIds.length === 0 || playlistSettings.profileIds.includes(p.id))
    .map(p => ({
      id: p.slug || p.id,
      name: p.name,
      dateRange: `${p.birth_date ? new Date(p.birth_date).getFullYear() : '?'} - ${p.death_date ? new Date(p.death_date).getFullYear() : '?'}`,
      avatarUrl: p.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=820&fit=crop&crop=face",
    }));

  useEffect(() => {
    const title = playlist ? `Trình Chiếu - ${playlist.name}` : "Trình Chiếu Tưởng Niệm";
    document.title = title;
    if (!isLoadingProfiles && !isLoadingPlaylist) {
      // Smooth entrance animation
      setTimeout(() => {
        setIsVisible(true);
        setAnimationPhase('enter');
        setTimeout(() => setAnimationPhase('stay'), 800);
      }, 200);
    }
  }, [isLoadingProfiles, isLoadingPlaylist, playlist]);

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
        return prev + (100 / (playlistSettings.slideTime / 100));
      });
    }, 100);

    return () => clearInterval(progressTimer);
  }, [isPaused, playlistSettings.slideTime, profiles.length]);

  // Handle slide change when progress reaches 100
  useEffect(() => {
    if (progress >= 100) {
      nextSlide();
    }
  }, [progress]);

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setAnimationPhase('exit');
    
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % profiles.length);
      setProgress(0);
      setAnimationPhase('enter');
      
      setTimeout(() => {
        setAnimationPhase('stay');
        setIsTransitioning(false);
      }, 1000);
    }, 800);
  }, [profiles.length, isTransitioning]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setAnimationPhase('exit');
    
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + profiles.length) % profiles.length);
      setProgress(0);
      setAnimationPhase('enter');
      
      setTimeout(() => {
        setAnimationPhase('stay');
        setIsTransitioning(false);
      }, 1000);
    }, 800);
  }, [profiles.length, isTransitioning]);

  const togglePause = () => setIsPaused(!isPaused);
  const exitSlideshow = () => navigate("/");

  const currentProfile = profiles[currentIndex];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  const getProfileUrl = (profileId: string) => {
    return `${window.location.origin}/profile/${profileId}`;
  };

  if (isLoadingProfiles || isLoadingPlaylist) {
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

  return (
    <div
      className="min-h-screen bg-foreground flex items-center justify-center overflow-hidden relative"
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Advanced CSS Animations */}
      <style>{`
        @keyframes slideEnter {
          0% {
            opacity: 0;
            transform: translateY(80px) scale(0.9) rotateX(10deg);
            filter: blur(12px);
          }
          30% {
            opacity: 0.3;
            transform: translateY(40px) scale(0.95) rotateX(5deg);
            filter: blur(6px);
          }
          70% {
            opacity: 0.8;
            transform: translateY(10px) scale(0.99) rotateX(1deg);
            filter: blur(1px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1) rotateX(0deg);
            filter: blur(0);
          }
        }
        
        @keyframes slideExit {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1) rotateX(0deg);
            filter: blur(0);
          }
          30% {
            opacity: 0.8;
            transform: translateY(-10px) scale(1.01) rotateX(-1deg);
            filter: blur(1px);
          }
          70% {
            opacity: 0.3;
            transform: translateY(-40px) scale(1.05) rotateX(-5deg);
            filter: blur(6px);
          }
          100% {
            opacity: 0;
            transform: translateY(-80px) scale(1.1) rotateX(-10deg);
            filter: blur(12px);
          }
        }
        
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes fadeInDown {
          0% {
            opacity: 0;
            transform: translateY(-40px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.7) rotate(-5deg);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05) rotate(2deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }
        
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(251, 191, 36, 0.3), 0 0 40px rgba(251, 191, 36, 0.1);
          }
          50% {
            box-shadow: 0 0 40px rgba(251, 191, 36, 0.6), 0 0 80px rgba(251, 191, 36, 0.2);
          }
        }
        
        @keyframes pulse-ring {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(2.4);
            opacity: 0;
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-10px) rotate(1deg);
          }
          66% {
            transform: translateY(5px) rotate(-1deg);
          }
        }
        
        .slide-enter {
          animation: slideEnter 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        
        .slide-exit {
          animation: slideExit 0.8s cubic-bezier(0.55, 0.06, 0.68, 0.19) forwards;
        }
        
        .fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .fade-in-down {
          animation: fadeInDown 0.8s ease-out forwards;
        }
        
        .fade-in-scale {
          animation: fadeInScale 1s ease-out forwards;
        }
        
        .shimmer-effect {
          background: linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.4), transparent);
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
        }
        
        .glow-effect {
          animation: glow 4s ease-in-out infinite;
        }
        
        .pulse-ring-effect::before {
          content: '';
          position: absolute;
          inset: -10px;
          border: 2px solid rgba(251, 191, 36, 0.3);
          border-radius: inherit;
          animation: pulse-ring 2s infinite;
        }
        
        .float-effect {
          animation: float 6s ease-in-out infinite;
        }
        
        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        .stagger-5 { animation-delay: 0.5s; }
        .stagger-6 { animation-delay: 0.6s; }
      `}</style>

      {/* Dynamic Background with Gradient Shift */}
      <div 
        className="absolute inset-0 transition-all duration-1000 ease-in-out"
        style={{
          background: `radial-gradient(ellipse at ${50 + (currentIndex * 10) % 40}% ${30 + (currentIndex * 15) % 60}%, 
            rgba(15, 23, 42, 0.9) 0%, 
            rgba(30, 41, 59, 0.95) 40%, 
            rgba(15, 23, 42, 1) 100%)`
        }}
      />
      
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={`orb-${currentIndex}-${i}`}
            className="absolute rounded-full bg-gradient-to-br from-gold/10 to-amber-500/5 animate-pulse"
            style={{
              width: `${100 + i * 50}px`,
              height: `${100 + i * 50}px`,
              left: `${(i * 20 + currentIndex * 5) % 90}%`,
              top: `${(i * 15 + currentIndex * 3) % 80}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i}s`
            }}
          />
        ))}
      </div>

      {/* Standee Container */}
      <div
        className={`
          w-[1080px] h-[1920px]
          bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950
          flex flex-col items-center
          p-24 text-card
          origin-center
          shadow-2xl
          scale-[0.5] lg:scale-[0.45] xl:scale-[0.5]
          ${animationPhase === 'enter' ? 'slide-enter' : ''}
          ${animationPhase === 'exit' ? 'slide-exit' : ''}
          ${animationPhase === 'stay' ? 'opacity-100' : ''}
        `}
      >
        {/* Clock Widget */}
        <div className={`absolute top-8 right-10 flex items-center gap-5 text-card/90 ${animationPhase === 'enter' ? 'fade-in-down stagger-1' : 'opacity-100'}`}>
          {playlist && (
            <div className="text-right mr-4">
              <span className="text-lg font-medium text-amber-400">Playlist:</span>
              <span className="text-lg font-medium ml-2">{playlist.name}</span>
            </div>
          )}
          <span className="text-2xl font-medium">{formatDate(currentTime)}</span>
          <span className="text-2xl font-medium">{formatTime(currentTime)}</span>
        </div>

        {/* Top Text */}
        <h2 className={`font-serif text-5xl font-semibold uppercase tracking-widest text-gold mb-3 ${animationPhase === 'enter' ? 'fade-in-down stagger-2' : 'opacity-100'}`}>
          Hoa Viên Bình Dương
        </h2>

        {/* Ornament */}
        <div className={`flex items-center gap-5 mb-6 opacity-90 float-effect ${animationPhase === 'enter' ? 'fade-in-scale stagger-3' : 'opacity-90'}`}>
          <div className="w-44 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent shimmer-effect" />
          <div className="flex items-center gap-3 pulse-ring-effect relative">
            <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            <div className="w-3 h-3 bg-gold rotate-45 glow-effect" />
            <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          </div>
          <div className="w-44 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent shimmer-effect" />
        </div>

        {/* Main Title */}
        <h1 className={`font-serif text-7xl font-bold uppercase tracking-[0.2em] text-card mb-8 float-effect ${animationPhase === 'enter' ? 'fade-in-up stagger-4' : 'opacity-100'}`}>
          Tưởng niệm
        </h1>

        {/* Portrait Frame */}
        <div className={`p-3 bg-card/10 border border-card/20 shadow-2xl mb-12 glow-effect pulse-ring-effect relative ${animationPhase === 'enter' ? 'fade-in-scale stagger-5' : 'opacity-100'}`}>
          <img
            src={currentProfile.avatarUrl}
            alt={currentProfile.name}
            className="w-[500px] h-[680px] object-cover grayscale transition-all duration-1000 hover:grayscale-0 hover:scale-105"
          />
        </div>

        {/* Info Section */}
        <div className={`text-center mb-auto ${animationPhase === 'enter' ? 'fade-in-up stagger-6' : 'opacity-100'}`}>
          <h2 className="text-6xl font-bold uppercase text-card mb-4 tracking-wide">
            {currentProfile.name}
          </h2>
          <p className="text-4xl text-slate-400 font-light">
            {currentProfile.dateRange}
          </p>
        </div>

        {/* Divider */}
        <div className={`w-48 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent my-8 shimmer-effect ${animationPhase === 'enter' ? 'fade-in-scale stagger-4' : 'opacity-100'}`} />

        {/* QR Section */}
        <div className={`flex flex-col items-center gap-5 pb-10 ${animationPhase === 'enter' ? 'fade-in-up stagger-6' : 'opacity-100'}`}>
          <h3 className="text-3xl font-bold uppercase text-gold">
            Sổ Tang Điện Tử
          </h3>
          <div className="bg-card p-4 rounded-xl shadow-lg glow-effect">
            <QRCodeSVG
              value={getProfileUrl(currentProfile.id)}
              size={144}
              level="H"
              fgColor="#1e293b"
            />
          </div>
          <p className="text-xl text-slate-300 text-center leading-relaxed">
            Quét mã để gửi lời chia buồn<br />
            Scan to visit memorial page
          </p>
        </div>
      </div>

      {/* Enhanced Progress Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-2 bg-foreground/20 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/20 to-transparent shimmer-effect" />
        <div
          className="h-full bg-gradient-to-r from-gold via-amber-400 to-gold shadow-[0_-4px_20px_rgba(251,191,36,0.6)] transition-all duration-200 ease-out relative overflow-hidden"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent shimmer-effect" />
        </div>
      </div>

      {/* Slide Counter */}
      <div className={`fixed top-5 left-5 bg-foreground/80 backdrop-blur-sm text-card px-6 py-3 rounded-xl z-50 transition-all duration-500 border border-gold/20 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
        <span className="text-lg font-medium">{currentIndex + 1}</span>
        <span className="text-gold mx-2">/</span>
        <span className="text-lg font-medium">{profiles.length}</span>
      </div>

      {/* Enhanced Controls */}
      <div className={`fixed top-5 right-5 flex gap-3 z-50 transition-all duration-500 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
        <Button 
          variant="secondary" 
          onClick={prevSlide} 
          disabled={isTransitioning}
          className="bg-foreground/80 backdrop-blur-sm hover:bg-foreground/90 text-card border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:scale-105 disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Trước
        </Button>
        <Button 
          variant="secondary" 
          onClick={togglePause} 
          className="bg-foreground/80 backdrop-blur-sm hover:bg-foreground/90 text-card border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:scale-105"
        >
          {isPaused ? <Play className="h-4 w-4 mr-1" /> : <Pause className="h-4 w-4 mr-1" />}
          {isPaused ? "Tiếp tục" : "Tạm dừng"}
        </Button>
        <Button 
          variant="secondary" 
          onClick={nextSlide} 
          disabled={isTransitioning}
          className="bg-foreground/80 backdrop-blur-sm hover:bg-foreground/90 text-card border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:scale-105 disabled:opacity-50"
        >
          Sau <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
        <Button 
          variant="secondary" 
          onClick={exitSlideshow} 
          className="bg-red-900/80 backdrop-blur-sm hover:bg-red-800/90 text-card border border-red-500/20 hover:border-red-500/40 transition-all duration-300 hover:scale-105"
        >
          <X className="h-4 w-4 mr-1" /> Thoát
        </Button>
      </div>
    </div>
  );
};

export default SlideshowPage;
