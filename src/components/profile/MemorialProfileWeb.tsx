import { Share2, PenLine, Calendar, QrCode, Briefcase, Star, Image } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { sanitizeHtml } from "@/lib/sanitize";

type MemorialProfile = {
  id: string;
  name: string;
  dateRange: string;
  avatarUrl: string;
  coverUrl?: string;
  biography: string;
  roles: string[];
};

type Tribute = {
  id: number;
  name: string;
  phone: string;
  message: string;
  date: string;
};

type Photo = {
  id: string;
  url: string;
  caption: string | null;
  display_order: number | null;
};

// Muted Gold accent color
const GOLD_ACCENT = '#C5A059';
const NAVY_PRIMARY = '#1e3a5f';
const SKY_BLUE = '#0ea5e9';

function buildPublicProfileUrl(profileId: string) {
  return `${window.location.origin}/profile/${profileId}`;
}

export default function MemorialProfileWeb({
  profile,
  tributes,
  photos = [],
  formData,
  onChangeForm,
  onSubmitTribute,
  onOpenShare,
  slideshowMode = false,
  kioskMode = false,
}: {
  profile: MemorialProfile;
  tributes: Tribute[];
  photos?: Photo[];
  formData: { name: string; phone: string; message: string };
  onChangeForm: (patch: Partial<{ name: string; phone: string; message: string }>) => void;
  onSubmitTribute: (e: React.FormEvent) => void;
  onOpenShare: () => void;
  slideshowMode?: boolean;
  kioskMode?: boolean;
}) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const publicUrl = buildPublicProfileUrl(profile.id);

  // Extract years from dateRange
  const years = profile.dateRange.split(' - ').map(d => d.split('/').pop()).join(' — ');

  // Shared card style
  const cardStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
    border: '1px solid rgba(255,255,255,0.8)'
  };

  // Check if career/roles data exists
  const hasCareerData = profile.roles && profile.roles.length > 0;

  // KIOSK MODE - Professional Digital Signage (1080x1920 Vertical Stack)
  if (kioskMode) {
    return (
      <div
        className="relative flex flex-col"
        style={{
          fontFamily: "'Inter', sans-serif",
          width: '1080px',
          height: '1920px',
          minHeight: '1920px',
          maxHeight: '1920px',
          margin: '0 auto',
          overflow: 'hidden'
        }}
      >
        {/* Premium CSS Gradient Background (Cream to Muted Gold) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, #FDFCF8 0%, #F8F3E3 40%, #F3E5AB 100%)',
            zIndex: 0
          }}
        />
        {/* Subtle Noise/Grain Texture Overlay (3%) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.03,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            zIndex: 1
          }}
        />

        {/* Kiosk Animation Styles */}
        <style>{`
          @keyframes float-kiosk {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
          .float-kiosk {
            animation: float-kiosk 5s ease-in-out infinite;
          }
        `}</style>

        {/* Main Content Wrapper - Full Height Flex Column */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}
        >
          {/* ============ HEADER - Profile + Name + Dates ============ */}
          <div
            style={{
              padding: '50px 60px 36px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flexShrink: 0
            }}
          >
            {/* Profile Picture */}
            <div className="float-kiosk" style={{ marginBottom: '24px' }}>
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                style={{
                  width: '280px',
                  height: '350px',
                  objectFit: 'cover',
                  borderRadius: '20px',
                  border: `5px solid ${GOLD_ACCENT}`,
                  boxShadow: '0 24px 60px rgba(0,0,0,0.18)'
                }}
              />
            </div>

            {/* Name - Bold & Dark */}
            <h1
              style={{
                fontSize: '64px',
                fontWeight: 900,
                color: NAVY_PRIMARY,
                textAlign: 'center',
                letterSpacing: '-2px',
                marginBottom: '12px',
                textTransform: 'uppercase'
              }}
            >
              {profile.name}
            </h1>

            {/* Dates */}
            <div
              style={{
                fontSize: '32px',
                color: GOLD_ACCENT,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}
            >
              <Calendar style={{ width: '32px', height: '32px' }} />
              {years}
            </div>
          </div>

          {/* Elegant Gold Divider */}
          <div
            style={{
              height: '2px',
              background: `linear-gradient(90deg, transparent 5%, ${GOLD_ACCENT} 25%, ${GOLD_ACCENT} 75%, transparent 95%)`,
              margin: '0 80px',
              flexShrink: 0
            }}
          />

          {/* ============ SECTION A: BIOGRAPHY (Full Width, Center-Aligned) ============ */}
          <div
            style={{
              padding: '36px 60px 28px',
              flexShrink: 0
            }}
          >
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                borderRadius: '24px',
                padding: '36px 48px',
                boxShadow: '0 12px 48px rgba(0,0,0,0.06)',
                border: `1px solid rgba(197, 160, 89, 0.25)`
              }}
            >
              <h2
                style={{
                  fontSize: '30px',
                  fontWeight: 800,
                  color: NAVY_PRIMARY,
                  marginBottom: '20px',
                  textAlign: 'center',
                  letterSpacing: '-0.5px'
                }}
              >
                Tiểu sử & Cuộc đời
              </h2>
              <div
                style={{
                  fontSize: '24px',
                  color: '#374151',
                  lineHeight: 1.9,
                  textAlign: 'center'
                }}
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(profile.biography) }}
              />
            </div>
          </div>

          {/* Subtle Divider */}
          <div
            style={{
              height: '1px',
              background: `linear-gradient(90deg, transparent 10%, ${GOLD_ACCENT}40 35%, ${GOLD_ACCENT}40 65%, transparent 90%)`,
              margin: '0 100px',
              flexShrink: 0
            }}
          />

          {/* ============ SECTION B: CAREER HISTORY (Full Width, 2-Column Grid) ============ */}
          {hasCareerData && (
            <div
              style={{
                padding: '28px 60px',
                flexShrink: 0
              }}
            >
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.92)',
                  borderRadius: '24px',
                  padding: '32px 44px',
                  boxShadow: '0 12px 48px rgba(0,0,0,0.06)',
                  border: `1px solid rgba(197, 160, 89, 0.25)`
                }}
              >
                <h2
                  style={{
                    fontSize: '28px',
                    fontWeight: 800,
                    color: NAVY_PRIMARY,
                    marginBottom: '24px',
                    textAlign: 'center',
                    letterSpacing: '-0.5px'
                  }}
                >
                  Quá trình công tác
                </h2>
                {/* 2-Column Grid for Roles */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px 32px'
                  }}
                >
                  {profile.roles.map((role, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '14px',
                        padding: '14px 18px',
                        backgroundColor: 'rgba(253, 252, 248, 0.8)',
                        borderRadius: '14px',
                        border: `1px solid rgba(197, 160, 89, 0.15)`
                      }}
                    >
                      <Briefcase
                        style={{
                          width: '24px',
                          height: '24px',
                          color: GOLD_ACCENT,
                          flexShrink: 0,
                          marginTop: '2px'
                        }}
                      />
                      <p style={{ fontSize: '19px', color: '#374151', lineHeight: 1.5 }}>
                        {role}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Subtle Divider */}
          <div
            style={{
              height: '1px',
              background: `linear-gradient(90deg, transparent 10%, ${GOLD_ACCENT}40 35%, ${GOLD_ACCENT}40 65%, transparent 90%)`,
              margin: '0 100px',
              flexShrink: 0
            }}
          />

          {/* ============ SECTION C: GUESTBOOK (Flex Grow - Space Filler) ============ */}
          <div
            style={{
              flex: 1,
              padding: '28px 60px 20px',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                flex: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                borderRadius: '24px',
                padding: '28px 40px',
                boxShadow: '0 12px 48px rgba(0,0,0,0.06)',
                border: `1px solid rgba(197, 160, 89, 0.25)`,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexShrink: 0 }}>
                <h2
                  style={{
                    fontSize: '28px',
                    fontWeight: 800,
                    color: NAVY_PRIMARY,
                    letterSpacing: '-0.5px'
                  }}
                >
                  Lời chia buồn
                </h2>
                <span
                  style={{
                    fontSize: '17px',
                    padding: '8px 20px',
                    borderRadius: '9999px',
                    backgroundColor: `${GOLD_ACCENT}18`,
                    color: GOLD_ACCENT,
                    fontWeight: 700,
                    border: `1px solid ${GOLD_ACCENT}30`
                  }}
                >
                  {tributes.length} lời nhắn
                </span>
              </div>

              {/* 2-Column Masonry-Style Grid (6-8 messages) */}
              <div
                style={{
                  flex: 1,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  overflow: 'hidden',
                  alignContent: 'start'
                }}
              >
                {tributes.slice(0, hasCareerData ? 6 : 8).map((t, idx) => (
                  <div
                    key={t.id}
                    style={{
                      padding: '18px 22px',
                      borderRadius: '18px',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                      border: `1px solid rgba(226, 232, 240, 0.8)`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${GOLD_ACCENT}, #D4AF37)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          fontSize: '18px',
                          fontWeight: 700,
                          boxShadow: '0 4px 12px rgba(197, 160, 89, 0.3)'
                        }}
                      >
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p style={{ fontSize: '18px', fontWeight: 700, color: NAVY_PRIMARY }}>
                          {t.name}
                        </p>
                        <p style={{ fontSize: '13px', color: '#94a3b8' }}>
                          {t.date}
                        </p>
                      </div>
                    </div>
                    <p style={{ fontSize: '16px', color: '#475569', lineHeight: 1.55 }}>
                      {t.message.length > 90 ? t.message.slice(0, 90) + '...' : t.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ============ FOOTER - QR Code (Full Width Bar, Anchored Bottom) ============ */}
          <div
            style={{
              marginTop: 'auto',
              backgroundColor: NAVY_PRIMARY,
              padding: '36px 60px',
              flexShrink: 0
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px'
              }}
            >
              {/* Title Above QR */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '6px' }}>
                  <Star style={{ width: '32px', height: '32px', color: GOLD_ACCENT, fill: GOLD_ACCENT }} />
                  <span
                    style={{
                      fontSize: '34px',
                      fontWeight: 800,
                      color: '#ffffff',
                      letterSpacing: '-0.5px'
                    }}
                  >
                    Quét để lưu giữ kỷ niệm
                  </span>
                  <Star style={{ width: '32px', height: '32px', color: GOLD_ACCENT, fill: GOLD_ACCENT }} />
                </div>
                <p
                  style={{
                    fontSize: '20px',
                    color: 'rgba(255,255,255,0.75)'
                  }}
                >
                  Tôn vinh và gửi lời chia buồn trên điện thoại
                </p>
              </div>

              {/* QR Code - Centered */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '18px',
                  borderRadius: '22px',
                  boxShadow: '0 12px 48px rgba(0,0,0,0.3)'
                }}
              >
                <QRCodeSVG
                  value={publicUrl}
                  size={180}
                  level="H"
                  fgColor={NAVY_PRIMARY}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SLIDESHOW MODE - Professional Digital Signage (Vertical Stack Layout)
  if (slideshowMode) {
    return (
      <div
        className="relative flex flex-col"
        style={{
          fontFamily: "'Inter', sans-serif",
          minHeight: '100vh',
          overflow: 'hidden'
        }}
      >
        {/* Premium CSS Gradient Background (Cream to Muted Gold) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, #FDFCF8 0%, #F8F3E3 40%, #F3E5AB 100%)',
            zIndex: 0
          }}
        />
        {/* Subtle Noise/Grain Texture Overlay (3%) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.03,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            zIndex: 1
          }}
        />

        {/* Animation Styles */}
        <style>{`
          @keyframes float-slide {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-6px); }
          }
          .float-slide {
            animation: float-slide 4s ease-in-out infinite;
          }
        `}</style>

        {/* Main Content Wrapper - Full Height Flex Column */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            padding: '0 clamp(24px, 5vw, 80px)'
          }}
        >
          {/* ============ 1. HEADER - Profile + Name + Dates ============ */}
          <div
            style={{
              padding: 'clamp(32px, 4vh, 60px) 0 clamp(24px, 3vh, 40px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flexShrink: 0
            }}
          >
            {/* Profile Picture */}
            <div className="float-slide" style={{ marginBottom: 'clamp(16px, 2vh, 28px)' }}>
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                style={{
                  width: 'clamp(140px, 18vw, 260px)',
                  height: 'clamp(175px, 22vw, 325px)',
                  objectFit: 'cover',
                  borderRadius: 'clamp(12px, 1.5vw, 20px)',
                  border: `4px solid ${GOLD_ACCENT}`,
                  boxShadow: '0 20px 50px rgba(0,0,0,0.15)'
                }}
              />
            </div>

            {/* Name - Bold & Dark */}
            <h1
              style={{
                fontSize: 'clamp(32px, 5vw, 58px)',
                fontWeight: 900,
                color: NAVY_PRIMARY,
                textAlign: 'center',
                letterSpacing: '-1.5px',
                marginBottom: 'clamp(8px, 1vh, 14px)',
                textTransform: 'uppercase'
              }}
            >
              {profile.name}
            </h1>

            {/* Dates */}
            <div
              style={{
                fontSize: 'clamp(18px, 2.5vw, 30px)',
                color: GOLD_ACCENT,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 'clamp(8px, 1vw, 14px)'
              }}
            >
              <Calendar style={{ width: 'clamp(20px, 2.5vw, 30px)', height: 'clamp(20px, 2.5vw, 30px)' }} />
              {years}
            </div>
          </div>

          {/* Elegant Gold Divider */}
          <div
            style={{
              height: '2px',
              background: `linear-gradient(90deg, transparent 5%, ${GOLD_ACCENT} 25%, ${GOLD_ACCENT} 75%, transparent 95%)`,
              margin: '0 clamp(20px, 5vw, 100px)',
              flexShrink: 0
            }}
          />

          {/* ============ 2. SECTION A: BIOGRAPHY (Full Width, Center-Aligned) ============ */}
          <div
            style={{
              padding: 'clamp(24px, 3vh, 40px) 0',
              flexShrink: 0
            }}
          >
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                borderRadius: 'clamp(16px, 2vw, 24px)',
                padding: 'clamp(24px, 3vw, 40px) clamp(28px, 4vw, 52px)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
                border: `1px solid rgba(197, 160, 89, 0.2)`
              }}
            >
              <h2
                style={{
                  fontSize: 'clamp(20px, 2.5vw, 28px)',
                  fontWeight: 800,
                  color: NAVY_PRIMARY,
                  marginBottom: 'clamp(14px, 2vh, 22px)',
                  textAlign: 'center',
                  letterSpacing: '-0.5px'
                }}
              >
                Tiểu sử & Cuộc đời
              </h2>
              <div
                style={{
                  fontSize: 'clamp(16px, 1.8vw, 22px)',
                  color: '#374151',
                  lineHeight: 1.85,
                  textAlign: 'center'
                }}
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(profile.biography) }}
              />
            </div>
          </div>

          {/* Subtle Divider */}
          <div
            style={{
              height: '1px',
              background: `linear-gradient(90deg, transparent 10%, ${GOLD_ACCENT}40 35%, ${GOLD_ACCENT}40 65%, transparent 90%)`,
              margin: '0 clamp(30px, 8vw, 120px)',
              flexShrink: 0
            }}
          />

          {/* ============ 3. SECTION B: CAREER HISTORY (Full Width, 2-Column Grid) ============ */}
          {hasCareerData && (
            <div
              style={{
                padding: 'clamp(24px, 3vh, 36px) 0',
                flexShrink: 0
              }}
            >
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.92)',
                  borderRadius: 'clamp(16px, 2vw, 24px)',
                  padding: 'clamp(24px, 3vw, 36px) clamp(28px, 4vw, 48px)',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
                  border: `1px solid rgba(197, 160, 89, 0.2)`
                }}
              >
                <h2
                  style={{
                    fontSize: 'clamp(18px, 2.2vw, 26px)',
                    fontWeight: 800,
                    color: NAVY_PRIMARY,
                    marginBottom: 'clamp(16px, 2vh, 24px)',
                    textAlign: 'center',
                    letterSpacing: '-0.5px'
                  }}
                >
                  Quá trình công tác
                </h2>
                {/* 2-Column Grid for Roles */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: 'clamp(12px, 1.5vw, 18px) clamp(20px, 2.5vw, 32px)'
                  }}
                >
                  {profile.roles.map((role, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 'clamp(10px, 1.2vw, 14px)',
                        padding: 'clamp(12px, 1.5vw, 16px) clamp(14px, 1.8vw, 20px)',
                        backgroundColor: 'rgba(253, 252, 248, 0.8)',
                        borderRadius: 'clamp(10px, 1.2vw, 14px)',
                        border: `1px solid rgba(197, 160, 89, 0.15)`
                      }}
                    >
                      <Briefcase
                        style={{
                          width: 'clamp(18px, 2vw, 24px)',
                          height: 'clamp(18px, 2vw, 24px)',
                          color: GOLD_ACCENT,
                          flexShrink: 0,
                          marginTop: '2px'
                        }}
                      />
                      <p style={{ fontSize: 'clamp(14px, 1.5vw, 18px)', color: '#374151', lineHeight: 1.5 }}>
                        {role}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Subtle Divider (only if career data exists) */}
          {hasCareerData && (
            <div
              style={{
                height: '1px',
                background: `linear-gradient(90deg, transparent 10%, ${GOLD_ACCENT}40 35%, ${GOLD_ACCENT}40 65%, transparent 90%)`,
                margin: '0 clamp(30px, 8vw, 120px)',
                flexShrink: 0
              }}
            />
          )}

          {/* ============ 4. SECTION C: GUESTBOOK with QR Action Card (Flex Grow - Space Filler) ============ */}
          <div
            style={{
              flex: 1,
              padding: 'clamp(24px, 3vh, 36px) 0 clamp(32px, 4vh, 48px)',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0
            }}
          >
            <div
              style={{
                flex: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                borderRadius: 'clamp(16px, 2vw, 24px)',
                padding: 'clamp(20px, 2.5vw, 32px) clamp(24px, 3vw, 44px)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
                border: `1px solid rgba(197, 160, 89, 0.2)`,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'clamp(14px, 2vh, 22px)', flexShrink: 0 }}>
                <h2
                  style={{
                    fontSize: 'clamp(18px, 2.2vw, 26px)',
                    fontWeight: 800,
                    color: NAVY_PRIMARY,
                    letterSpacing: '-0.5px'
                  }}
                >
                  Lời chia buồn
                </h2>
                <span
                  style={{
                    fontSize: 'clamp(12px, 1.3vw, 16px)',
                    padding: 'clamp(6px, 0.8vw, 10px) clamp(12px, 1.5vw, 20px)',
                    borderRadius: '9999px',
                    backgroundColor: `${GOLD_ACCENT}18`,
                    color: GOLD_ACCENT,
                    fontWeight: 700,
                    border: `1px solid ${GOLD_ACCENT}30`
                  }}
                >
                  {tributes.length} lời nhắn
                </span>
              </div>

              {/* 2-Column Grid with QR Action Card as First Item */}
              <div
                style={{
                  flex: 1,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 'clamp(12px, 1.5vw, 18px)',
                  overflow: 'hidden',
                  alignContent: 'start'
                }}
              >
                {/* ===== QR ACTION CARD (First Item - Call to Action) ===== */}
                <div
                  style={{
                    gridColumn: '1 / -1',
                    padding: 'clamp(20px, 2.5vw, 32px)',
                    borderRadius: 'clamp(14px, 1.8vw, 20px)',
                    background: 'linear-gradient(135deg, #F5E6D3 0%, #F8EED8 50%, #FFFBF0 100%)',
                    border: `2px solid ${GOLD_ACCENT}`,
                    boxShadow: `0 8px 32px rgba(197, 160, 89, 0.2), inset 0 1px 0 rgba(255,255,255,0.8)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'clamp(24px, 3vw, 40px)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                >
                  {/* QR Code */}
                  <div
                    style={{
                      backgroundColor: '#ffffff',
                      padding: 'clamp(10px, 1.2vw, 14px)',
                      borderRadius: 'clamp(12px, 1.5vw, 16px)',
                      boxShadow: '0 6px 24px rgba(0,0,0,0.1)',
                      border: `1px solid rgba(197, 160, 89, 0.3)`
                    }}
                  >
                    <QRCodeSVG
                      value={publicUrl}
                      size={Math.max(120, Math.min(150, window.innerWidth * 0.1))}
                      level="H"
                      fgColor={NAVY_PRIMARY}
                    />
                  </div>

                  {/* Text Content */}
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1vw, 12px)', marginBottom: 'clamp(6px, 0.8vh, 10px)' }}>
                      <QrCode style={{ width: 'clamp(22px, 2.5vw, 28px)', height: 'clamp(22px, 2.5vw, 28px)', color: GOLD_ACCENT }} />
                      <span
                        style={{
                          fontSize: 'clamp(18px, 2.2vw, 26px)',
                          fontWeight: 800,
                          color: NAVY_PRIMARY,
                          letterSpacing: '-0.5px'
                        }}
                      >
                        Quét để gửi lời chia buồn
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: 'clamp(13px, 1.4vw, 17px)',
                        color: '#64748b',
                        fontWeight: 500
                      }}
                    >
                      Lưu giữ kỷ niệm mãi mãi
                    </p>
                  </div>
                </div>

                {/* Tribute Messages */}
                {tributes.slice(0, hasCareerData ? 4 : 6).map((t) => (
                  <div
                    key={t.id}
                    style={{
                      padding: 'clamp(14px, 1.8vw, 20px) clamp(16px, 2vw, 24px)',
                      borderRadius: 'clamp(12px, 1.5vw, 18px)',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                      border: `1px solid rgba(226, 232, 240, 0.8)`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 1.2vw, 14px)', marginBottom: 'clamp(8px, 1vh, 12px)' }}>
                      <div
                        style={{
                          width: 'clamp(36px, 4vw, 48px)',
                          height: 'clamp(36px, 4vw, 48px)',
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${GOLD_ACCENT}, #D4AF37)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          fontSize: 'clamp(14px, 1.6vw, 18px)',
                          fontWeight: 700,
                          boxShadow: '0 4px 12px rgba(197, 160, 89, 0.3)'
                        }}
                      >
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p style={{ fontSize: 'clamp(14px, 1.5vw, 18px)', fontWeight: 700, color: NAVY_PRIMARY }}>
                          {t.name}
                        </p>
                        <p style={{ fontSize: 'clamp(10px, 1.1vw, 13px)', color: '#94a3b8' }}>
                          {t.date}
                        </p>
                      </div>
                    </div>
                    <p style={{ fontSize: 'clamp(13px, 1.4vw, 16px)', color: '#475569', lineHeight: 1.55 }}>
                      {t.message.length > 100 ? t.message.slice(0, 100) + '...' : t.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // NORMAL MODE - Vertical Stack Layout (Same as Slideshow, with Form instead of QR)
  return (
    <div
      className="relative flex flex-col min-h-screen"
      style={{
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* Premium CSS Gradient Background (Cream to Muted Gold) */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'linear-gradient(180deg, #FDFCF8 0%, #F8F3E3 40%, #F3E5AB 100%)',
          zIndex: 0
        }}
      />
      {/* Subtle Noise/Grain Texture Overlay (3%) */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          zIndex: 1,
          pointerEvents: 'none'
        }}
      />

      {/* Animation Styles */}
      <style>{`
        @keyframes float-normal {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .float-normal {
          animation: float-normal 4s ease-in-out infinite;
        }
        .btn-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(30, 58, 95, 0.4) !important;
        }
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.08) !important;
        }
      `}</style>

      {/* Main Content Wrapper - Vertical Stack */}
      <div
        className="relative z-10 flex flex-col w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
        style={{ zIndex: 2 }}
      >
        {/* ============ 1. HEADER - Profile + Name + Dates ============ */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 'clamp(20px, 3vh, 32px)'
          }}
        >
          {/* Profile Picture */}
          <div 
            className="float-normal cursor-pointer" 
            style={{ marginBottom: 'clamp(14px, 2vh, 24px)' }}
            onClick={() => setSelectedPhoto({ id: 'avatar', url: profile.avatarUrl, caption: profile.name, display_order: null })}
          >
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-32 h-40 sm:w-40 sm:h-52 md:w-48 md:h-60 object-cover transition-transform duration-300 hover:scale-105"
              style={{
                borderRadius: 'clamp(12px, 1.5vw, 18px)',
                border: `4px solid ${GOLD_ACCENT}`,
                boxShadow: '0 16px 40px rgba(0,0,0,0.15)'
              }}
            />
          </div>

          {/* Name - Bold & Dark */}
          <h1
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-center uppercase mb-2 sm:mb-3"
            style={{
              color: NAVY_PRIMARY,
              letterSpacing: '-1px'
            }}
          >
            {profile.name}
          </h1>

          {/* Dates */}
          <div
            className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl md:text-2xl font-bold"
            style={{ color: GOLD_ACCENT }}
          >
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
            {years}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4 sm:mt-5">
            <button
              onClick={() => (document.getElementById("tributeNameNormal") as HTMLInputElement | null)?.focus()}
              className="btn-hover flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold text-sm transition-all duration-300"
              style={{
                backgroundColor: NAVY_PRIMARY,
                color: '#ffffff',
                boxShadow: '0 6px 20px rgba(30, 58, 95, 0.35)'
              }}
            >
              <PenLine className="w-4 h-4" style={{ color: GOLD_ACCENT }} />
              Gửi lời chia buồn
            </button>
            <button
              onClick={onOpenShare}
              className="flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold text-sm transition-all duration-300 hover:bg-white/90"
              style={{
                backgroundColor: 'rgba(255,255,255,0.8)',
                color: NAVY_PRIMARY,
                border: '1.5px solid rgba(226,232,240,0.8)'
              }}
            >
              <Share2 className="w-4 h-4" style={{ color: GOLD_ACCENT }} />
              Chia sẻ
            </button>
          </div>
        </div>

        {/* Elegant Gold Divider */}
        <div
          style={{
            height: '2px',
            background: `linear-gradient(90deg, transparent 5%, ${GOLD_ACCENT} 25%, ${GOLD_ACCENT} 75%, transparent 95%)`,
            marginBottom: 'clamp(20px, 3vh, 32px)'
          }}
        />

        {/* ============ 2. SECTION A: BIOGRAPHY (Full Width, Center-Aligned) ============ */}
        <div
          className="card-hover transition-all duration-300 mb-5 sm:mb-6"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            borderRadius: 'clamp(14px, 2vw, 20px)',
            padding: 'clamp(20px, 3vw, 32px) clamp(24px, 4vw, 40px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
            border: `1px solid rgba(197, 160, 89, 0.2)`
          }}
        >
          <h2
            className="text-lg sm:text-xl md:text-2xl font-bold text-center mb-4 sm:mb-5"
            style={{ color: NAVY_PRIMARY, letterSpacing: '-0.5px' }}
          >
            Tiểu sử & Cuộc đời
          </h2>
          <div
            className="text-sm sm:text-base md:text-lg text-center"
            style={{ color: '#374151', lineHeight: 1.85 }}
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(profile.biography) }}
          />
        </div>

        {/* ============ PHOTO GALLERY SECTION ============ */}
        {photos.length > 0 && (
          <>
            {/* Subtle Divider */}
            <div
              style={{
                height: '1px',
                background: `linear-gradient(90deg, transparent 10%, ${GOLD_ACCENT}40 35%, ${GOLD_ACCENT}40 65%, transparent 90%)`,
                marginBottom: 'clamp(20px, 3vh, 28px)'
              }}
            />

            <div
              className="card-hover transition-all duration-300 mb-5 sm:mb-6"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                borderRadius: 'clamp(14px, 2vw, 20px)',
                padding: 'clamp(20px, 3vw, 28px) clamp(24px, 4vw, 36px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
                border: `1px solid rgba(197, 160, 89, 0.2)`
              }}
            >
              <div className="flex items-center justify-center gap-2 mb-4 sm:mb-5">
                <Image className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: GOLD_ACCENT }} />
                <h2
                  className="text-lg sm:text-xl md:text-2xl font-bold text-center"
                  style={{ color: NAVY_PRIMARY, letterSpacing: '-0.5px' }}
                >
                  Hình ảnh kỷ niệm
                </h2>
              </div>
              
              {/* Photo Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative aspect-square cursor-pointer group overflow-hidden rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                    onClick={() => setSelectedPhoto(photo)}
                    style={{
                      border: `1px solid rgba(197, 160, 89, 0.2)`
                    }}
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption || "Ảnh kỷ niệm"}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    {photo.caption && (
                      <div
                        className="absolute bottom-0 left-0 right-0 p-2 text-xs text-white bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        {photo.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Subtle Divider */}
        <div
          style={{
            height: '1px',
            background: `linear-gradient(90deg, transparent 10%, ${GOLD_ACCENT}40 35%, ${GOLD_ACCENT}40 65%, transparent 90%)`,
            marginBottom: 'clamp(20px, 3vh, 28px)'
          }}
        />

        {/* ============ 3. SECTION B: CAREER HISTORY (Full Width, Grid) ============ */}
        {hasCareerData && (
          <>
            <div
              className="card-hover transition-all duration-300 mb-5 sm:mb-6"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                borderRadius: 'clamp(14px, 2vw, 20px)',
                padding: 'clamp(20px, 3vw, 28px) clamp(24px, 4vw, 36px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
                border: `1px solid rgba(197, 160, 89, 0.2)`
              }}
            >
              <h2
                className="text-base sm:text-lg md:text-xl font-bold text-center mb-4 sm:mb-5"
                style={{ color: NAVY_PRIMARY, letterSpacing: '-0.5px' }}
              >
                Quá trình công tác
              </h2>
              {/* 2-Column Grid for Roles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {profile.roles.map((role, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 sm:p-4 rounded-xl transition-colors"
                    style={{
                      backgroundColor: 'rgba(253, 252, 248, 0.8)',
                      border: `1px solid rgba(197, 160, 89, 0.15)`
                    }}
                  >
                    <Briefcase
                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                      style={{ color: GOLD_ACCENT }}
                    />
                    <p className="text-sm sm:text-base" style={{ color: '#374151', lineHeight: 1.5 }}>
                      {role}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Subtle Divider */}
            <div
              style={{
                height: '1px',
                background: `linear-gradient(90deg, transparent 10%, ${GOLD_ACCENT}40 35%, ${GOLD_ACCENT}40 65%, transparent 90%)`,
                marginBottom: 'clamp(20px, 3vh, 28px)'
              }}
            />
          </>
        )}

        {/* ============ 4. SECTION C: TRIBUTE FORM (Instead of QR) ============ */}
        <div
          className="card-hover transition-all duration-300 mb-5 sm:mb-6"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 'clamp(14px, 2vw, 20px)',
            padding: 'clamp(20px, 3vw, 28px) clamp(24px, 4vw, 36px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
            border: `2px solid ${GOLD_ACCENT}40`
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-4 sm:mb-5">
            <PenLine className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: GOLD_ACCENT }} />
            <h2
              className="text-base sm:text-lg md:text-xl font-bold"
              style={{ color: NAVY_PRIMARY }}
            >
              Gửi lời chia buồn
            </h2>
          </div>

          <form onSubmit={onSubmitTribute}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
              <input
                id="tributeNameNormal"
                placeholder="Họ và tên..."
                value={formData.name}
                onChange={(e) => onChangeForm({ name: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'rgba(253, 252, 248, 0.95)',
                  border: `1px solid ${GOLD_ACCENT}30`,
                  color: '#334155'
                }}
              />
              <input
                type="tel"
                placeholder="Số điện thoại..."
                value={formData.phone}
                onChange={(e) => onChangeForm({ phone: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'rgba(253, 252, 248, 0.95)',
                  border: `1px solid ${GOLD_ACCENT}30`,
                  color: '#334155'
                }}
              />
            </div>
            <textarea
              placeholder="Viết lời chia buồn..."
              value={formData.message}
              onChange={(e) => onChangeForm({ message: e.target.value })}
              rows={3}
              required
              className="w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 resize-none mb-4"
              style={{
                backgroundColor: 'rgba(253, 252, 248, 0.95)',
                border: `1px solid ${GOLD_ACCENT}30`,
                color: '#334155'
              }}
            />
            <button
              type="submit"
              className="btn-hover w-full py-3 rounded-full font-semibold text-sm transition-all duration-300"
              style={{
                backgroundColor: NAVY_PRIMARY,
                color: '#ffffff',
                boxShadow: '0 6px 20px rgba(30, 58, 95, 0.3)'
              }}
            >
              Gửi lời chia buồn
            </button>
          </form>
        </div>

        {/* Subtle Divider */}
        <div
          style={{
            height: '1px',
            background: `linear-gradient(90deg, transparent 10%, ${GOLD_ACCENT}40 35%, ${GOLD_ACCENT}40 65%, transparent 90%)`,
            marginBottom: 'clamp(20px, 3vh, 28px)'
          }}
        />

        {/* ============ 5. SECTION D: GUESTBOOK (Tributes List) ============ */}
        <div
          className="card-hover transition-all duration-300 mb-8"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            borderRadius: 'clamp(14px, 2vw, 20px)',
            padding: 'clamp(20px, 3vw, 28px) clamp(24px, 4vw, 36px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
            border: `1px solid rgba(197, 160, 89, 0.2)`
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h2
              className="text-base sm:text-lg md:text-xl font-bold"
              style={{ color: NAVY_PRIMARY, letterSpacing: '-0.5px' }}
            >
              Lời chia buồn
            </h2>
            <span
              className="text-xs sm:text-sm px-3 py-1.5 rounded-full font-semibold"
              style={{
                backgroundColor: `${GOLD_ACCENT}18`,
                color: GOLD_ACCENT,
                border: `1px solid ${GOLD_ACCENT}30`
              }}
            >
              {tributes.length} lời nhắn
            </span>
          </div>

          {/* 2-Column Grid for Tributes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {tributes.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-xl transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                style={{
                  backgroundColor: '#ffffff',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                  border: `1px solid rgba(226, 232, 240, 0.8)`
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                    style={{
                      background: `linear-gradient(135deg, ${GOLD_ACCENT}, #D4AF37)`,
                      color: '#ffffff',
                      boxShadow: '0 4px 12px rgba(197, 160, 89, 0.3)'
                    }}
                  >
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: NAVY_PRIMARY }}>
                      {t.name}
                    </p>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>
                      {t.date}
                    </p>
                  </div>
                </div>
                <p className="text-sm" style={{ color: '#475569', lineHeight: 1.6 }}>
                  {t.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Photo Lightbox Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-none shadow-none">
          {selectedPhoto && (
            <div className="relative">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.caption || "Ảnh kỷ niệm"}
                className="w-full max-h-[80vh] object-contain rounded-lg"
              />
              {selectedPhoto.caption && (
                <div
                  className="absolute bottom-0 left-0 right-0 p-4 text-white text-center bg-gradient-to-t from-black/80 to-transparent rounded-b-lg"
                >
                  {selectedPhoto.caption}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
