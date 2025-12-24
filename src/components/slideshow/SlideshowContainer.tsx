import React, { memo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { SlideshowProfile } from '@/hooks/useSlideshow';

interface SlideshowContainerProps {
  profile: SlideshowProfile;
  animationPhase: 'enter' | 'stay' | 'exit';
  currentTime: Date;
  playlist?: { name: string } | null;
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString("vi-VN", { 
    weekday: "long", 
    day: "2-digit", 
    month: "2-digit", 
    year: "numeric" 
  });
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString("vi-VN", { 
    hour: "2-digit", 
    minute: "2-digit" 
  });
};

const getProfileUrl = (profileId: string) => {
  return `${window.location.origin}/profile/${profileId}`;
};

export const SlideshowContainer = memo<SlideshowContainerProps>(({ 
  profile, 
  animationPhase, 
  currentTime, 
  playlist 
}) => {
  return (
    <div
      className={`
        slideshow-container
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
          src={profile.avatarUrl}
          alt={profile.name}
          className="slideshow-image w-[500px] h-[680px] object-cover grayscale transition-all duration-1000 hover:grayscale-0 hover:scale-105"
          loading="eager"
        />
      </div>

      {/* Info Section */}
      <div className={`text-center mb-auto ${animationPhase === 'enter' ? 'fade-in-up stagger-6' : 'opacity-100'}`}>
        <h2 className="text-6xl font-bold uppercase text-card mb-4 tracking-wide">
          {profile.name}
        </h2>
        <p className="text-4xl text-slate-400 font-light">
          {profile.dateRange}
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
            value={getProfileUrl(profile.id)}
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
  );
});

SlideshowContainer.displayName = 'SlideshowContainer';