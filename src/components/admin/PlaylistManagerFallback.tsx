import { useState } from "react";
import { Plus, Play, ExternalLink, Clock, Users, List, AlertCircle, Copy, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface PlaylistManagerFallbackProps {
  selectedProfiles: Set<string>;
  slideSeconds: number;
  onPlayPlaylist: (playlistId: string) => void;
}

export const PlaylistManagerFallback = ({ selectedProfiles, slideSeconds }: PlaylistManagerFallbackProps) => {
  const [playlistName, setPlaylistName] = useState("");
  const [playlistDescription, setPlaylistDescription] = useState("");
  const [savedPlaylists, setSavedPlaylists] = useState<Array<{
    id: string;
    name: string;
    description: string;
    profileIds: string[];
    slideSeconds: number;
    createdAt: string;
  }>>([]);

  const generatePlaylistUrl = (mode: 'standee' | 'profile', profileIds?: string[], customSlideSeconds?: number, customName?: string) => {
    const ids = profileIds || Array.from(selectedProfiles);
    const baseUrl = mode === 'standee' ? '/slideshow' : '/slideshow-profile';
    const params = new URLSearchParams();
    
    params.set('time', (customSlideSeconds || slideSeconds).toString());
    if (ids.length > 0) {
      params.set('profiles', ids.join(","));
    }
    if (customName?.trim()) {
      params.set('name', customName.trim());
    }
    
    return `${baseUrl}?${params.toString()}`;
  };

  const savePlaylist = () => {
    if (!playlistName.trim()) {
      toast.error("Vui lòng nhập tên playlist");
      return;
    }
    
    if (selectedProfiles.size === 0) {
      toast.error("Vui lòng chọn ít nhất một hồ sơ");
      return;
    }

    const newPlaylist = {
      id: Date.now().toString(),
      name: playlistName.trim(),
      description: playlistDescription.trim(),
      profileIds: Array.from(selectedProfiles),
      slideSeconds,
      createdAt: new Date().toISOString()
    };

    const updated = [...savedPlaylists, newPlaylist];
    setSavedPlaylists(updated);
    localStorage.setItem('temp_playlists', JSON.stringify(updated));
    
    setPlaylistName("");
    setPlaylistDescription("");
    toast.success("Playlist đã được lưu tạm thời!");
  };

  const deletePlaylist = (id: string) => {
    const updated = savedPlaylists.filter(p => p.id !== id);
    setSavedPlaylists(updated);
    localStorage.setItem('temp_playlists', JSON.stringify(updated));
    toast.success("Đã xóa playlist");
  };

  const openPlaylist = (mode: 'standee' | 'profile', playlist?: any) => {
    const profileIds = playlist ? playlist.profileIds : Array.from(selectedProfiles);
    const customSlideSeconds = playlist ? playlist.slideSeconds : slideSeconds;
    const customName = playlist ? playlist.name : playlistName;
    
    if (profileIds.length === 0) {
      toast.error("Playlist không có hồ sơ nào");
      return;
    }
    
    const url = generatePlaylistUrl(mode, profileIds, customSlideSeconds, customName);
    window.open(url, '_blank');
    toast.success(`Đã mở ${mode === 'standee' ? 'Standee' : 'Profile'} Mode`);
  };

  const copyPlaylistUrl = (mode: 'standee' | 'profile', playlist?: any) => {
    const profileIds = playlist ? playlist.profileIds : Array.from(selectedProfiles);
    const customSlideSeconds = playlist ? playlist.slideSeconds : slideSeconds;
    const customName = playlist ? playlist.name : playlistName;
    
    if (profileIds.length === 0) {
      toast.error("Playlist không có hồ sơ nào");
      return;
    }
    
    const url = `${window.location.origin}${generatePlaylistUrl(mode, profileIds, customSlideSeconds, customName)}`;
    navigator.clipboard.writeText(url);
    toast.success("URL đã được copy vào clipboard!");
  };

  // Load saved playlists from localStorage
  useState(() => {
    const saved = localStorage.getItem('temp_playlists');
    if (saved) {
      try {
        setSavedPlaylists(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved playlists:', error);
      }
    }
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <List className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Playlist Manager</h3>
        </div>
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                Playlist tạm thời (Local Storage)
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Playlists được lưu trong trình duyệt. Để lưu vào database, cần setup Supabase table.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Playlist */}
      <Card className="shadow-lg border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Tạo Playlist Mới
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="playlist-name">Tên Playlist *</Label>
              <Input
                id="playlist-name"
                placeholder="VD: Playlist Tháng 12"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="playlist-desc">Mô tả</Label>
              <Input
                id="playlist-desc"
                placeholder="Mô tả ngắn..."
                value={playlistDescription}
                onChange={(e) => setPlaylistDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {slideSeconds}s
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              {selectedProfiles.size} hồ sơ
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button
              onClick={savePlaylist}
              disabled={selectedProfiles.size === 0 || !playlistName.trim()}
              size="sm"
              className="w-full"
            >
              <Plus className="h-3 w-3 mr-1" />
              Lưu
            </Button>
            <Button
              onClick={() => openPlaylist('standee')}
              disabled={selectedProfiles.size === 0}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Play className="h-3 w-3 mr-1" />
              Standee
            </Button>
            <Button
              onClick={() => openPlaylist('profile')}
              disabled={selectedProfiles.size === 0}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Profile
            </Button>
            <Button
              onClick={() => copyPlaylistUrl('standee')}
              disabled={selectedProfiles.size === 0}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy URL
            </Button>
          </div>

          {selectedProfiles.size === 0 && (
            <p className="text-sm text-muted-foreground text-center">
              Chọn hồ sơ ở trên để tạo playlist
            </p>
          )}
        </CardContent>
      </Card>

      {/* Saved Playlists */}
      {savedPlaylists.length > 0 && (
        <Card className="shadow-lg border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base">Playlists đã lưu ({savedPlaylists.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {savedPlaylists.map((playlist) => (
              <div key={playlist.id} className="p-3 border rounded-lg bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{playlist.name}</h4>
                    {playlist.description && (
                      <p className="text-sm text-muted-foreground">{playlist.description}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deletePlaylist(playlist.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    ×
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {playlist.slideSeconds}s
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {playlist.profileIds.length} hồ sơ
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {new Date(playlist.createdAt).toLocaleDateString()}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                  <Button
                    onClick={() => openPlaylist('standee', playlist)}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Standee
                  </Button>
                  <Button
                    onClick={() => openPlaylist('profile', playlist)}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Profile
                  </Button>
                  <Button
                    onClick={() => copyPlaylistUrl('standee', playlist)}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                  <Button
                    onClick={() => copyPlaylistUrl('profile', playlist)}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                  >
                    <Share className="h-3 w-3 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};