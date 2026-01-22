import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { sanitizeHtml } from "@/lib/sanitize";
import lotusImage from "@/assets/Hoa sen vang.png";

const GOLD_ACCENT = '#C5A059';
const NAVY_PRIMARY = '#1e3a5f';

// Helper function to convert UPPERCASE text to Title Case
function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Mock data for preview
const mockProfile = {
  id: "preview-123",
  name: "NGUYỄN VĂN A",
  dateRange: "1950 — 2025",
  avatarUrl: "",
  biography: `<p>Ông Nguyễn Văn A sinh năm 1950 tại Bình Dương. Ông là một người cha mẫu mực, một người chồng tận tụy và một công dân gương mẫu.</p>
<p>Trong suốt cuộc đời, ông đã cống hiến hết mình cho gia đình và xã hội. Ông luôn được mọi người yêu mến và kính trọng.</p>
<p>Ông ra đi để lại niềm tiếc thương vô hạn cho gia đình và bạn bè.</p>`,
  isBuried: true
};

const mockTributes = [
  {
    id: "1",
    name: "Nhân Nguyễn",
    phone: "",
    message: "Con xin gửi lời chia buồn đến gia đình. Cầu cho hương linh ông cụ vãng sanh miền cực lạc.",
    date: "30/12/2025"
  },
  {
    id: "2", 
    name: "Trần Thị Tuyết Mai",
    phone: "",
    message: "Con xin chia buồn cùng gia đình trước sự ra đi của cụ. Mong gia đình giữ gìn sức khỏe để lo chu toàn hậu sự cho cụ.",
    date: "30/12/2025"
  }
];

// Avatar with fallback
function AvatarImage({ src, alt, style }: { src?: string; alt: string; style?: React.CSSProperties }) {
  const [hasError, setHasError] = useState(false);
  const shouldShowFallback = !src || hasError || src.trim() === '';

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
            style={{ width: '85%', height: '85%', objectFit: 'contain' }}
          />
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      style={style}
      onError={() => setHasError(true)}
    />
  );
}

export default function ScreenshotPreview() {
  const [scale, setScale] = useState(0.5);
  const publicUrl = `${window.location.origin}/profile/${mockProfile.id}`;
  const years = mockProfile.dateRange;

  useEffect(() => {
    // Auto-scale based on window height
    const updateScale = () => {
      const availableHeight = window.innerHeight - 100;
      const newScale = Math.min(availableHeight / 1920, 0.6);
      setScale(newScale);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      {/* Controls */}
      <div className="fixed top-4 left-4 z-50 bg-white rounded-lg p-4 shadow-lg">
        <h2 className="font-bold mb-2">Screenshot Preview (1080x1920)</h2>
        <div className="flex items-center gap-2 mb-2">
          <span>Scale:</span>
          <input 
            type="range" 
            min="0.2" 
            max="0.8" 
            step="0.05" 
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="w-32"
          />
          <span>{Math.round(scale * 100)}%</span>
        </div>
        <p className="text-sm text-gray-500">Chỉnh sửa code trong file này và refresh để xem thay đổi</p>
      </div>

      {/* Preview Container */}
      <div className="flex justify-center pt-20">
        <div 
          style={{ 
            transform: `scale(${scale})`,
            transformOrigin: 'top center'
          }}
        >
          {/* ========== SCREENSHOT LAYOUT START ========== */}
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              width: '1080px',
              height: '1920px',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            {/* Background */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, #FDFCF8 0%, #F8F3E3 40%, #F3E5AB 100%)',
                zIndex: 0
              }}
            />

            {/* ============ SECTION 1: HEADER - 35% (672px) ============ */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '672px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 40px',
                overflow: 'hidden',
                zIndex: 10
              }}
            >
              {/* Brand Name */}
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

              {/* Profile Picture */}
              <div style={{ marginBottom: '24px' }}>
                <AvatarImage
                  src={mockProfile.avatarUrl}
                  alt={mockProfile.name}
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

              {/* Name */}
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
                {mockProfile.name}
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
                <strong>{toTitleCase(mockProfile.name)}</strong> sẽ được an nghỉ tại <strong>Hoa Viên Bình Dương</strong>
              </div>
            </div>

            {/* Divider */}
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
                top: '672px',
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
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(mockProfile.biography) }}
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 14,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
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

                {/* QR Section */}
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
                  {/* Left QR */}
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

                  {/* Right QR */}
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
                    {mockTributes.length} lời nhắn
                  </span>
                </h3>

                {/* Messages Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '24px',
                    flex: 1
                  }}
                >
                  {mockTributes.slice(0, 2).map((t) => (
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
                      {/* Message Body */}
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
          {/* ========== SCREENSHOT LAYOUT END ========== */}
        </div>
      </div>
    </div>
  );
}
