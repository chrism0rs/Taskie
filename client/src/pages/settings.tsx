import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, User, Music, Image, Bell, Palette, Upload, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useSpotify } from "@/hooks/use-spotify";
import Header from "@/components/header";
import SpotifyWidget from "@/components/spotify-widget";

export default function SettingsPage() {
  const [isBackgroundDialogOpen, setIsBackgroundDialogOpen] = useState(false);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("");
  const [notificationSettings, setNotificationSettings] = useState({
    wellnessReminders: true,
    taskReminders: true,
    completionCelebrations: true,
    emailNotifications: false,
  });
  const { toast } = useToast();
  const { isConnected, disconnect } = useSpotify();

  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/user/profile'],
  });

  const updateBackgroundMutation = useMutation({
    mutationFn: async (backgroundImage: string) => {
      const response = await apiRequest('PUT', '/api/user/background', { backgroundImage });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      setIsBackgroundDialogOpen(false);
      setBackgroundImageUrl("");
      toast({
        title: "Background updated! 🎨",
        description: "Your custom background has been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error updating background",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleBackgroundUpdate = () => {
    if (backgroundImageUrl.trim()) {
      updateBackgroundMutation.mutate(backgroundImageUrl);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setBackgroundImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const defaultBackgrounds = [
    {
      name: "Cute Floral Pink",
      url: "linear-gradient(135deg, hsl(350, 100%, 94%) 0%, hsl(350, 100%, 97%) 50%, hsl(0, 0%, 99%) 100%)",
      isDefault: true,
    },
    {
      name: "Soft Gradient",
      url: "linear-gradient(135deg, #FFE4E6 0%, #FFF0F1 100%)",
      isDefault: false,
    },
    {
      name: "Cherry Blossom",
      url: "linear-gradient(135deg, #FFCCCB 0%, #FFB6C1 50%, #FFC0CB 100%)",
      isDefault: false,
    },
    {
      name: "Sunset Pink",
      url: "linear-gradient(135deg, #FF69B4 0%, #FFB6C1 50%, #FFC0CB 100%)",
      isDefault: false,
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-baby-pink rounded w-48"></div>
            <div className="h-64 bg-baby-pink rounded-2xl"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Settings className="w-8 h-8 text-cherry-red" />
            Settings
          </h1>
          <p className="text-gray-600">Customize your Task.CV experience</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-soft-white/80 backdrop-blur-sm cute-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-cherry-red" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={user?.username || ""}
                      readOnly
                      className="bg-baby-pink/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ""}
                      readOnly
                      className="bg-baby-pink/30"
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-baby-pink/30">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-baby-pink/30 rounded-lg">
                      <div className="text-2xl font-bold text-cherry-red">{user?.totalPoints || 0}</div>
                      <div className="text-sm text-gray-600">Total Points</div>
                    </div>
                    <div className="text-center p-4 bg-baby-pink/30 rounded-lg">
                      <div className="text-2xl font-bold text-cherry-red">
                        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </div>
                      <div className="text-sm text-gray-600">Member Since</div>
                    </div>
                    <div className="text-center p-4 bg-baby-pink/30 rounded-lg">
                      <div className="text-2xl font-bold text-cherry-red">🌸</div>
                      <div className="text-sm text-gray-600">Cuteness Level</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card className="bg-soft-white/80 backdrop-blur-sm cute-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-cherry-red" />
                  Theme & Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Color Scheme</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-baby-pink/30 rounded-lg border-2 border-cherry-red">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-baby-pink rounded-full"></div>
                        <span className="text-sm font-medium">Cute Pink (Current)</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-100 rounded-lg border-2 border-transparent opacity-50">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                        <span className="text-sm">Other themes coming soon</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-soft-white/80 backdrop-blur-sm cute-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5 text-cherry-red" />
                  Background Customization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Background</Label>
                  <div className="h-24 rounded-lg border-2 border-baby-pink/30 overflow-hidden">
                    <div 
                      className="w-full h-full floral-bg"
                      style={{ 
                        background: user?.backgroundImage || 'linear-gradient(135deg, hsl(350, 100%, 94%) 0%, hsl(350, 100%, 97%) 50%, hsl(0, 0%, 99%) 100%)'
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Default Backgrounds</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {defaultBackgrounds.map((bg, index) => (
                      <button
                        key={index}
                        onClick={() => updateBackgroundMutation.mutate(bg.url)}
                        className="p-2 rounded-lg border-2 border-baby-pink/30 hover:border-cherry-red transition-colors"
                      >
                        <div 
                          className="w-full h-16 rounded-md mb-2"
                          style={{ background: bg.url }}
                        ></div>
                        <div className="text-xs text-gray-600">{bg.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <Dialog open={isBackgroundDialogOpen} onOpenChange={setIsBackgroundDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full border-cherry-red text-cherry-red hover:bg-cherry-red hover:text-white">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Custom Background
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Upload Custom Background</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="background-file">Choose Image File</Label>
                        <Input
                          id="background-file"
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="cursor-pointer"
                        />
                      </div>
                      
                      <div className="text-center text-sm text-gray-500">or</div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="background-url">Image URL</Label>
                        <Input
                          id="background-url"
                          placeholder="https://example.com/image.jpg"
                          value={backgroundImageUrl}
                          onChange={(e) => setBackgroundImageUrl(e.target.value)}
                        />
                      </div>
                      
                      {backgroundImageUrl && (
                        <div className="space-y-2">
                          <Label>Preview</Label>
                          <div className="h-32 rounded-lg border-2 border-baby-pink/30 overflow-hidden">
                            <img 
                              src={backgroundImageUrl} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                              onError={() => {
                                toast({
                                  title: "Invalid image",
                                  description: "Please check the image URL or file.",
                                  variant: "destructive",
                                });
                              }}
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="flex space-x-2">
                        <Button 
                          onClick={handleBackgroundUpdate}
                          disabled={!backgroundImageUrl || updateBackgroundMutation.isPending}
                          className="flex-1 bg-cherry-red hover:bg-wine-red"
                        >
                          {updateBackgroundMutation.isPending ? "Updating..." : "Update Background"}
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => setIsBackgroundDialogOpen(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <Card className="bg-soft-white/80 backdrop-blur-sm cute-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="w-5 h-5 text-cherry-red" />
                  Spotify Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-baby-pink/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-baby-pink rounded-full flex items-center justify-center">
                      <Music className="w-6 h-6 text-cherry-red" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Spotify</h3>
                      <p className="text-sm text-gray-600">
                        {isConnected ? "Connected • Play music while you work" : "Not connected"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    {isConnected ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={disconnect}
                        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-cherry-red text-cherry-red hover:bg-cherry-red hover:text-white"
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 space-y-2">
                  <p>• Play your favorite study playlists</p>
                  <p>• Control playback from within the app</p>
                  <p>• Sync across all your devices</p>
                  <p>• Premium subscription recommended for best experience</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-soft-white/80 backdrop-blur-sm cute-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-cherry-red" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base font-medium">Wellness Reminders</Label>
                      <p className="text-sm text-gray-600">Water breaks, stretching, and motivational messages</p>
                    </div>
                    <Switch
                      checked={notificationSettings.wellnessReminders}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, wellnessReminders: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base font-medium">Task Reminders</Label>
                      <p className="text-sm text-gray-600">Notifications for upcoming task deadlines</p>
                    </div>
                    <Switch
                      checked={notificationSettings.taskReminders}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, taskReminders: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base font-medium">Completion Celebrations</Label>
                      <p className="text-sm text-gray-600">Cute animations and sounds when completing tasks</p>
                    </div>
                    <Switch
                      checked={notificationSettings.completionCelebrations}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, completionCelebrations: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base font-medium">Email Notifications</Label>
                      <p className="text-sm text-gray-600">Daily summary and weekly progress reports</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                      }
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-baby-pink/30">
                  <Button className="w-full bg-cherry-red hover:bg-wine-red">
                    Save Notification Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <SpotifyWidget />
    </div>
  );
}
