import { useEffect, useState } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { Facebook, Link2, MessageCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

import MemorialProfileWeb from "@/components/profile/MemorialProfileWeb";
import { useProfileData } from "@/hooks/useProfileData";

// Mock tributes (to be replaced with real data later)
const mockTributes = [
  {
    id: 1,
    name: "Nguyễn Văn An",
    phone: "0901***456",
    message: "Xin chia buồn cùng gia đình. Anh ra đi là mất mát lớn cho cộng đồng.",
    date: "15/12/2025",
  },
  {
    id: 2,
    name: "Trần Thị Bình",
    phone: "0912***789",
    message: "Cầu mong anh yên nghỉ. Anh mãi là tấm gương sáng cho chúng em.",
    date: "14/12/2025",
  },
  {
    id: 3,
    name: "Lê Minh Châu",
    phone: "0987***321",
    message: "Vĩnh biệt anh. Những đóng góp của anh sẽ mãi được ghi nhớ.",
    date: "14/12/2025",
  },
  {
    id: 4,
    name: "Phạm Văn Đức",
    phone: "0976***654",
    message: "Xin gửi lời chia buồn sâu sắc đến gia đình.",
    date: "13/12/2025",
  },
];

export default function ProfilePage() {
  const [searchParams] = useSearchParams();
  const { profileId } = useParams();
  const isSlideshow = searchParams.get("slideshow") === "1";
  const isKiosk = searchParams.get("kiosk") === "1";

  const { profile, photos, isLoading, error } = useProfileData(profileId);

  const [tributes, setTributes] = useState(mockTributes);
  const [formData, setFormData] = useState({ name: "", phone: "", message: "" });
  const [shareModalOpen, setShareModalOpen] = useState(false);

  useEffect(() => {
    if (profile?.name) {
      document.title = `Sổ Tang Điện Tử - ${profile.name}`;
    }
  }, [profile?.name]);

  const handleSubmitTribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const newTribute = {
      id: tributes.length + 1,
      name: formData.name,
      phone: formData.phone.slice(0, 4) + "***" + formData.phone.slice(-3),
      message: formData.message,
      date: new Date().toLocaleDateString("vi-VN"),
    };

    setTributes([newTribute, ...tributes]);
    setFormData({ name: "", phone: "", message: "" });
    toast.success("Đã gửi lời chia buồn");
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
      />

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

      {/* Accessibility: ensure at least one in-page landmark */}
      <span className="sr-only">
        <MessageCircle className="h-0 w-0" />
      </span>
    </>
  );
}
