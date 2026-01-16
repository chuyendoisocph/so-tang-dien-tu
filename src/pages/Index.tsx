import { useState, useEffect, lazy, Suspense } from "react";
import { Sidebar, MobileHeader } from "@/components/layout/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

// Lazy load admin tabs for better performance
const ProfilesTab = lazy(() => import("@/components/admin/ProfilesTab").then(m => ({ default: m.ProfilesTab })));
const CelebritiesTab = lazy(() => import("@/components/admin/CelebritiesTab").then(m => ({ default: m.CelebritiesTab })));
const CreateEditTab = lazy(() => import("@/components/admin/CreateEditTab").then(m => ({ default: m.CreateEditTab })));
const SlideshowTab = lazy(() => import("@/components/admin/SlideshowTab").then(m => ({ default: m.SlideshowTab })));
const CommentsTab = lazy(() => import("@/components/admin/CommentsTab").then(m => ({ default: m.CommentsTab })));
const EmployeesTab = lazy(() => import("@/components/admin/EmployeesTab"));

// Loading spinner for tabs
const TabLoader = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

interface EditingProfile {
  id: string;
  jobId: string;
  name: string;
  isCelebrity?: boolean;
}

const Index = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("profiles");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<EditingProfile | null>(null);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab !== "create") {
      setEditingProfile(null);
    }
  };

  const handleCreateNew = (isCelebrity: boolean = false) => {
    setEditingProfile(isCelebrity ? { id: '', jobId: '', name: '', isCelebrity: true } : null);
    setActiveTab("create");
  };

  const handleEdit = (profile: EditingProfile) => {
    setEditingProfile(profile);
    setActiveTab("create");
  };

  const handleBackToProfiles = () => {
    const wasEditingCelebrity = editingProfile?.isCelebrity;
    setEditingProfile(null);
    setActiveTab(wasEditingCelebrity ? "celebrities" : "profiles");
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
        isAdmin={isAdmin}
      />

      <main className="lg:ml-64 pt-20 lg:pt-6 px-3 pb-6 sm:px-4 lg:px-6 min-h-screen flex items-start justify-center">
        <div className="w-full max-w-6xl">
          <Suspense fallback={<TabLoader />}>
            {activeTab === "profiles" && (
              <ProfilesTab onCreateNew={() => handleCreateNew(false)} onEdit={handleEdit} />
            )}
            {activeTab === "celebrities" && (
              <CelebritiesTab onCreateNew={() => handleCreateNew(true)} onEdit={(profile) => handleEdit({ ...profile, isCelebrity: true })} />
            )}
            {activeTab === "create" && (
              <CreateEditTab onBack={handleBackToProfiles} editingProfile={editingProfile} />
            )}
            {activeTab === "comments" && <CommentsTab />}
            {activeTab === "slideshow" && <SlideshowTab />}
            {activeTab === "employees" && isAdmin && <EmployeesTab />}
          </Suspense>
        </div>
      </main>
    </div>
  );
};

export default Index;
