import { Share2, PenLine, Calendar, QrCode, Briefcase, Star, Image } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { sanitizeHtml } from "@/lib/sanitize";
import { BiographyScroll } from "@/components/BiographyScroll";

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

// Helper function to convert UPPERCASE text to Title Case
function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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
        className="memorial-profile relative flex flex-col"
        style={{
          fontFamily: "'Inter', sans-serif",
          width: '1080px',
          height: 'auto', // Changed from fixed height
          minHeight: '1920px',
          margin: '0'
          // Removed overflow: 'hidden' to allow content expansion
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

        {/* ============ BRAND HEADER (Fixed Top) ============ */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            padding: '20px 0 10px',
            textAlign: 'center',
            flexShrink: 0
          }}
        >
          <div
            style={{
              fontSize: '16px',
              fontWeight: 600,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: GOLD_ACCENT,
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            HOA VIÊN BÌNH DƯƠNG
          </div>
        </div>

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

          {/* ============ SECTION A: BIOGRAPHY WITH AUTO-SCROLL (Full Width, Center-Aligned) ============ */}
          <div
            style={{
              padding: '36px 60px 28px',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0
            }}
          >
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '24px',
                padding: '40px 52px 20px',
                boxShadow: '0 16px 56px rgba(0,0,0,0.08)',
                border: `2px solid rgba(197, 160, 89, 0.3)`,
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                minHeight: 0
              }}
            >
              {/* Decorative corner accents */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100px',
                height: '100px',
                background: `linear-gradient(135deg, ${GOLD_ACCENT}20, transparent)`,
                borderTopLeftRadius: '24px'
              }} />
              <div style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '100px',
                height: '100px',
                background: `linear-gradient(315deg, ${GOLD_ACCENT}20, transparent)`,
                borderBottomRightRadius: '24px'
              }} />

              <h2
                style={{
                  fontSize: '32px',
                  fontWeight: 900,
                  color: NAVY_PRIMARY,
                  marginBottom: '16px',
                  textAlign: 'center',
                  letterSpacing: '-0.5px',
                  position: 'relative',
                  flexShrink: 0
                }}
              >
                <span style={{
                  borderBottom: `4px solid ${GOLD_ACCENT}`,
                  paddingBottom: '8px',
                  display: 'inline-block'
                }}>
                  Tiểu sử & Cuộc đời
                </span>
              </h2>


              {/* Auto-scrolling Biography */}
              <BiographyScroll
                biography={profile.biography}
                className="flex-1"
                seamlessLoop={true}
                pauseOnHover={false}
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
                {tributes.slice(0, hasCareerData ? 12 : 16).map((t, idx) => (
                  <div
                    key={t.id}
                    style={{
                      padding: '28px 32px', // Further increased padding
                      borderRadius: '24px !important', // Larger border radius
                      backgroundColor: '#ffffff',
                      boxShadow: '0 6px 24px rgba(0,0,0,0.06)',
                      border: `1px solid rgba(226, 232, 240, 0.8)`,
                      marginBottom: '8px' // Add bottom margin for more spacing
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                      <div
                        style={{
                          width: '52px', // Increased from 44px
                          height: '52px', // Increased from 44px
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${GOLD_ACCENT}, #D4AF37)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          fontSize: '22px', // Increased from 18px
                          fontWeight: 700,
                          boxShadow: '0 4px 12px rgba(197, 160, 89, 0.3)'
                        }}
                      >
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p style={{ fontSize: '20px', fontWeight: 700, color: NAVY_PRIMARY }}> // Increased from 18px
                          {t.name}
                        </p>
                        <p style={{ fontSize: '15px', color: '#94a3b8' }}> // Increased from 13px
                          {t.date}
                        </p>
                      </div>
                    </div>
                    <p style={{ fontSize: '18px', color: '#475569', lineHeight: 1.6 }}> // Increased from 16px
                      {t.message.length > 100 ? t.message.slice(0, 100) + '...' : t.message} // Increased character limit
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ============ FOOTER - DUAL QR CODE SECTION (Fixed Bottom) ============ */}
          <div
            style={{
              marginTop: 'auto',
              backgroundColor: NAVY_PRIMARY,
              padding: '40px 40px 50px', // Increased padding
              flexShrink: 0
            }}
          >
            {/* Dual QR Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 2px 1fr',
                gap: '32px', // Increased from 20px
                alignItems: 'center'
              }}
            >
              {/* Left Column - Memorial Tribute */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px'
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <h3
                    style={{
                      fontSize: '28px', // Increased from 24px
                      fontWeight: 700,
                      color: '#ffffff',
                      margin: '0 0 12px 0', // Increased margin
                      letterSpacing: '-0.3px'
                    }}
                  >
                    Gửi lời chia buồn
                  </h3>
                  <p
                    style={{
                      fontSize: '18px', // Increased from 16px
                      color: 'rgba(255,255,255,0.75)',
                      margin: 0
                    }}
                  >
                    Quét để để lại kỷ niệm
                  </p>
                </div>
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    padding: '12px',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.25)'
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

              {/* Vertical Divider */}
              <div
                style={{
                  width: '2px',
                  height: '240px', // Increased from 200px
                  background: `linear-gradient(to bottom, transparent, ${GOLD_ACCENT}60, transparent)`,
                  justifySelf: 'center'
                }}
              />

              {/* Right Column - Homepage */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px'
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <h3
                    style={{
                      fontSize: '28px', // Increased from 24px
                      fontWeight: 700,
                      color: '#ffffff',
                      margin: '0 0 12px 0', // Increased margin
                      letterSpacing: '-0.3px'
                    }}
                  >
                    Trang chủ CPHACO
                  </h3>
                  <p
                    style={{
                      fontSize: '16px',
                      color: 'rgba(255,255,255,0.75)',
                      margin: 0
                    }}
                  >
                    Xem giải pháp phù hợp
                  </p>
                </div>
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    padding: '12px',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.25)'
                  }}
                >
                  <QRCodeSVG
                    value="https://cphaco.vn"
                    size={180}
                    level="H"
                    fgColor={NAVY_PRIMARY}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SLIDESHOW MODE - Professional Digital Signage (Vertical Stack Layout)
  // STRICT: 35% Header | 25% Bio | 40% Footer = 100% (1920px)
  if (slideshowMode) {
    return (
      <div
        className="memorial-profile"
        style={{
          fontFamily: "'Inter', sans-serif",
          width: '1080px',
          height: '1920px',
          maxHeight: '1920px',
          minHeight: '1920px',
          overflow: 'hidden',
          position: 'relative'
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

        {/* Animation Styles + Gradient Masks */}
        <style>{`
          @keyframes float-slide {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-6px); }
          }
          .float-slide {
            animation: float-slide 4s ease-in-out infinite;
          }
          /* Strong gradient mask for bio scroll - smooth fade at edges */
          .bio-scroll-mask {
            mask-image: linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%);
            -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%);
          }
        `}</style>

        {/* ============ SECTION 1: HEADER - 35% (672px) ============ */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '672px', // FIXED 35% of 1920px
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 40px',
            overflow: 'hidden',
            zIndex: 10
          }}
        >
          {/* Brand Name - GRAND & MAJESTIC */}
          <div
            style={{
              fontSize: '58px',
              fontWeight: 900,
              letterSpacing: '6px',
              textTransform: 'uppercase',
              color: GOLD_ACCENT,
              textShadow: '0 4px 8px rgba(0,0,0,0.2)',
              fontFamily: "'Playfair Display', Georgia, serif",
              marginBottom: '28px'
            }}
          >
            HOA VIÊN BÌNH DƯƠNG
          </div>

          {/* Profile Picture - LARGE FOCAL POINT */}
          <div className="float-slide" style={{ marginBottom: '24px' }}>
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              style={{
                width: '240px',
                height: '300px',
                objectFit: 'cover',
                borderRadius: '18px',
                border: `6px solid ${GOLD_ACCENT}`,
                boxShadow: '0 24px 60px rgba(0,0,0,0.25)'
              }}
            />
          </div>

          {/* Name - MAJESTIC */}
          <h1
            style={{
              fontSize: '62px',
              fontWeight: 900,
              color: NAVY_PRIMARY,
              textAlign: 'center',
              letterSpacing: '-1px',
              marginBottom: '14px',
              textTransform: 'uppercase',
              textShadow: '0 3px 6px rgba(0,0,0,0.12)'
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
              gap: '14px',
              marginBottom: '14px'
            }}
          >
            <Calendar style={{ width: '32px', height: '32px' }} />
            {years}
          </div>

          {/* Resting Place */}
          <div
            style={{
              textAlign: 'center',
              fontSize: '22px',
              fontStyle: 'italic',
              color: '#555555',
              letterSpacing: '0.5px'
            }}
          >
            {toTitleCase(profile.name)} đang an nghỉ tại Đường Nghệ sĩ Hoa Viên Bình Dương
          </div>
        </div>

        {/* Divider between Header and Bio */}
        <div
          style={{
            position: 'absolute',
            top: '672px',
            left: '60px',
            right: '60px',
            height: '3px',
            background: `linear-gradient(90deg, transparent 0%, ${GOLD_ACCENT} 20%, ${GOLD_ACCENT} 80%, transparent 100%)`,
            zIndex: 15
          }}
        />

        {/* ============ SECTION 2: BIOGRAPHY - 25% (480px) ============ */}
        <div
          style={{
            position: 'absolute',
            top: '672px', // Starts after header
            left: 0,
            right: 0,
            height: '480px', // FIXED 25% of 1920px
            padding: '20px 40px 16px',
            overflow: 'hidden',
            zIndex: 10
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.96)',
              borderRadius: '20px',
              padding: '20px 36px 16px',
              boxShadow: '0 12px 48px rgba(0,0,0,0.07)',
              border: `2px solid rgba(197, 160, 89, 0.3)`,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            {/* Decorative accents */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '80px',
              height: '80px',
              background: `linear-gradient(135deg, ${GOLD_ACCENT}20, transparent)`,
              borderTopLeftRadius: '20px'
            }} />
            <div style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '80px',
              height: '80px',
              background: `linear-gradient(315deg, ${GOLD_ACCENT}20, transparent)`,
              borderBottomRightRadius: '20px'
            }} />

            <h2
              style={{
                fontSize: '26px',
                fontWeight: 900,
                color: NAVY_PRIMARY,
                marginBottom: '12px',
                textAlign: 'center',
                letterSpacing: '-0.5px',
                position: 'relative',
                flexShrink: 0
              }}
            >
              <span style={{
                borderBottom: `3px solid ${GOLD_ACCENT}`,
                paddingBottom: '6px',
                display: 'inline-block'
              }}>
                Tiểu sử & Cuộc đời
              </span>
            </h2>

            {/* Auto-scrolling Biography with strong gradient mask */}
            <div className="bio-scroll-mask" style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
              <BiographyScroll
                biography={profile.biography}
                className="h-full"
                seamlessLoop={true}
                pauseOnHover={false}
              />
            </div>
          </div>
        </div>

        {/* Divider between Bio and Footer */}
        <div
          style={{
            position: 'absolute',
            top: '1152px', // 672 + 480
            left: '80px',
            right: '80px',
            height: '2px',
            background: `linear-gradient(90deg, transparent 0%, ${GOLD_ACCENT}50 30%, ${GOLD_ACCENT}50 70%, transparent 100%)`,
            zIndex: 15
          }}
        />

        {/* ============ SECTION 3: FOOTER - 40% (768px) ============ */}
        <div
          style={{
            position: 'absolute',
            top: '1152px', // Starts after header + bio (672 + 480)
            left: 0,
            right: 0,
            height: '768px', // FIXED 40% of 1920px
            padding: '20px 40px 24px',
            overflow: 'hidden',
            zIndex: 10
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.96)',
              borderRadius: '20px',
              padding: '24px 36px 20px',
              boxShadow: '0 12px 48px rgba(0,0,0,0.07)',
              border: `2px solid rgba(197, 160, 89, 0.3)`,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            {/* Decorative accents */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '80px',
              height: '80px',
              background: `linear-gradient(135deg, ${GOLD_ACCENT}20, transparent)`,
              borderTopLeftRadius: '20px'
            }} />
            <div style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '80px',
              height: '80px',
              background: `linear-gradient(315deg, ${GOLD_ACCENT}20, transparent)`,
              borderBottomRightRadius: '20px'
            }} />

            {/* Header */}
            <h2
              style={{
                fontSize: '30px',
                fontWeight: 900,
                color: NAVY_PRIMARY,
                marginBottom: '20px',
                textAlign: 'center',
                letterSpacing: '-0.5px',
                position: 'relative',
                flexShrink: 0
              }}
            >
              <span style={{
                borderBottom: `3px solid ${GOLD_ACCENT}`,
                paddingBottom: '8px',
                display: 'inline-block'
              }}>
                Sổ Tang & Thông Tin
              </span>
            </h2>

            {/* QR Section - LARGER */}
            <div
              style={{
                padding: '20px 28px',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #F5E6D3 0%, #F8EED8 50%, #FFFBF0 100%)',
                border: `2px solid ${GOLD_ACCENT}`,
                boxShadow: `0 8px 24px rgba(197, 160, 89, 0.2)`,
                display: 'grid',
                gridTemplateColumns: '1fr 2px 1fr',
                gap: '24px',
                alignItems: 'center',
                marginBottom: '20px',
                flexShrink: 0
              }}
            >
              {/* Left Column - Memorial */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ fontSize: '22px', fontWeight: 700, color: NAVY_PRIMARY, margin: '0 0 6px 0' }}>
                    Sổ Tang Điện Tử
                  </h3>
                  <p style={{ fontSize: '16px', color: '#64748b', margin: 0 }}>
                    Quét để gửi lời chia buồn
                  </p>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '12px', boxShadow: '0 6px 16px rgba(0,0,0,0.12)' }}>
                  <QRCodeSVG value={publicUrl} size={120} level="H" fgColor={NAVY_PRIMARY} />
                </div>
              </div>

              {/* Divider */}
              <div style={{ width: '2px', height: '140px', background: `linear-gradient(to bottom, transparent, ${GOLD_ACCENT}60, transparent)` }} />

              {/* Right Column - CPHACO */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ fontSize: '22px', fontWeight: 700, color: NAVY_PRIMARY, margin: '0 0 6px 0' }}>
                    Kết nối với Hoa Viên
                  </h3>
                  <p style={{ fontSize: '16px', color: '#64748b', margin: 0 }}>
                    Giải pháp trọn vẹn
                  </p>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '12px', boxShadow: '0 6px 16px rgba(0,0,0,0.12)' }}>
                  <QRCodeSVG value="https://cphaco.vn" size={120} level="H" fgColor={NAVY_PRIMARY} />
                </div>
              </div>
            </div>

            {/* Messages Sub-header */}
            <h3
              style={{
                fontSize: '22px',
                fontWeight: 700,
                color: NAVY_PRIMARY,
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexShrink: 0
              }}
            >
              Lời chia buồn
              <span style={{
                fontSize: '14px',
                padding: '6px 14px',
                borderRadius: '9999px',
                backgroundColor: `${GOLD_ACCENT}18`,
                color: GOLD_ACCENT,
                fontWeight: 600,
                border: `1px solid ${GOLD_ACCENT}30`
              }}>
                {tributes.length} lời nhắn
              </span>
            </h3>

            {/* 4 Messages - 2x2 Grid - LARGER CARDS */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gridTemplateRows: '1fr 1fr',
                gap: '14px',
                flex: 1,
                overflow: 'hidden'
              }}
            >
              {tributes.slice(0, 4).map((t) => (
                <div
                  key={t.id}
                  style={{
                    padding: '18px 20px',
                    borderRadius: '16px',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
                    border: `1px solid rgba(226, 232, 240, 0.8)`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${GOLD_ACCENT}, #D4AF37)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontSize: '20px',
                        fontWeight: 700,
                        boxShadow: '0 4px 12px rgba(197, 160, 89, 0.3)',
                        flexShrink: 0
                      }}
                    >
                      {t.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '19px', fontWeight: 700, color: NAVY_PRIMARY, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.name}
                      </p>
                      <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
                        {t.date}
                      </p>
                    </div>
                  </div>
                  <p style={{ fontSize: '17px', color: '#475569', lineHeight: 1.5, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {t.message.length > 80 ? t.message.slice(0, 80) + '...' : t.message}
                  </p>
                </div>
              ))}
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
            className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2 mb-3 sm:mb-4"
            style={{ color: GOLD_ACCENT }}
          >
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
            {years}
          </div>

          {/* Resting Place */}
          <div
            className="text-center text-sm sm:text-base md:text-lg italic"
            style={{ color: '#555555' }}
          >
            {toTitleCase(profile.name)} đang an nghỉ tại Đường Nghệ sĩ Hoa Viên Bình Dương
          </div>
        </div>

        {/* Divider */}
        <div
          className="h-0.5 mx-8 sm:mx-16 mb-6"
          style={{
            background: `linear-gradient(90deg, transparent 5%, ${GOLD_ACCENT} 25%, ${GOLD_ACCENT} 75%, transparent 95%)`
          }}
        />

        {/* Biography Section */}
        <div className="card-hover mb-6 p-6 sm:p-8 rounded-2xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.96)', boxShadow: '0 12px 48px rgba(0,0,0,0.07)', border: `2px solid rgba(197, 160, 89, 0.3)` }}>
          <h2 className="text-xl sm:text-2xl font-black text-center mb-4" style={{ color: NAVY_PRIMARY }}>
            <span style={{ borderBottom: `3px solid ${GOLD_ACCENT}`, paddingBottom: '8px' }}>
              Tiểu sử & Cuộc đời
            </span>
          </h2>
          <div
            className="prose prose-lg max-w-none"
            style={{ color: '#374151', lineHeight: 1.8 }}
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(profile.biography) }}
          />
        </div>

        {/* Career Section */}
        {hasCareerData && (
          <div className="card-hover mb-6 p-6 sm:p-8 rounded-2xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.92)', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: `1px solid rgba(197, 160, 89, 0.2)` }}>
            <h2 className="text-xl sm:text-2xl font-black text-center mb-4" style={{ color: NAVY_PRIMARY }}>
              Quá trình công tác
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.roles.map((role, index) => (
                <div key={index} className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: 'rgba(253, 252, 248, 0.8)', border: `1px solid rgba(197, 160, 89, 0.15)` }}>
                  <Briefcase className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: GOLD_ACCENT }} />
                  <p className="text-base" style={{ color: '#374151' }}>{role}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tribute Form */}
        <div className="card-hover mb-6 p-6 sm:p-8 rounded-2xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.96)', boxShadow: '0 12px 48px rgba(0,0,0,0.07)', border: `2px solid rgba(197, 160, 89, 0.3)` }}>
          <h2 className="text-xl sm:text-2xl font-black text-center mb-4" style={{ color: NAVY_PRIMARY }}>
            <span style={{ borderBottom: `3px solid ${GOLD_ACCENT}`, paddingBottom: '8px' }}>
              Gửi lời chia buồn
            </span>
          </h2>
          <form onSubmit={onSubmitTribute} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Họ và tên"
                value={formData.name}
                onChange={(e) => onChangeForm({ name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                style={{ borderColor: 'rgba(197, 160, 89, 0.3)', backgroundColor: '#FDFCF8' }}
              />
              <input
                type="tel"
                placeholder="Số điện thoại"
                value={formData.phone}
                onChange={(e) => onChangeForm({ phone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                style={{ borderColor: 'rgba(197, 160, 89, 0.3)', backgroundColor: '#FDFCF8' }}
              />
            </div>
            <textarea
              placeholder="Lời chia buồn..."
              value={formData.message}
              onChange={(e) => onChangeForm({ message: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 resize-none"
              style={{ borderColor: 'rgba(197, 160, 89, 0.3)', backgroundColor: '#FDFCF8' }}
            />
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-white btn-hover transition-all"
              style={{ backgroundColor: NAVY_PRIMARY }}
            >
              <PenLine className="w-5 h-5 inline mr-2" />
              Gửi lời chia buồn
            </button>
          </form>
        </div>

        {/* Tributes List */}
        <div className="card-hover p-6 sm:p-8 rounded-2xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.96)', boxShadow: '0 12px 48px rgba(0,0,0,0.07)', border: `2px solid rgba(197, 160, 89, 0.3)` }}>
          <h2 className="text-xl sm:text-2xl font-black text-center mb-4" style={{ color: NAVY_PRIMARY }}>
            <span style={{ borderBottom: `3px solid ${GOLD_ACCENT}`, paddingBottom: '8px' }}>
              Lời chia buồn
            </span>
          </h2>
          <div className="space-y-4">
            {tributes.map((t) => (
              <div key={t.id} className="p-4 rounded-xl" style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: `1px solid rgba(226, 232, 240, 0.8)` }}>
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ background: `linear-gradient(135deg, ${GOLD_ACCENT}, #D4AF37)` }}
                  >
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: NAVY_PRIMARY }}>{t.name}</p>
                    <p className="text-sm text-gray-400">{t.date}</p>
                  </div>
                </div>
                <p className="text-gray-600">{t.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Share Button */}
        <button
          onClick={onOpenShare}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg btn-hover"
          style={{ backgroundColor: NAVY_PRIMARY }}
        >
          <Share2 className="w-6 h-6" />
        </button>
      </div>

      {/* Photo Modal */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          {selectedPhoto && (
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.caption || ''}
              className="w-full h-auto"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}