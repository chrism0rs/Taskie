import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, Music } from "lucide-react";
import { useSpotify } from "@/hooks/use-spotify";

export default function SpotifyWidget() {
  const { isConnected, currentTrack, isPlaying, connectToSpotify, togglePlayback, skipTrack } = useSpotify();

  if (!isConnected) {
    return (
      <Card className="fixed bottom-4 right-4 bg-soft-white/90 backdrop-blur-sm cute-shadow hidden md:block">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-baby-pink rounded-xl flex items-center justify-center">
              <Music className="text-cherry-red w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 text-sm">Connect Spotify</h4>
              <p className="text-xs text-gray-600">Play music while you work</p>
            </div>
            <Button
              onClick={connectToSpotify}
              variant="outline"
              size="sm"
              className="text-cherry-red border-cherry-red hover:bg-cherry-red hover:text-white"
            >
              Connect
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 bg-soft-white/90 backdrop-blur-sm cute-shadow hidden md:block">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-baby-pink rounded-xl flex items-center justify-center">
            <Music className="text-cherry-red w-6 h-6" />
          </div>
          <div className="max-w-32">
            <h4 className="font-semibold text-gray-800 text-sm truncate">
              {currentTrack?.name || "No track playing"}
            </h4>
            <p className="text-xs text-gray-600">
              {currentTrack?.artists?.[0]?.name || "Spotify • Connected"}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => skipTrack('previous')}
              className="text-gray-600 hover:text-cherry-red p-1 h-auto"
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlayback}
              className="w-8 h-8 bg-cherry-red rounded-full text-white hover:bg-wine-red p-0"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => skipTrack('next')}
              className="text-gray-600 hover:text-cherry-red p-1 h-auto"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    );
  </Card>
    );
}
