import { Link, useLocation } from "wouter";
import { Heart, Users, Wifi, WifiOff } from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";
import { useQuery } from "@tanstack/react-query";

export default function Header() {
  const [location] = useLocation();
  const { isConnected, connectedUsers } = useWebSocket(1); // Mock user ID
  
  const { data: user } = useQuery({
    queryKey: ['/api/user/profile'],
  });

  const navItems = [
    { path: "/", label: "Tasks", active: location === "/" },
    { path: "/study", label: "Study Mode", active: location === "/study" },
    { path: "/calendar", label: "Calendar", active: location === "/calendar" },
    { path: "/analytics", label: "Analytics", active: location === "/analytics" },
    { path: "/settings", label: "Settings", active: location === "/settings" },
  ];

  return (
    <header className="bg-soft-white/80 backdrop-blur-sm border-b border-baby-pink/30 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-cherry-red rounded-full flex items-center justify-center">
              <Heart className="text-white w-5 h-5" fill="currentColor" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Task.CV</h1>
          </div>
          
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`font-medium transition-colors ${
                  item.active
                    ? "text-cherry-red border-b-2 border-cherry-red pb-2"
                    : "text-gray-600 hover:text-cherry-red"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center space-x-3">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 bg-cherry-red rounded-full flex items-center justify-center border-2 border-white">
                <span className="text-white text-xs font-bold">ME</span>
              </div>
              <div className="w-8 h-8 bg-wine-red rounded-full flex items-center justify-center border-2 border-white">
                <span className="text-white text-xs font-bold">FR</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600">
                    {connectedUsers.length > 0 ? "Both online" : "Online"}
                  </span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-gray-600">Offline</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
