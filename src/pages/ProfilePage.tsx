import { useEffect, useState } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { Facebook, Link2, MessageCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

import MemorialProfileWeb from "@/components/profile/MemorialProfileWeb";

// Mock data
const mockProfile = {
  id: "HNT2025",
  name: "Hoàng Nam Tiến",
  dateRange: "28/06/1969 - 31/07/2025",
  avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=800&fit=crop&crop=face",
  coverUrl: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1920&h=600&fit=crop",
  biography: `
    <p>Ông Hoàng Nam Tiến sinh ngày 28 tháng 6 năm 1969 tại Hà Nội. Ông là một doanh nhân xuất sắc, nhà lãnh đạo tài ba trong lĩnh vực công nghệ thông tin Việt Nam.</p>
    <p>Với hơn 30 năm cống hiến cho ngành công nghệ, ông đã góp phần xây dựng và phát triển nhiều doanh nghiệp công nghệ hàng đầu Việt Nam.</p>
    <p>Ông ra đi để lại niềm tiếc thương vô hạn trong lòng gia đình, đồng nghiệp và cộng đồng doanh nhân.</p>
  `,
  roles: [
    "Nguyên Chủ tịch HĐQT Công ty ABC",
    "Phó Chủ tịch Hiệp hội Doanh nghiệp",
    "Thành viên Ban cố vấn Đại học XYZ",
    "Chủ tịch sáng lập Quỹ Từ thiện ABC",
  ],
};

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

  const [tributes, setTributes] = useState(mockTributes);
  const [formData, setFormData] = useState({ name: "", phone: "", message: "" });
  const [shareModalOpen, setShareModalOpen] = useState(false);

  useEffect(() => {
    document.title = `Sổ Tang Điện Tử - ${mockProfile.name}`;
  }, []);

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

  return (
    <>
      <MemorialProfileWeb
        profile={mockProfile}
        tributes={tributes}
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
