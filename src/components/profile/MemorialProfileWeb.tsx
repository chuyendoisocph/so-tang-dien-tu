import { Share2, PenLine, Calendar, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

type MemorialProfile = {
  id: string;
  name: string;
  dateRange: string;
  avatarUrl: string;
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
  formData,
  onChangeForm,
  onSubmitTribute,
  onOpenShare,
  slideshowMode = false,
  kioskMode = false,
}: {
  profile: MemorialProfile;
  tributes: Tribute[];
  formData: { name: string; phone: string; message: string };
  onChangeForm: (patch: Partial<{ name: string; phone: string; message: string }>) => void;
  onSubmitTribute: (e: React.FormEvent) => void;
  onOpenShare: () => void;
  slideshowMode?: boolean;
  kioskMode?: boolean;
}) {
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

  // KIOSK MODE - Optimized for 1080x1920 Vertical Advertising Standee
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
          overflow: 'hidden',
          backgroundColor: '#FDFCF8'
        }}
      >
        {/* Kiosk-specific styles with Ken Burns effect */}
        <style>{`
          @keyframes float-kiosk {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          .float-kiosk {
            animation: float-kiosk 5s ease-in-out infinite;
          }
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 30px rgba(14, 165, 233, 0.4); }
            50% { box-shadow: 0 0 50px rgba(14, 165, 233, 0.6); }
          }
          .pulse-glow {
            animation: pulse-glow 3s ease-in-out infinite;
          }
          @keyframes ken-burns {
            0% { transform: scale(1); }
            100% { transform: scale(1.1); }
          }
          .ken-burns-bg {
            animation: ken-burns 20s ease-in-out infinite alternate;
          }
        `}</style>

        {/* ============ HERO SECTION - 38% of screen with Ken Burns ============ */}
        <div
          style={{
            position: 'relative',
            height: '730px', /* ~38% of 1920px */
            overflow: 'hidden'
          }}
        >
          {/* Background with Ken Burns animation */}
          <div
            className="ken-burns-bg"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'url("https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=1920&h=1200&fit=crop")',
              backgroundPosition: 'center top',
              backgroundSize: 'cover',
              transformOrigin: 'center center'
            }}
          />

          {/* Gradient overlay for seamless fade */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(
                180deg,
                rgba(15, 30, 50, 0.85) 0%,
                rgba(30, 58, 95, 0.75) 50%,
                rgba(253, 252, 248, 1) 100%
              )`
            }}
          />

          {/* Hero Content */}
          <div
            style={{
              position: 'relative',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: '40px'
            }}
          >
            {/* Large Profile Picture */}
            <div className="float-kiosk" style={{ marginBottom: '24px' }}>
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                style={{
                  width: '340px',
                  height: '420px',
                  objectFit: 'cover',
                  borderRadius: '20px',
                  border: '5px solid #ffffff',
                  boxShadow: '0 30px 70px rgba(0,0,0,0.4)'
                }}
              />
            </div>

            {/* Name - Extra Large for Distance Reading */}
            <h1
              style={{
                fontSize: '68px',
                fontWeight: 800,
                color: '#ffffff',
                textAlign: 'center',
                letterSpacing: '-1px',
                textShadow: '0 4px 24px rgba(0,0,0,0.4)',
                marginBottom: '14px',
                fontFamily: "'Inter', sans-serif"
              }}
            >
              {profile.name}
            </h1>

            {/* Dates - Large */}
            <div
              style={{
                fontSize: '34px',
                color: GOLD_ACCENT,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                textShadow: '0 2px 12px rgba(0,0,0,0.3)'
              }}
            >
              <Calendar style={{ width: '34px', height: '34px' }} />
              {years}
            </div>
          </div>
        </div>

        {/* ============ MAIN CONTENT - Fills remaining space ============ */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '32px 40px 20px',
            gap: hasCareerData ? '20px' : '28px',
            overflow: 'hidden'
          }}
        >
          {/* Biography Card */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              borderRadius: '24px',
              padding: '32px 36px',
              boxShadow: '0 16px 48px rgba(0,0,0,0.06)',
              flex: hasCareerData ? 'none' : 1
            }}
          >
            <h2
              style={{
                fontSize: '34px',
                fontWeight: 700,
                color: NAVY_PRIMARY,
                marginBottom: '18px'
              }}
            >
              Tiểu sử
            </h2>
            <div
              style={{
                fontSize: '23px',
                color: '#475569',
                lineHeight: 1.75
              }}
              dangerouslySetInnerHTML={{ __html: profile.biography }}
            />
          </div>

          {/* Career/Roles Card - CONDITIONAL RENDERING */}
          {hasCareerData && (
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                borderRadius: '24px',
                padding: '32px 36px',
                boxShadow: '0 16px 48px rgba(0,0,0,0.06)'
              }}
            >
              <h2
                style={{
                  fontSize: '34px',
                  fontWeight: 700,
                  color: NAVY_PRIMARY,
                  marginBottom: '18px'
                }}
              >
                Quá trình công tác
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {profile.roles.map((role, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '14px'
                    }}
                  >
                    <div
                      style={{
                        width: '11px',
                        height: '11px',
                        borderRadius: '50%',
                        backgroundColor: GOLD_ACCENT,
                        marginTop: '10px',
                        flexShrink: 0
                      }}
                    />
                    <p style={{ fontSize: '21px', color: '#475569', lineHeight: 1.55 }}>
                      {role}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Guestbook/Tributes Card - Flex grow to fill space */}
          <div
            style={{
              flex: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              borderRadius: '24px',
              padding: '32px 36px',
              boxShadow: '0 16px 48px rgba(0,0,0,0.06)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              minHeight: 0
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h2
                style={{
                  fontSize: '34px',
                  fontWeight: 700,
                  color: NAVY_PRIMARY
                }}
              >
                Lời chia buồn
              </h2>
              <span
                style={{
                  fontSize: '20px',
                  padding: '8px 18px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(241,245,249,0.9)',
                  color: '#64748b',
                  fontWeight: 600
                }}
              >
                {tributes.length} lời nhắn
              </span>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', overflow: 'hidden' }}>
              {tributes.slice(0, hasCareerData ? 3 : 4).map((t) => (
                <div
                  key={t.id}
                  style={{
                    padding: '18px 22px',
                    borderRadius: '16px',
                    backgroundColor: 'rgba(248,250,252,0.9)',
                    border: '1px solid rgba(226,232,240,0.7)',
                    flex: 1
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${SKY_BLUE}, #38bdf8)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontSize: '19px',
                        fontWeight: 700
                      }}
                    >
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p style={{ fontSize: '21px', fontWeight: 600, color: NAVY_PRIMARY }}>
                        {t.name}
                      </p>
                      <p style={{ fontSize: '15px', color: '#94a3b8' }}>
                        {t.date}
                      </p>
                    </div>
                  </div>
                  <p style={{ fontSize: '19px', color: '#475569', lineHeight: 1.65 }}>
                    {t.message}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Full Width Action Buttons */}
          <div style={{ display: 'flex', gap: '18px', flexShrink: 0 }}>
            <button
              onClick={() => (document.getElementById("tributeName") as HTMLInputElement | null)?.focus()}
              className="pulse-glow"
              style={{
                flex: 1,
                height: '76px',
                borderRadius: '20px',
                backgroundColor: SKY_BLUE,
                color: '#ffffff',
                fontSize: '26px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <PenLine style={{ width: '28px', height: '28px', color: GOLD_ACCENT }} />
              Gửi lời chia buồn
            </button>
            <button
              onClick={onOpenShare}
              style={{
                flex: 1,
                height: '76px',
                borderRadius: '20px',
                backgroundColor: 'rgba(255,255,255,0.95)',
                color: NAVY_PRIMARY,
                fontSize: '26px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                border: '3px solid rgba(226,232,240,0.8)',
                cursor: 'pointer'
              }}
            >
              <Share2 style={{ width: '28px', height: '28px', color: GOLD_ACCENT }} />
              Chia sẻ
            </button>
          </div>
        </div>

        {/* ============ FOOTER - QR Code Section (Anchored Bottom) ============ */}
        <div
          style={{
            backgroundColor: NAVY_PRIMARY,
            padding: '28px 40px',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px' }}>
            {/* QR Code - Larger */}
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '14px',
                borderRadius: '18px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.25)'
              }}
            >
              <QRCodeSVG
                value={publicUrl}
                size={180}
                level="H"
                fgColor={NAVY_PRIMARY}
              />
            </div>

            {/* QR Label */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <QrCode style={{ width: '36px', height: '36px', color: GOLD_ACCENT }} />
                <span
                  style={{
                    fontSize: '30px',
                    fontWeight: 700,
                    color: '#ffffff'
                  }}
                >
                  Quét mã QR
                </span>
              </div>
              <p
                style={{
                  fontSize: '22px',
                  color: 'rgba(255,255,255,0.8)',
                  maxWidth: '320px',
                  lineHeight: 1.4
                }}
              >
                để lưu giữ kỷ niệm trên điện thoại của bạn
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SLIDESHOW MODE - MyKeeper Premium Style (Optimized for TV display)
  if (slideshowMode) {
    return (
      <div
        className="min-h-screen"
        style={{
          fontFamily: "'Inter', sans-serif",
          backgroundColor: '#FDFCF8'
        }}
      >
        {/* Floating animation keyframes */}
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
          .float-animation {
            animation: float 4s ease-in-out infinite;
          }
          .btn-hover:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(14, 165, 233, 0.4) !important;
          }
          .btn-outline-hover:hover {
            background-color: rgba(255,255,255,0.9) !important;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08) !important;
          }
        `}</style>

        {/* Banner Image */}
        <div
          className="relative w-full"
          style={{
            height: '28vh',
            minHeight: '180px',
            background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.88), rgba(15, 30, 50, 0.92)), url("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&h=600&fit=crop") center/cover'
          }}
        >
          {/* Soft overlay gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, transparent 50%, #FDFCF8 100%)'
            }}
          />
        </div>

        {/* Main Content Container */}
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6" style={{ marginTop: '-100px' }}>

          {/* Profile Header Card - Glassmorphism */}
          <div
            className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8"
            style={{
              ...cardStyle,
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 15px 50px rgba(0,0,0,0.1)'
            }}
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
              {/* Portrait - Responsive with floating animation */}
              <div
                className="flex-shrink-0 float-animation"
                style={{ marginTop: '-70px' }}
              >
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-[130px] h-[165px] sm:w-[160px] sm:h-[200px] md:w-[180px] md:h-[225px] object-cover"
                  style={{
                    borderRadius: '14px',
                    border: '4px solid #ffffff',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.18)'
                  }}
                />
              </div>

              {/* Name & Info */}
              <div className="flex-1 text-center sm:text-left pb-1 sm:pb-2">
                <h1
                  className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    color: NAVY_PRIMARY,
                    letterSpacing: '-0.5px'
                  }}
                >
                  {profile.name}
                </h1>
                <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-4 text-xs sm:text-sm" style={{ color: '#64748b' }}>
                  <span className="flex items-center gap-1.5 sm:gap-2">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: GOLD_ACCENT }} />
                    {years}
                  </span>
                </div>
              </div>

              {/* Action Buttons - Hidden on mobile, shown sm+ */}
              <div className="hidden sm:flex gap-2 md:gap-3">
                <button
                  className="btn-hover flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold text-xs sm:text-sm transition-all duration-300"
                  style={{
                    backgroundColor: SKY_BLUE,
                    color: '#ffffff',
                    boxShadow: '0 6px 20px rgba(14, 165, 233, 0.35)'
                  }}
                >
                  <PenLine className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: GOLD_ACCENT }} />
                  Gửi lời chia buồn
                </button>
                <button
                  onClick={onOpenShare}
                  className="btn-outline-hover flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold text-xs sm:text-sm transition-all duration-300"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    color: NAVY_PRIMARY,
                    border: '1.5px solid rgba(226,232,240,0.8)'
                  }}
                >
                  <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: GOLD_ACCENT }} />
                  Chia sẻ
                </button>
              </div>
            </div>

            {/* Action Buttons - Mobile only */}
            <div className="flex sm:hidden gap-2 mt-4 justify-center">
              <button
                className="btn-hover flex items-center gap-1.5 px-4 py-2.5 rounded-full font-semibold text-xs transition-all duration-300"
                style={{
                  backgroundColor: SKY_BLUE,
                  color: '#ffffff',
                  boxShadow: '0 4px 15px rgba(14, 165, 233, 0.3)'
                }}
              >
                <PenLine className="w-3.5 h-3.5" style={{ color: GOLD_ACCENT }} />
                Gửi lời chia buồn
              </button>
              <button
                onClick={onOpenShare}
                className="btn-outline-hover flex items-center gap-1.5 px-4 py-2.5 rounded-full font-semibold text-xs transition-all duration-300"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  color: NAVY_PRIMARY,
                  border: '1.5px solid rgba(226,232,240,0.8)'
                }}
              >
                <Share2 className="w-3.5 h-3.5" style={{ color: GOLD_ACCENT }} />
                Chia sẻ
              </button>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="flex flex-col md:flex-row gap-5 sm:gap-6 lg:gap-8">

            {/* Left Column - Sidebar */}
            <div className="w-full md:w-2/5 lg:w-1/3 space-y-4 sm:space-y-6 order-2 md:order-1">

              {/* Work History Card */}
              <div
                className="rounded-xl sm:rounded-2xl overflow-hidden"
                style={cardStyle}
              >
                <div className="p-4 sm:p-5">
                  <h3 className="font-semibold text-xs sm:text-sm mb-3 sm:mb-4" style={{ color: NAVY_PRIMARY }}>
                    Quá trình công tác
                  </h3>
                  <div className="space-y-2 sm:space-y-3">
                    {profile.roles.map((role, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 sm:gap-3"
                      >
                        <div
                          className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mt-1.5 flex-shrink-0"
                          style={{ backgroundColor: GOLD_ACCENT }}
                        />
                        <p className="text-xs sm:text-sm" style={{ color: '#475569', lineHeight: 1.6 }}>
                          {role}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* QR Code Widget - Hidden on mobile */}
              <div
                className="hidden sm:block rounded-xl sm:rounded-2xl p-4 sm:p-5"
                style={cardStyle}
              >
                <div className="flex justify-center">
                  <div
                    className="p-2 sm:p-3 rounded-lg sm:rounded-xl"
                    style={{ backgroundColor: 'rgba(248,250,252,0.8)', border: '1px solid rgba(226,232,240,0.6)' }}
                  >
                    <QRCodeSVG
                      value={publicUrl}
                      className="w-[60px] h-[60px] sm:w-[80px] sm:h-[80px]"
                      level="H"
                      fgColor={NAVY_PRIMARY}
                    />
                  </div>
                </div>
                <p className="text-[10px] sm:text-xs text-center mt-2 sm:mt-3 font-medium" style={{ color: '#94a3b8' }}>
                  Lưu giữ kỷ niệm trên di động
                </p>
              </div>
            </div>

            {/* Right Column - Main Content */}
            <div className="w-full md:w-3/5 lg:w-2/3 space-y-4 sm:space-y-6 order-1 md:order-2">

              {/* Biography Card */}
              <div
                className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8"
                style={cardStyle}
              >
                <h2
                  className="text-base sm:text-lg font-bold mb-4 sm:mb-6"
                  style={{ color: NAVY_PRIMARY }}
                >
                  Tiểu sử & Cuộc đời
                </h2>
                <div
                  className="prose prose-slate max-w-none prose-sm sm:prose-base"
                  style={{
                    color: '#475569',
                    lineHeight: 1.8,
                    fontSize: 'inherit'
                  }}
                  dangerouslySetInnerHTML={{ __html: profile.biography }}
                />
              </div>

              {/* Tributes Card */}
              <div
                className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8"
                style={cardStyle}
              >
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2
                    className="text-base sm:text-lg font-bold"
                    style={{ color: NAVY_PRIMARY }}
                  >
                    Lời chia buồn
                  </h2>
                  <span
                    className="text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-medium"
                    style={{ backgroundColor: 'rgba(241,245,249,0.8)', color: '#64748b' }}
                  >
                    {tributes.length} lời nhắn
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:gap-5">
                  {tributes.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                      style={{
                        backgroundColor: 'rgba(248,250,252,0.8)',
                        border: '1px solid rgba(226,232,240,0.6)'
                      }}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <div
                          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm"
                          style={{
                            backgroundColor: SKY_BLUE,
                            color: '#ffffff'
                          }}
                        >
                          {t.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-xs sm:text-sm" style={{ color: NAVY_PRIMARY }}>
                            {t.name}
                          </p>
                          <p className="text-[10px] sm:text-xs" style={{ color: '#94a3b8' }}>
                            {t.date}
                          </p>
                        </div>
                      </div>
                      <p
                        className="text-xs sm:text-sm"
                        style={{ color: '#475569', lineHeight: 1.7 }}
                      >
                        {t.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom spacing */}
          <div className="h-8 sm:h-12" />
        </div>
      </div>
    );
  }

  // NORMAL MODE - MyKeeper Premium Style (Interactive Web View)
  return (
    <div
      className="min-h-screen"
      style={{
        fontFamily: "'Inter', sans-serif",
        backgroundColor: '#FDFCF8'
      }}
    >
      {/* Floating animation and hover effects */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .float-animation {
          animation: float 4s ease-in-out infinite;
        }
        .btn-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(14, 165, 233, 0.4) !important;
        }
        .btn-outline-hover:hover {
          background-color: rgba(255,255,255,0.95) !important;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08) !important;
        }
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.08) !important;
        }
      `}</style>

      {/* Banner Image */}
      <div
        className="relative w-full"
        style={{
          height: '28vh',
          minHeight: '180px',
          background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.85), rgba(15, 30, 50, 0.88)), url("https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=1920&h=600&fit=crop") center/cover'
        }}
      >
        {/* Soft overlay gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, transparent 40%, #FDFCF8 100%)'
          }}
        />
      </div>

      {/* Main Content Container */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6" style={{ marginTop: '-90px' }}>

        {/* Profile Header Card - Glassmorphism */}
        <div
          className="rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-8 mb-5 sm:mb-8"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 15px 50px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.8)'
          }}
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-5 md:gap-8">
            {/* Portrait - Responsive with floating animation */}
            <div
              className="flex-shrink-0 float-animation"
              style={{ marginTop: '-60px' }}
            >
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-[120px] h-[150px] sm:w-[140px] sm:h-[175px] md:w-[175px] md:h-[220px] object-cover"
                style={{
                  borderRadius: '14px',
                  border: '4px solid #ffffff',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.18)'
                }}
              />
            </div>

            {/* Name & Info */}
            <div className="flex-1 text-center sm:text-left pb-1 sm:pb-2">
              <h1
                className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1.5 sm:mb-2"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  color: NAVY_PRIMARY,
                  letterSpacing: '-0.5px'
                }}
              >
                {profile.name}
              </h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm" style={{ color: '#64748b' }}>
                <span className="flex items-center gap-1.5 sm:gap-2">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: GOLD_ACCENT }} />
                  {profile.dateRange}
                </span>
              </div>
            </div>

            {/* Action Buttons - Desktop/Tablet - Pill shaped */}
            <div className="hidden sm:flex gap-2 md:gap-3">
              <button
                onClick={() => (document.getElementById("tributeName") as HTMLInputElement | null)?.focus()}
                className="btn-hover flex items-center gap-1.5 md:gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold text-xs md:text-sm transition-all duration-300"
                style={{
                  backgroundColor: SKY_BLUE,
                  color: '#ffffff',
                  boxShadow: '0 6px 20px rgba(14, 165, 233, 0.35)'
                }}
              >
                <PenLine className="w-3.5 h-3.5 md:w-4 md:h-4" style={{ color: GOLD_ACCENT }} />
                Gửi lời chia buồn
              </button>
              <button
                onClick={onOpenShare}
                className="btn-outline-hover flex items-center gap-1.5 md:gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold text-xs md:text-sm transition-all duration-300"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.7)',
                  color: NAVY_PRIMARY,
                  border: '1.5px solid rgba(226,232,240,0.8)'
                }}
              >
                <Share2 className="w-3.5 h-3.5 md:w-4 md:h-4" style={{ color: GOLD_ACCENT }} />
                Chia sẻ
              </button>
            </div>
          </div>

          {/* Action Buttons - Mobile only */}
          <div className="flex sm:hidden gap-2 mt-4 justify-center">
            <button
              onClick={() => (document.getElementById("tributeName") as HTMLInputElement | null)?.focus()}
              className="btn-hover flex items-center gap-1.5 px-4 py-2.5 rounded-full font-semibold text-xs transition-all duration-300"
              style={{
                backgroundColor: SKY_BLUE,
                color: '#ffffff',
                boxShadow: '0 4px 15px rgba(14, 165, 233, 0.3)'
              }}
            >
              <PenLine className="w-3.5 h-3.5" style={{ color: GOLD_ACCENT }} />
              Gửi lời chia buồn
            </button>
            <button
              onClick={onOpenShare}
              className="btn-outline-hover flex items-center gap-1.5 px-4 py-2.5 rounded-full font-semibold text-xs transition-all duration-300"
              style={{
                backgroundColor: 'rgba(255,255,255,0.8)',
                color: NAVY_PRIMARY,
                border: '1.5px solid rgba(226,232,240,0.8)'
              }}
            >
              <Share2 className="w-3.5 h-3.5" style={{ color: GOLD_ACCENT }} />
              Chia sẻ
            </button>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 lg:gap-8">

          {/* Left Column - Sidebar */}
          <div className="w-full md:w-2/5 lg:w-1/3 space-y-4 sm:space-y-6 order-2 md:order-1">

            {/* Work History Card */}
            <div
              className="rounded-xl sm:rounded-2xl overflow-hidden card-hover transition-all duration-300"
              style={cardStyle}
            >
              <div className="p-4 sm:p-5">
                <h3 className="font-semibold text-xs sm:text-sm mb-3 sm:mb-4" style={{ color: NAVY_PRIMARY }}>
                  Quá trình công tác
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {profile.roles.map((role, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 sm:gap-3"
                    >
                      <div
                        className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mt-1.5 flex-shrink-0"
                        style={{ backgroundColor: GOLD_ACCENT }}
                      />
                      <p className="text-xs sm:text-sm" style={{ color: '#475569', lineHeight: 1.6 }}>
                        {role}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* QR Code Widget - Hidden on mobile */}
            <div
              className="hidden sm:block rounded-xl sm:rounded-2xl p-4 sm:p-5 card-hover transition-all duration-300"
              style={cardStyle}
            >
              <div className="flex justify-center">
                <div
                  className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl"
                  style={{ backgroundColor: 'rgba(248,250,252,0.8)', border: '1px solid rgba(226,232,240,0.6)' }}
                >
                  <QRCodeSVG
                    value={publicUrl}
                    className="w-[60px] h-[60px] sm:w-[75px] sm:h-[75px]"
                    level="H"
                    fgColor={NAVY_PRIMARY}
                  />
                </div>
              </div>
              <p className="text-[10px] sm:text-xs text-center mt-2 sm:mt-3 font-medium" style={{ color: '#94a3b8' }}>
                Lưu giữ kỷ niệm trên di động
              </p>
            </div>
          </div>

          {/* Right Column - Main Content */}
          <div className="w-full md:w-3/5 lg:w-2/3 space-y-4 sm:space-y-6 order-1 md:order-2">

            {/* Biography Card */}
            <div
              className="rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-7 card-hover transition-all duration-300"
              style={cardStyle}
            >
              <h2
                className="text-base sm:text-lg font-bold mb-4 sm:mb-5"
                style={{ color: NAVY_PRIMARY }}
              >
                Tiểu sử & Cuộc đời
              </h2>
              <div
                className="prose prose-slate max-w-none prose-sm sm:prose-base"
                style={{
                  color: '#475569',
                  lineHeight: 1.8,
                  fontSize: 'inherit'
                }}
                dangerouslySetInnerHTML={{ __html: profile.biography }}
              />
            </div>

            {/* Tribute Form Card */}
            <div
              className="rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-7 card-hover transition-all duration-300"
              style={cardStyle}
            >
              <div className="flex items-center gap-2 mb-4 sm:mb-5">
                <PenLine className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: GOLD_ACCENT }} />
                <h2 className="text-base sm:text-lg font-bold" style={{ color: NAVY_PRIMARY }}>
                  Gửi lời chia buồn
                </h2>
              </div>

              <form onSubmit={onSubmitTribute}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <input
                    id="tributeName"
                    placeholder="Họ và tên..."
                    value={formData.name}
                    onChange={(e) => onChangeForm({ name: e.target.value })}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-200"
                    style={{
                      backgroundColor: 'rgba(248,250,252,0.8)',
                      border: '1px solid rgba(226,232,240,0.6)',
                      color: '#334155'
                    }}
                  />
                  <input
                    type="tel"
                    placeholder="Số điện thoại..."
                    value={formData.phone}
                    onChange={(e) => onChangeForm({ phone: e.target.value })}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-200"
                    style={{
                      backgroundColor: 'rgba(248,250,252,0.8)',
                      border: '1px solid rgba(226,232,240,0.6)',
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
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-200 resize-none mb-3 sm:mb-4"
                  style={{
                    backgroundColor: 'rgba(248,250,252,0.8)',
                    border: '1px solid rgba(226,232,240,0.6)',
                    color: '#334155'
                  }}
                />
                <button
                  type="submit"
                  className="btn-hover w-full py-2.5 sm:py-3 rounded-full font-semibold text-xs sm:text-sm transition-all duration-300"
                  style={{
                    backgroundColor: SKY_BLUE,
                    color: '#ffffff',
                    boxShadow: '0 6px 20px rgba(14, 165, 233, 0.3)'
                  }}
                >
                  Gửi lời chia buồn
                </button>
              </form>
            </div>

            {/* Tributes Card */}
            <div
              className="rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-7 card-hover transition-all duration-300"
              style={cardStyle}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2
                  className="text-base sm:text-lg font-bold"
                  style={{ color: NAVY_PRIMARY }}
                >
                  Lời chia buồn
                </h2>
                <span
                  className="text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-medium"
                  style={{ backgroundColor: 'rgba(241,245,249,0.8)', color: '#64748b' }}
                >
                  {tributes.length} lời nhắn
                </span>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {tributes.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-default"
                    style={{
                      backgroundColor: 'rgba(248,250,252,0.8)',
                      border: '1px solid rgba(226,232,240,0.6)'
                    }}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <div
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm"
                        style={{
                          background: `linear-gradient(135deg, ${SKY_BLUE}, #38bdf8)`,
                          color: '#ffffff'
                        }}
                      >
                        {t.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs sm:text-sm truncate" style={{ color: NAVY_PRIMARY }}>
                          {t.name}
                        </p>
                        <p className="text-[10px] sm:text-xs" style={{ color: '#94a3b8' }}>
                          {t.date} • {t.phone}
                        </p>
                      </div>
                    </div>
                    <p
                      className="text-xs sm:text-sm"
                      style={{ color: '#475569', lineHeight: 1.8 }}
                    >
                      {t.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom spacing */}
        <div className="h-8 sm:h-12" />
      </div>
    </div>
  );
}
