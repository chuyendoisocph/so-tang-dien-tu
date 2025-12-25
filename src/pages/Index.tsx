import { useState, useEffect } from "react";
import { Sidebar, MobileHeader } from "@/components/layout/Sidebar";
import { ProfilesTab } from "@/components/admin/ProfilesTab";
import { CreateEditTab } from "@/components/admin/CreateEditTab";
import { SlideshowTab } from "@/components/admin/SlideshowTab";
import { CommentsTab } from "@/components/admin/CommentsTab";

interface EditingProfile {
  id: string;
  jobId: string;
  name: string;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState("profiles");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<EditingProfile | null>(null);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab !== "create") {
      setEditingProfile(null);
    }
  };

  const handleCreateNew = () => {
    setEditingProfile(null);
    setActiveTab("create");
  };

  const handleEdit = (profile: EditingProfile) => {
    setEditingProfile(profile);
    setActiveTab("create");
  };

  const handleBackToProfiles = () => {
    setEditingProfile(null);
    setActiveTab("profiles");
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    document.title = "CPHACO Admin | Quản trị Sổ Tang";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <MobileHeader onToggle={toggleSidebar} />

      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
      />

      <main className="lg:ml-64 pt-20 lg:pt-6 px-3 pb-6 sm:px-4 lg:px-6 min-h-screen flex items-start justify-center">
        <div className="w-full max-w-6xl">
          {activeTab === "profiles" && (
            <ProfilesTab onCreateNew={handleCreateNew} onEdit={handleEdit} />
          )}
          {activeTab === "create" && (
            <CreateEditTab onBack={handleBackToProfiles} editingProfile={editingProfile} />
          )}
          {activeTab === "comments" && <CommentsTab />}
          {activeTab === "slideshow" && <SlideshowTab />}
        </div>
      </main>
    </div>
  );
};

export default Index;
