import { Share2, PenLine, Calendar, QrCode, Briefcase, Star, Image, MapPin, User, Flower2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { sanitizeHtml } from "@/lib/sanitize";
import { COMMENT_LIMITS } from "@/hooks/useComments";
import { BiographyScroll } from "@/components/BiographyScroll";
import { ExpandableText } from "@/components/ui/ExpandableText";
import lotusImage from "@/assets/Hoa sen vang.png";

type MemorialProfile = {
  id: string;
  name: string;
  dateRange: string;
  avatarUrl: string;
  coverUrl?: string;
  biography: string;
  roles: string[];
  mapsUrl?: string;
  isBuried?: boolean;
};

type Tribute = {
  id: string; // Changed from number to string to match database
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

// Honorific abbreviations that must stay uppercase
const HONORIFICS = new Set(['NSND', 'NSƯT', 'NGND', 'NGƯT', 'GS', 'PGS', 'TS']);

// Helper function to convert UPPERCASE text to Title Case
function toTitleCase(str: string): string {
  // Names already typed in mixed case are kept as entered
  if (str !== str.toUpperCase()) return str;
  return str
    .split(' ')
    .map(word => HONORIFICS.has(word.replace(/[.,]/g, ''))
      ? word
      : word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

// Helper function to get initials from name
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  // Get first letter of first word and last word
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

// Lotus/Sen flower image component
function LotusIcon({ size = '100px' }: { size?: string; color?: string; opacity?: number }) {
  return (
    <img 
      src={lotusImage} 
      alt="Lotus flower"
      style={{
        width: size,
        height: 'auto',
        objectFit: 'contain',
        opacity: 0.85
      }}
    />
  );
}

// Component for avatar with fallback
function AvatarImage({
  src,
  alt,
  style,
  className,
  onError
}: {
  src?: string;
  alt: string;
  style?: React.CSSProperties;
  className?: string;
  onError?: () => void;
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const initials = getInitials(alt);
  const shouldShowFallback = !src || hasError || src.trim() === '';

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  if (shouldShowFallback) {
    return (
      <div
        style={{
          ...style,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #FFFEF9 0%, #FFF9ED 50%, #FFF5E6 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}
        className={className}
      >
        {/* Background lotus image - fitted and faded */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.25
          }}
        >
          <img 
            src={lotusImage} 
            alt="Lotus"
            style={{
              width: '85%',
              height: '85%',
              objectFit: 'contain'
            }}
          />
        </div>
        
        {/* Subtle radial gradient overlay */}
        <div
          style={{
            position: 'absolute',
            width: '80%',
            height: '80%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(197,160,89,0.08) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1
          }}
        />
      </div>
    );
  }

  return (
    <>
      <img
        src={src}
        alt={alt}
        style={{
          ...style,
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out'
        }}
        className={className}
        onError={handleError}
        onLoad={() => setIsLoaded(true)}
      />
      {!isLoaded && (
        <div
          style={{
            ...style,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #FFFEF9 0%, #FFF9ED 50%, #FFF5E6 100%)',
            overflow: 'hidden'
          }}
          className={className}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.25
            }}
          >
            <img 
              src={lotusImage} 
              alt="Lotus"
              style={{
                width: '85%',
                height: '85%',
                objectFit: 'contain'
              }}
            />
          </div>
          <div
            style={{
              position: 'absolute',
              width: '80%',
              height: '80%',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(197,160,89,0.08) 0%, transparent 70%)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1
            }}
          />
        </div>
      )}
    </>
  );
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
  adminMode = false,
  standeeMode = false,
  staticMode = false,
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
  adminMode?: boolean;
  standeeMode?: boolean;
  staticMode?: boolean;
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

  // STANDEE MODE - A4 Print Layout (Ratio 1:1.41)
  if (standeeMode) {
    return (
      <div
        className="memorial-profile-standee relative flex flex-col"
        style={{
          fontFamily: "'Inter', sans-serif",
          width: '794px', // A4 width at 96 DPI
          height: '1123px', // A4 height at 96 DPI
          margin: '0',
          backgroundColor: '#FEF9E7', // Exact Cream from reference
          overflow: 'hidden',
          color: '#1e3a5f'
        }}
      >
        {/* Background Gradient */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, #FEF9E7 0%, #FFFDF5 60%, #FEF9E7 100%)',
            zIndex: 0
          }}
        />

        {/* Brand Header */}
        <div style={{ position: 'relative', zIndex: 10, padding: '36px 0 10px', textAlign: 'center' }}>
          <div style={{
            fontSize: '34px', // Increased size as requested
            fontWeight: 900,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#C5A059',
            textShadow: '0 2px 4px rgba(0,0,0,0.15)',
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            HOA VIÊN BÌNH DƯƠNG
          </div>
        </div>

        {/* Main Content Container - Flex Column */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          padding: '0 48px 40px 48px' // Bottom padding ensures space
        }}>

          {/* Profile Header */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px', flexShrink: 0 }}>
            <div style={{ position: 'relative', width: '240px', height: '300px', marginBottom: '20px' }}>
              <AvatarImage
                src={profile.avatarUrl}
                alt={profile.name}
                style={{
                  width: '240px',
                  height: '300px',
                  objectFit: 'cover',
                  borderRadius: '16px',
                  border: `4px solid #C5A059`,
                  boxShadow: '0 12px 30px rgba(0,0,0,0.1)',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>
            <h1 style={{
              fontSize: '44px',
              fontWeight: 900,
              color: '#1e3a5f',
              textAlign: 'center',
              marginBottom: '8px',
              textTransform: 'uppercase',
              lineHeight: 1.1
            }}>
              {profile.name}
            </h1>
            <div style={{
              fontSize: '24px',
              color: '#C5A059',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '8px'
            }}>
              <Calendar style={{ width: '24px', height: '24px', color: '#C5A059' }} />
              {years}
            </div>
            <div style={{
              fontSize: '15px',
              fontStyle: 'italic',
              color: '#64748b',
              textAlign: 'center',
              maxWidth: '80%'
            }}>
              {profile.name} {profile.isBuried ? 'được' : 'sẽ được'} an nghỉ tại Đường Nghệ sĩ - Hoa Viên Bình Dương
            </div>
          </div>

          {/* Biography Card - Scaled to content */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '24px',
            padding: '24px 24px', // Increased top padding
            boxShadow: '0 4px 20px rgba(0,0,0,0.01)',
            flex: 'initial', // Ensure no growing
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            marginBottom: '16px',
            maxHeight: '240px', // Added maxHeight
            position: 'relative'
          }}>
            <h2 style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#1e3a5f',
              textAlign: 'center',
              borderBottom: `2px solid #C5A059`,
              paddingBottom: '8px',
              marginBottom: '16px',
              display: 'inline-block',
              margin: '0 auto 16px auto',
              position: 'relative',
              zIndex: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              paddingLeft: '12px',
              paddingRight: '12px'
            }}>
              Tiểu sử & Cuộc đời
            </h2>

            <div
              className="prose prose-sm max-w-none"
              style={{
                fontSize: '15px',
                lineHeight: 1.6,
                color: '#334155',
                textAlign: 'justify',
                overflow: 'hidden',
                position: 'relative',
                zIndex: 1
              }}
            >
              <div
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(profile.biography) }}
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 6, // Reduced lines
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              />
            </div>
          </div>

          {/* QR Codes Footer - Compact & Anchored Bottom */}
          <div style={{
            marginTop: '16px', // Push to bottom if extra space
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '20px 30px', // Balanced padding
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
            flexShrink: 0
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 800,
              color: '#1e3a5f',
              textAlign: 'center',
              borderBottom: `1px solid #C5A059`,
              paddingBottom: '6px',
              marginBottom: '16px',
              display: 'table',
              margin: '0 auto 16px auto'
            }}>
              Sổ Tang & Thông Tin
            </h2>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '30px'
            }}>
              {/* Left QR */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ fontWeight: 700, color: '#1e3a5f', fontSize: '13px', marginBottom: '4px' }}>Gửi lời chia buồn</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>Quét để gửi lời chia buồn</div>
                <div style={{ background: 'white', padding: '4px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <QRCodeSVG value={publicUrl} size={80} level="M" fgColor="#1e3a5f" />
                </div>
              </div>

              {/* Divider */}
              <div style={{ width: '1px', height: '60px', backgroundColor: '#e2e8f0' }}></div>

              {/* Right QR */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ fontWeight: 700, color: '#1e3a5f', fontSize: '13px', marginBottom: '4px' }}>Kết nối với Hoa Viên</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>Quét mã QR để nhận khuyến mãi</div>
                <div style={{ background: 'white', padding: '4px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <QRCodeSVG value="https://cphaco.vn" size={80} level="M" fgColor="#1e3a5f" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

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
            <div className="float-kiosk" style={{ marginBottom: '24px', position: 'relative' }}>
              <AvatarImage
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

  // ADMIN MODE - Professional Admin Interface (1080x1920 Portrait)
  if (adminMode) {
    return (
      <div
        className="memorial-profile-admin relative"
        style={{
          fontFamily: "'Inter', sans-serif",
          width: '1080px',
          height: '1920px',
          maxHeight: '1920px',
          minHeight: '1920px',
          overflow: 'hidden',
          position: 'relative',
          background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)'
        }}
      >
        {/* Admin Header */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '80px',
            backgroundColor: NAVY_PRIMARY,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            zIndex: 20
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${GOLD_ACCENT}, #D4AF37)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '20px',
                fontWeight: 700
              }}
            >
              A
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                Admin Dashboard
              </h1>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                Memorial Profile Management
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: `${GOLD_ACCENT}20`,
                border: `1px solid ${GOLD_ACCENT}`,
                color: GOLD_ACCENT,
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              Settings
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div
          style={{
            position: 'absolute',
            top: '80px',
            left: 0,
            right: 0,
            bottom: 0,
            padding: '24px',
            overflow: 'auto'
          }}
        >
          {/* Profile Overview Card */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              border: '1px solid rgba(226, 232, 240, 0.8)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
              <div style={{ position: 'relative' }}>
                <AvatarImage
                  src={profile.avatarUrl}
                  alt={profile.name}
                  style={{
                    width: '80px',
                    height: '100px',
                    objectFit: 'cover',
                    borderRadius: '12px',
                    border: `3px solid ${GOLD_ACCENT}`
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '28px', fontWeight: 900, color: NAVY_PRIMARY, margin: '0 0 8px 0' }}>
                  {profile.name}
                </h2>
                <p style={{ fontSize: '16px', color: GOLD_ACCENT, fontWeight: 600, margin: '0 0 8px 0' }}>
                  {years}
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    backgroundColor: `${GOLD_ACCENT}15`,
                    color: GOLD_ACCENT,
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    {tributes.length} Tributes
                  </span>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    backgroundColor: `${NAVY_PRIMARY}15`,
                    color: NAVY_PRIMARY,
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    {photos.length} Photos
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid rgba(226, 232, 240, 0.8)'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', margin: '0 0 8px 0' }}>
                Total Tributes
              </h3>
              <p style={{ fontSize: '32px', fontWeight: 900, color: NAVY_PRIMARY, margin: 0 }}>
                {tributes.length}
              </p>
            </div>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid rgba(226, 232, 240, 0.8)'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', margin: '0 0 8px 0' }}>
                Photo Gallery
              </h3>
              <p style={{ fontSize: '32px', fontWeight: 900, color: GOLD_ACCENT, margin: 0 }}>
                {photos.length}
              </p>
            </div>
          </div>

          {/* Recent Tributes */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              border: '1px solid rgba(226, 232, 240, 0.8)'
            }}
          >
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: NAVY_PRIMARY, marginBottom: '16px' }}>
              Recent Tributes
            </h3>
            <div style={{ maxHeight: '400px', overflow: 'auto' }}>
              {tributes.slice(0, 6).map((t) => (
                <div
                  key={t.id}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    backgroundColor: '#f8fafc',
                    marginBottom: '12px',
                    border: '1px solid rgba(226, 232, 240, 0.5)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${GOLD_ACCENT}, #D4AF37)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontSize: '14px',
                        fontWeight: 700
                      }}
                    >
                      {t.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '16px', fontWeight: 600, color: NAVY_PRIMARY, margin: 0 }}>
                        {t.name}
                      </p>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                        {t.date}
                      </p>
                    </div>
                  </div>
                  <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                    {t.message.length > 120 ? t.message.slice(0, 120) + '...' : t.message}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* QR Code Section */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              border: '1px solid rgba(226, 232, 240, 0.8)'
            }}
          >
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: NAVY_PRIMARY, marginBottom: '16px' }}>
              QR Code Access
            </h3>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '32px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '12px' }}>
                  <QRCodeSVG value={publicUrl} size={120} level="H" fgColor={NAVY_PRIMARY} />
                </div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: NAVY_PRIMARY, margin: 0 }}>
                  Memorial Profile
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '12px' }}>
                  <QRCodeSVG value="https://cphaco.vn" size={120} level="H" fgColor={NAVY_PRIMARY} />
                </div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: NAVY_PRIMARY, margin: 0 }}>
                  CPHACO Homepage
                </p>
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
              fontSize: '52px',
              fontWeight: 900,
              letterSpacing: '4px',
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
          <div className="float-slide" style={{ marginBottom: '24px', position: 'relative' }}>
            <AvatarImage
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
            <strong>{toTitleCase(profile.name)}</strong> sẽ được an nghỉ tại <strong> Hoa Viên Bình Dương</strong>
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

        {/* ============ SECTION 2: BIOGRAPHY - 567px ============ */}
        <div
          style={{
            position: 'absolute',
            top: '672px', // Starts after header
            left: 0,
            right: 0,
            height: '567px',
            padding: '20px 40px 16px',
            overflow: 'hidden',
            zIndex: 10
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.96)',
              borderRadius: '28px',
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
            <h2
              style={{
                fontSize: '26px',
                fontWeight: 900,
                color: NAVY_PRIMARY,
                marginBottom: '12px',
                textAlign: 'center',
                letterSpacing: '-0.5px',
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

            {/* Auto-scrolling Biography with strong gradient mask OR Static content for screenshot */}
            {staticMode ? (
              <div 
                className="prose prose-lg max-w-none"
                style={{ 
                  flex: 1, 
                  overflow: 'hidden', 
                  fontSize: '20px',
                  lineHeight: 1.7,
                  color: '#334155',
                  paddingTop: '8px'
                }}
              >
                <div
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(profile.biography) }}
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 14,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                />
              </div>
            ) : (
              <div className="bio-scroll-mask" style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                <BiographyScroll
                  biography={profile.biography}
                  className="h-full"
                  seamlessLoop={true}
                  pauseOnHover={false}
                />
              </div>
            )}
          </div>
        </div>

        {/* Divider between Bio and Footer */}
        <div
          style={{
            position: 'absolute',
            top: '1219px',
            left: '80px',
            right: '80px',
            height: '2px',
            background: `linear-gradient(90deg, transparent 0%, ${GOLD_ACCENT}50 30%, ${GOLD_ACCENT}50 70%, transparent 100%)`,
            zIndex: 15
          }}
        />

        {/* ============ SECTION 3: FOOTER - 701px ============ */}
        <div
          style={{
            position: 'absolute',
            top: '1219px',
            left: 0,
            right: 0,
            height: '701px',
            padding: '20px 40px 24px',
            overflow: 'hidden',
            zIndex: 10
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.96)',
              borderRadius: '28px',
              padding: '24px 36px 20px',
              boxShadow: '0 12px 48px rgba(0,0,0,0.07)',
              border: `2px solid rgba(197, 160, 89, 0.3)`,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <h2
              style={{
                fontSize: '30px',
                fontWeight: 900,
                color: NAVY_PRIMARY,
                marginBottom: '20px',
                textAlign: 'center',
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
                borderRadius: '28px',
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
                    Gửi lời chia buồn
                  </h3>
                  <p style={{ fontSize: '16px', color: '#64748b', margin: 0 }}>
                    Quét để gửi lời chia buồn
                  </p>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '20px', boxShadow: '0 6px 16px rgba(0,0,0,0.12)' }}>
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
                    Quét mã QR để nhận khuyến mãi
                  </p>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '20px', boxShadow: '0 6px 16px rgba(0,0,0,0.12)' }}>
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

            {/* Messages Grid - 2 messages for static image export */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '24px',
                flex: 1
              }}
            >
              {tributes.slice(0, 2).map((t) => (
                <div
                  key={t.id}
                  style={{
                    padding: '24px 28px',
                    borderRadius: '32px',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start'
                  }}
                >
                  {/* Header: Avatar + Name/Date */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
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
                      <p style={{
                        fontSize: '20px',
                        fontWeight: 700,
                        color: NAVY_PRIMARY,
                        margin: 0,
                        lineHeight: 1.2,
                        wordBreak: 'break-word'
                      }}>
                        {t.name}
                      </p>
                      <p style={{ fontSize: '15px', color: GOLD_ACCENT, margin: '4px 0 0 0', fontWeight: 500 }}>
                        {t.date}
                      </p>
                    </div>
                  </div>
                  {/* Message Body - full content, no truncation */}
                  <p style={{
                    fontSize: '18px',
                    color: '#475569',
                    lineHeight: 1.6,
                    margin: 0,
                    wordBreak: 'break-word'
                  }}>
                    {t.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // NORMAL MODE - Responsive Design for PC, Tablet, Mobile
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

      {/* Responsive Animation Styles */}
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
        
        /* Responsive breakpoints */
        @media (max-width: 640px) {
          .mobile-stack { flex-direction: column; }
          .mobile-full { width: 100%; }
          .mobile-text-sm { font-size: 14px; }
          .mobile-p-4 { padding: 16px; }
        }
        
        @media (min-width: 641px) and (max-width: 1024px) {
          .tablet-grid-2 { grid-template-columns: repeat(2, 1fr); }
          .tablet-text-base { font-size: 16px; }
        }
        
        @media (min-width: 1025px) {
          .desktop-grid-3 { grid-template-columns: repeat(3, 1fr); }
          .desktop-max-w-6xl { max-width: 72rem; }
        }
      `}</style>

      {/* Main Content Wrapper - Responsive Container */}
      <div
        className="relative z-10 flex flex-col w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-4 sm:py-6 lg:py-8"
        style={{
          zIndex: 2,
          maxWidth: 'min(100vw - 2rem, 1200px)' // Responsive max width
        }}
      >
        {/* ============ 1. RESPONSIVE HEADER - Profile + Name + Dates ============ */}
        <div
          className="flex flex-col items-center text-center"
          style={{
            marginBottom: 'clamp(16px, 4vw, 32px)',
            padding: '0 clamp(8px, 2vw, 16px)'
          }}
        >
          {/* Brand Header */}
          <div
            style={{
              fontSize: 'clamp(18px, 5vw, 42px)',
              fontWeight: 900,
              letterSpacing: 'clamp(1px, 0.3vw, 6px)',
              textTransform: 'uppercase',
              color: GOLD_ACCENT,
              textShadow: '0 2px 4px rgba(0,0,0,0.15)',
              marginBottom: 'clamp(20px, 4vw, 32px)',
              fontFamily: "'Playfair Display', Georgia, serif",
              whiteSpace: 'nowrap'
            }}
          >
            HOA VIÊN BÌNH DƯƠNG
          </div>

          {/* Profile Picture - Responsive Sizes */}
          <div
            className="float-normal cursor-pointer mb-4 sm:mb-6"
            onClick={() => setSelectedPhoto({ id: 'avatar', url: profile.avatarUrl || '', caption: profile.name, display_order: null })}
            style={{ position: 'relative' }}
          >
            <AvatarImage
              src={profile.avatarUrl}
              alt={profile.name}
              style={{
                width: 'clamp(120px, 20vw, 200px)',
                height: 'clamp(150px, 25vw, 250px)',
                objectFit: 'cover',
                borderRadius: 'clamp(12px, 2vw, 20px)',
                border: `clamp(3px, 0.5vw, 5px) solid ${GOLD_ACCENT}`,
                boxShadow: '0 clamp(8px, 2vw, 20px) clamp(20px, 4vw, 40px) rgba(0,0,0,0.15)',
                transition: 'transform 0.3s ease'
              }}
              className="hover:scale-105"
            />
          </div>

          {/* Name - Responsive Typography */}
          <h1
            style={{
              fontSize: 'clamp(24px, 6vw, 48px)',
              fontWeight: 900,
              color: NAVY_PRIMARY,
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              marginBottom: 'clamp(8px, 2vw, 16px)',
              lineHeight: 1.1
            }}
          >
            {profile.name}
          </h1>

          {/* Dates - Responsive */}
          <div
            style={{
              fontSize: 'clamp(16px, 4vw, 24px)',
              color: GOLD_ACCENT,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(8px, 2vw, 12px)',
              marginBottom: 'clamp(8px, 2vw, 16px)'
            }}
          >
            <Calendar style={{ width: 'clamp(20px, 4vw, 28px)', height: 'clamp(20px, 4vw, 28px)' }} />
            {years}
          </div>

          {/* Resting Place - Responsive */}
          <div
            style={{
              textAlign: 'center',
              fontSize: 'clamp(14px, 3vw, 18px)',
              fontStyle: 'italic',
              color: '#555555',
              letterSpacing: '0.3px',
              lineHeight: 1.4
            }}
          >
            <strong>{toTitleCase(profile.name)}</strong> {profile.isBuried ? 'đang' : 'sẽ được'} an nghỉ tại <strong>Hoa Viên Bình Dương</strong>
          </div>
        </div>

        {/* Responsive Divider */}
        <div
          style={{
            height: '2px',
            background: `linear-gradient(90deg, transparent 5%, ${GOLD_ACCENT} 25%, ${GOLD_ACCENT} 75%, transparent 95%)`,
            margin: '0 clamp(16px, 4vw, 64px) clamp(16px, 4vw, 32px)'
          }}
        />

        {/* ============ 2. RESPONSIVE BIOGRAPHY SECTION ============ */}
        <div
          className="card-hover transition-all duration-300 mb-6"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
            borderRadius: 'clamp(16px, 3vw, 24px)',
            padding: 'clamp(20px, 5vw, 40px)',
            boxShadow: '0 clamp(8px, 2vw, 16px) clamp(24px, 6vw, 48px) rgba(0,0,0,0.07)',
            border: `2px solid rgba(197, 160, 89, 0.3)`,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative corners */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 'clamp(40px, 8vw, 80px)',
            height: 'clamp(40px, 8vw, 80px)',
            background: `linear-gradient(135deg, ${GOLD_ACCENT}20, transparent)`,
            borderTopLeftRadius: 'clamp(16px, 3vw, 24px)'
          }} />
          <div style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 'clamp(40px, 8vw, 80px)',
            height: 'clamp(40px, 8vw, 80px)',
            background: `linear-gradient(315deg, ${GOLD_ACCENT}20, transparent)`,
            borderBottomRightRadius: 'clamp(16px, 3vw, 24px)'
          }} />

          <h2
            style={{
              fontSize: 'clamp(20px, 5vw, 32px)',
              fontWeight: 900,
              color: NAVY_PRIMARY,
              textAlign: 'center',
              marginBottom: 'clamp(16px, 4vw, 24px)',
              position: 'relative'
            }}
          >
            <span style={{
              borderBottom: `3px solid ${GOLD_ACCENT}`,
              paddingBottom: '8px',
              display: 'inline-block'
            }}>
              Tiểu sử & Cuộc đời
            </span>
          </h2>
          <ExpandableText
            text={profile.biography}
            maxLines={8} // Show reasonable amount of text before truncating
            isHtml={true}
            textClassName="text-gray-700 leading-relaxed"
            style={{
              fontSize: 'clamp(14px, 3.5vw, 18px)'
            }}
          />
        </div>

        {/* ============ 2.5. DIRECTIONS QR SECTION ============ */}
        {profile.mapsUrl && (
          <div
            className="card-hover transition-all duration-300 mb-6"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.96)',
              borderRadius: 'clamp(16px, 3vw, 24px)',
              padding: 'clamp(20px, 5vw, 40px)',
              boxShadow: '0 clamp(8px, 2vw, 16px) clamp(24px, 6vw, 48px) rgba(0,0,0,0.07)',
              border: `2px solid rgba(197, 160, 89, 0.3)`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <h2
              style={{
                fontSize: 'clamp(18px, 4.5vw, 28px)',
                fontWeight: 900,
                color: NAVY_PRIMARY,
                textAlign: 'center',
                marginBottom: 'clamp(16px, 4vw, 24px)'
              }}
            >
              <span style={{
                borderBottom: `3px solid ${GOLD_ACCENT}`,
                paddingBottom: '8px',
                display: 'inline-block'
              }}>
                Vị trí An Nghỉ
              </span>
            </h2>

            <div style={{
              backgroundColor: '#ffffff',
              padding: '16px',
              borderRadius: '16px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              marginBottom: '16px',
              border: `1px solid ${GOLD_ACCENT}40`
            }}>
              <QRCodeSVG
                value={profile.mapsUrl}
                size={160}
                level="M"
                fgColor={NAVY_PRIMARY}
              />
            </div>

            <a
              href={profile.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginTop: '20px',
                padding: '10px 24px',
                borderRadius: '99px',
                backgroundColor: `${GOLD_ACCENT}15`,
                color: NAVY_PRIMARY,
                fontWeight: 700,
                fontSize: '14px',
                textDecoration: 'none',
                transition: 'background-color 0.2s',
                border: `1px solid ${GOLD_ACCENT}40`
              }}
            >
              Mở bản đồ
            </a>
          </div>
        )}

        {/* ============ 3. RESPONSIVE CAREER SECTION ============ */}
        {hasCareerData && (
          <div
            className="card-hover transition-all duration-300 mb-6"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              borderRadius: 'clamp(16px, 3vw, 24px)',
              padding: 'clamp(20px, 5vw, 40px)',
              boxShadow: '0 clamp(6px, 1.5vw, 12px) clamp(20px, 5vw, 40px) rgba(0,0,0,0.05)',
              border: `1px solid rgba(197, 160, 89, 0.2)`
            }}
          >
            <h2
              style={{
                fontSize: 'clamp(18px, 4.5vw, 28px)',
                fontWeight: 900,
                color: NAVY_PRIMARY,
                textAlign: 'center',
                marginBottom: 'clamp(16px, 4vw, 24px)'
              }}
            >
              Quá trình công tác
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                gap: 'clamp(12px, 3vw, 20px)'
              }}
            >
              {profile.roles.map((role, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'clamp(8px, 2vw, 12px)',
                    padding: 'clamp(12px, 3vw, 20px)',
                    borderRadius: 'clamp(12px, 2.5vw, 16px)',
                    backgroundColor: 'rgba(253, 252, 248, 0.8)',
                    border: `1px solid rgba(197, 160, 89, 0.15)`
                  }}
                >
                  <Briefcase
                    style={{
                      width: 'clamp(18px, 4vw, 24px)',
                      height: 'clamp(18px, 4vw, 24px)',
                      color: GOLD_ACCENT,
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  />
                  <p style={{
                    fontSize: 'clamp(14px, 3.5vw, 18px)',
                    color: '#374151',
                    lineHeight: 1.5,
                    margin: 0
                  }}>
                    {role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============ 4. RESPONSIVE TRIBUTE FORM ============ */}
        <div
          className="card-hover transition-all duration-300 mb-6"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
            borderRadius: 'clamp(16px, 3vw, 24px)',
            padding: 'clamp(20px, 5vw, 40px)',
            boxShadow: '0 clamp(8px, 2vw, 16px) clamp(24px, 6vw, 48px) rgba(0,0,0,0.07)',
            border: `2px solid rgba(197, 160, 89, 0.3)`
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(18px, 4.5vw, 28px)',
              fontWeight: 900,
              color: NAVY_PRIMARY,
              textAlign: 'center',
              marginBottom: 'clamp(16px, 4vw, 24px)'
            }}
          >
            <span style={{
              borderBottom: `3px solid ${GOLD_ACCENT}`,
              paddingBottom: '8px',
              display: 'inline-block'
            }}>
              Gửi lời chia buồn
            </span>
          </h2>
          <form onSubmit={onSubmitTribute}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
                gap: 'clamp(12px, 3vw, 20px)',
                marginBottom: 'clamp(16px, 4vw, 24px)'
              }}
            >
              <input
                type="text"
                placeholder="Họ và tên"
                maxLength={COMMENT_LIMITS.name}
                value={formData.name}
                onChange={(e) => onChangeForm({ name: e.target.value })}
                style={{
                  width: '100%',
                  padding: 'clamp(12px, 3vw, 16px)',
                  borderRadius: 'clamp(12px, 2.5vw, 16px)',
                  border: '1px solid rgba(197, 160, 89, 0.3)',
                  backgroundColor: '#FDFCF8',
                  fontSize: '16px', // below 16px iOS Safari zooms the page on focus
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = GOLD_ACCENT}
                onBlur={(e) => e.target.style.borderColor = 'rgba(197, 160, 89, 0.3)'}
              />
              <input
                type="tel"
                placeholder="Số điện thoại (không bắt buộc)"
                maxLength={COMMENT_LIMITS.phone}
                value={formData.phone}
                onChange={(e) => onChangeForm({ phone: e.target.value })}
                style={{
                  width: '100%',
                  padding: 'clamp(12px, 3vw, 16px)',
                  borderRadius: 'clamp(12px, 2.5vw, 16px)',
                  border: '1px solid rgba(197, 160, 89, 0.3)',
                  backgroundColor: '#FDFCF8',
                  fontSize: '16px', // below 16px iOS Safari zooms the page on focus
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = GOLD_ACCENT}
                onBlur={(e) => e.target.style.borderColor = 'rgba(197, 160, 89, 0.3)'}
              />
            </div>
            <textarea
              placeholder="Lời chia buồn..."
              maxLength={COMMENT_LIMITS.message}
              value={formData.message}
              onChange={(e) => onChangeForm({ message: e.target.value })}
              rows={4}
              style={{
                width: '100%',
                padding: 'clamp(12px, 3vw, 16px)',
                borderRadius: 'clamp(12px, 2.5vw, 16px)',
                border: '1px solid rgba(197, 160, 89, 0.3)',
                backgroundColor: '#FDFCF8',
                fontSize: '16px',
                outline: 'none',
                resize: 'vertical',
                marginBottom: 'clamp(16px, 4vw, 24px)',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = GOLD_ACCENT}
              onBlur={(e) => e.target.style.borderColor = 'rgba(197, 160, 89, 0.3)'}
            />
            <button
              type="submit"
              className="btn-hover transition-all duration-300"
              style={{
                width: '100%',
                padding: 'clamp(12px, 3vw, 16px)',
                borderRadius: 'clamp(12px, 2.5vw, 16px)',
                backgroundColor: NAVY_PRIMARY,
                color: '#ffffff',
                fontSize: 'clamp(14px, 3.5vw, 18px)',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <PenLine style={{ width: 'clamp(16px, 4vw, 20px)', height: 'clamp(16px, 4vw, 20px)' }} />
              Gửi lời chia buồn
            </button>
          </form>
        </div>

        {/* ============ 5. RESPONSIVE TRIBUTES LIST ============ */}
        <div
          className="card-hover transition-all duration-300 mb-8"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            borderRadius: 'clamp(16px, 3vw, 24px)',
            padding: 'clamp(20px, 5vw, 40px)',
            boxShadow: '0 clamp(6px, 1.5vw, 12px) clamp(20px, 5vw, 40px) rgba(0,0,0,0.05)',
            border: `1px solid rgba(197, 160, 89, 0.2)`
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'clamp(8px, 2vw, 16px)',
            marginBottom: 'clamp(16px, 4vw, 24px)'
          }}>
            <h2
              style={{
                fontSize: 'clamp(18px, 4.5vw, 28px)',
                fontWeight: 900,
                color: NAVY_PRIMARY,
                margin: 0
              }}
            >
              Lời chia buồn
            </h2>
            <span
              style={{
                fontSize: 'clamp(12px, 3vw, 16px)',
                padding: 'clamp(6px, 1.5vw, 12px) clamp(12px, 3vw, 20px)',
                borderRadius: '9999px',
                backgroundColor: `${GOLD_ACCENT}18`,
                color: GOLD_ACCENT,
                fontWeight: 600,
                border: `1px solid ${GOLD_ACCENT}30`
              }}
            >
              {tributes.length} lời nhắn
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
              gap: 'clamp(12px, 3vw, 20px)'
            }}
          >
            {tributes.map((t) => (
              <div
                key={t.id}
                className="transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                style={{
                  padding: 'clamp(16px, 4vw, 24px)',
                  borderRadius: 'clamp(12px, 2.5vw, 16px)',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                  border: `1px solid rgba(226, 232, 240, 0.8)`
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'clamp(8px, 2vw, 12px)',
                  marginBottom: 'clamp(8px, 2vw, 12px)'
                }}>
                  <div
                    style={{
                      width: 'clamp(36px, 8vw, 48px)',
                      height: 'clamp(36px, 8vw, 48px)',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${GOLD_ACCENT}, #D4AF37)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontSize: 'clamp(14px, 3.5vw, 18px)',
                      fontWeight: 700,
                      boxShadow: '0 4px 12px rgba(197, 160, 89, 0.3)',
                      flexShrink: 0
                    }}
                  >
                    {t.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 'clamp(14px, 3.5vw, 18px)',
                      fontWeight: 700,
                      color: NAVY_PRIMARY,
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {t.name}
                    </p>
                    <p style={{
                      fontSize: 'clamp(12px, 3vw, 14px)',
                      color: '#94a3b8',
                      margin: 0
                    }}>
                      {t.date}
                    </p>
                  </div>
                </div>
                <div
                  className="text-slate-600 leading-relaxed"
                  style={{
                    fontSize: 'clamp(13px, 3.2vw, 16px)'
                  }}
                >
                  {t.message}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Responsive Share Button */}
        <button
          onClick={onOpenShare}
          aria-label="Chia sẻ hồ sơ"
          className="btn-hover transition-all duration-300"
          style={{
            position: 'fixed',
            bottom: 'clamp(16px, 4vw, 24px)',
            right: 'clamp(16px, 4vw, 24px)',
            width: 'clamp(48px, 12vw, 64px)',
            height: 'clamp(48px, 12vw, 64px)',
            borderRadius: '50%',
            backgroundColor: NAVY_PRIMARY,
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(30, 58, 95, 0.3)',
            zIndex: 1000
          }}
        >
          <Share2 style={{ width: 'clamp(20px, 5vw, 28px)', height: 'clamp(20px, 5vw, 28px)' }} />
        </button>
      </div>

      {/* Responsive Photo Modal */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent
          style={{
            maxWidth: 'min(90vw, 800px)',
            padding: 0,
            backgroundColor: 'transparent',
            border: 'none',
            boxShadow: 'none'
          }}
        >
          {selectedPhoto && (
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.caption || ''}
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: 'clamp(8px, 2vw, 16px)'
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}