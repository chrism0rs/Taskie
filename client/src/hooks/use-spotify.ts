import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  duration_ms: number;
  is_playing: boolean;
  progress_ms: number;
}

export function useSpotify() {
  const [isConnected, setIsConnected] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if we have a stored access token
    const storedToken = localStorage.getItem('spotify_access_token');
    if (storedToken) {
      setAccessToken(storedToken);
      setIsConnected(true);
      getCurrentTrack(storedToken);
    }
  }, []);

  const connectToSpotify = async () => {
    try {
      // In a real implementation, this would use the Spotify Web API
      // For now, we'll simulate the connection
      const client_id = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
      const redirect_uri = `${window.location.origin}/callback`;
      const scope = 'user-read-playback-state user-modify-playback-state user-read-currently-playing';
      
      const params = new URLSearchParams({
        response_type: 'code',
        client_id,
        scope,
        redirect_uri,
      });
      
      window.location.href = `https://accounts.spotify.com/authorize?${params}`;
    } catch (error) {
      toast({
        title: "Spotify Connection Failed",
        description: "Unable to connect to Spotify. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getCurrentTrack = async (token: string) => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.item) {
          setCurrentTrack({
            id: data.item.id,
            name: data.item.name,
            artists: data.item.artists,
            duration_ms: data.item.duration_ms,
            is_playing: data.is_playing,
            progress_ms: data.progress_ms,
          });
          setIsPlaying(data.is_playing);
        }
      }
    } catch (error) {
      console.error('Error fetching current track:', error);
    }
  };

  const togglePlayback = async () => {
    if (!accessToken) return;

    try {
      const endpoint = isPlaying ? 'pause' : 'play';
      const response = await fetch(`https://api.spotify.com/v1/me/player/${endpoint}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        setIsPlaying(!isPlaying);
        if (currentTrack) {
          setCurrentTrack({ ...currentTrack, is_playing: !isPlaying });
        }
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  const skipTrack = async (direction: 'next' | 'previous') => {
    if (!accessToken) return;

    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/${direction}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        // Wait a moment then fetch the new track
        setTimeout(() => getCurrentTrack(accessToken), 1000);
      }
    } catch (error) {
      console.error('Error skipping track:', error);
    }
  };

  const disconnect = () => {
    localStorage.removeItem('spotify_access_token');
    setAccessToken(null);
    setIsConnected(false);
    setCurrentTrack(null);
    setIsPlaying(false);
  };

  return {
    isConnected,
    currentTrack,
    isPlaying,
    connectToSpotify,
    togglePlayback,
    skipTrack,
    disconnect,
  };
}
