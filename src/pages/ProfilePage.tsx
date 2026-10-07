import { useEffect, useState, useMemo, useRef } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { Facebook, Link2, MessageCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { toPng } from "html-to-image";

import MemorialProfileWeb from "@/components/profile/MemorialProfileWeb";
import { StandeeExport1080x1920 } from "@/components/admin/StandeeExport";
import { useProfileData } from "@/hooks/useProfileData";
import { useComments } from "@/hooks/useComments";
import { updateMetaTags, resetMetaTags } from "@/utils/metaTags";

// Minimum gap between two condolences sent from the same open page
const SUBMIT_COOLDOWN_MS = 10_000;

export default function ProfilePage() {
  const [searchParams] = useSearchParams();
  const { profileId } = useParams();
  const [formData, setFormData] = useState({ name: "", phone: "", message: "" });
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const isSubmittingRef = useRef(false);
  const lastSubmitRef = useRef(0);

  // Parse URL parameters
  const isSlideshow = searchParams.get("slideshow") === "1";
  const isKiosk = searchParams.get("kiosk") === "1";
  const screenshotMode = searchParams.get("screenshot"); // 'a4' or '1080x1920'

  const { profile, photos, isLoading, error, actualProfileId } = useProfileData(profileId);
  const { comments, addComment } = useComments(actualProfileId || '');

  // Memoize transformed tributes to prevent unnecessary re-renders
  const tributes = useMemo(() => 
    comments.map(comment => ({
      id: comment.id,
      name: comment.author_name,
      phone: "***", // Sender's phone is never sent to public pages
      message: comment.content,
      date: new Date(comment.created_at || '').toLocaleDateString("vi-VN"),
    })), 
    [comments]
  );

  // Screenshot capture effect
  useEffect(() => {
    if (!screenshotMode || !profile || !profileRef.current) return;

    const captureScreenshot = async () => {
      // Wait for images to load
      await new Promise(resolve => setTimeout(resolve, 3000));

      const element = profileRef.current;
      if (!element) return;

      try {
        const dataUrl = await toPng(element, {
          quality: 1.0,
          pixelRatio: screenshotMode === 'a4' ? 2 : 1,
          backgroundColor: '#FDFCF8',
          width: screenshotMode === 'a4' ? 794 : 1080,
          height: screenshotMode === 'a4' ? 1123 : 1920,
          style: {
            transform: 'scale(1)',
            transformOrigin: 'top left',
          }
        });

        // Download the image
        const link = document.createElement('a');
        link.download = `${profile.name.replace(/\s+/g, '_')}_${screenshotMode}.png`;
        link.href = dataUrl;
        link.click();

        // Close the tab after download
        setTimeout(() => window.close(), 500);
      } catch (error) {
        console.error('Screenshot capture failed:', error);
        toast.error('Không thể tạo ảnh. Vui lòng thử lại.');
      }
    };

    captureScreenshot();
  }, [screenshotMode, profile]);

  // Set document title and meta tags
  useEffect(() => {
    if (profile?.name) {
      const title = `Sổ Tang Điện Tử - ${profile.name}`;
      const description = `Trang tưởng niệm của ${profile.name}`;
      const currentUrl = window.location.href;
      
      updateMetaTags({
        title,
        description,
        image: profile.avatarUrl,
        url: currentUrl
      });
    }
    
    // Cleanup: Reset meta tags when component unmounts
    return () => {
      resetMetaTags();
    };
  }, [profile?.name, profile?.avatarUrl]);

  const handleSubmitTribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;
    if (!formData.name.trim() || !formData.message.trim()) {
      toast.error("Vui lòng điền tên và lời chia buồn");
      return;
    }

    const waitSeconds = Math.ceil((lastSubmitRef.current + SUBMIT_COOLDOWN_MS - Date.now()) / 1000);
    if (waitSeconds > 0) {
      toast.error(`Vui lòng chờ ${waitSeconds} giây trước khi gửi tiếp`);
      return;
    }

    isSubmittingRef.current = true;
    try {
      // Success/error toasts are shown by the mutation itself
      await addComment({
        name: formData.name,
        phone: formData.phone,
        message: formData.message,
      });

      lastSubmitRef.current = Date.now();
      setFormData({ name: "", phone: "", message: "" });
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Đã sao chép liên kết");
    setShareModalOpen(false);
  };

  const shareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
      "_blank"
    );
    setShareModalOpen(false);
  };

  const shareZalo = () => {
    window.open(`https://zalo.me/share/friend?link=${encodeURIComponent(window.location.href)}`, "_blank");
    setShareModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#FDFCF8] to-[#F3E5AB]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#1e3a5f] font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#FDFCF8] to-[#F3E5AB]">
        <div className="text-center max-w-md mx-auto p-8">
          <h1 className="text-2xl font-bold text-[#1e3a5f] mb-4">Không tìm thấy trang tưởng niệm</h1>
          <p className="text-gray-600">Trang tưởng niệm này không tồn tại hoặc chưa được công bố.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div ref={profileRef}>
        {screenshotMode === '1080x1920' ? (
          <StandeeExport1080x1920
            profile={{
              id: actualProfileId || '',
              name: profile.name,
              avatar_url: profile.avatarUrl,
              biography: profile.biography,
              birth_date: profile.dateRange?.split(' - ')[0],
              death_date: profile.dateRange?.split(' - ')[1],
            }}
            tributes={tributes.map(t => ({
              id: t.id,
              name: t.name,
              message: t.message,
              date: t.date
            }))}
          />
        ) : (
          <MemorialProfileWeb
            profile={profile}
            tributes={tributes}
            photos={photos}
            formData={formData}
            onChangeForm={(patch) => setFormData((p) => ({ ...p, ...patch }))}
            onSubmitTribute={handleSubmitTribute}
            onOpenShare={() => setShareModalOpen(true)}
            slideshowMode={isSlideshow}
            kioskMode={isKiosk}
            standeeMode={screenshotMode === 'a4'}
            staticMode={screenshotMode === 'a4'}
          />
        )}
      </div>

      {/* Share Modal */}
      <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-center font-bold">Chia sẻ trang tưởng niệm</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center gap-6 py-6">
            <button onClick={shareFacebook} className="flex flex-col items-center gap-2 hover:scale-110 transition-transform">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
                <Facebook className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium">Facebook</span>
            </button>
            <button onClick={shareZalo} className="flex flex-col items-center gap-2 hover:scale-110 transition-transform">
              <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold shadow-lg">
                Zalo
              </div>
              <span className="text-sm font-medium">Zalo</span>
            </button>
            <button onClick={copyLink} className="flex flex-col items-center gap-2 hover:scale-110 transition-transform">
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground shadow-lg">
                <Link2 className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium">Sao chép</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Accessibility landmark */}
      <span className="sr-only">
        <MessageCircle className="h-0 w-0" />
      </span>
    </>
  );
}
