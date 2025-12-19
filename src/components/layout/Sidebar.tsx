import { cn } from "@/lib/utils";
import { Users, UserPlus, PlayCircle, X, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const navItems = [
  { id: "profiles", label: "Danh sách Hồ Sơ", icon: Users },
  { id: "create", label: "Thêm Mới / Sửa", icon: UserPlus },
  { id: "slideshow", label: "Cấu hình Trình chiếu", icon: PlayCircle },
];

export const Sidebar = ({ activeTab, onTabChange, isOpen, onToggle }: SidebarProps) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-sidebar border-r border-sidebar-border z-50",
          "flex flex-col transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile close button */}
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-sidebar-border">
          <span className="text-muted-foreground font-semibold">MENU</span>
          <Button variant="ghost" size="icon" onClick={onToggle}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Brand */}
        <div className="hidden lg:flex flex-col items-center p-6 border-b border-sidebar-border">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <span className="text-2xl font-bold text-primary">CPH</span>
          </div>
          <span className="text-primary font-bold text-sm uppercase tracking-wide">
            Admin Portal
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  if (window.innerWidth < 1024) onToggle();
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg",
                  "text-sidebar-foreground font-medium transition-all duration-200",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  activeTab === item.id && "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border text-center text-xs text-muted-foreground">
          © 2025 CPHACO
        </div>
      </aside>
    </>
  );
};

export const MobileHeader = ({ onToggle }: { onToggle: () => void }) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-30 lg:hidden">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">CPH</span>
          </div>
          <span className="font-bold text-primary">CPHACO ADMIN</span>
        </div>
        <Button variant="outline" size="icon" onClick={onToggle}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};
