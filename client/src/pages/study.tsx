import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Pause, RotateCcw } from "lucide-react";
import { Link } from "wouter";
import { useWellness } from "@/hooks/use-wellness";
import WellnessNotification from "@/components/wellness-notification";
import SpotifyWidget from "@/components/spotify-widget";

export default function Study() {
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [sessionTime, setSessionTime] = useState(25 * 60); // 25 minutes in seconds
  const [timeRemaining, setTimeRemaining] = useState(sessionTime);
  const [isActive, setIsActive] = useState(false);
  const { reminders, dismissReminder } = useWellness(isStudyMode);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => {
          if (time <= 1) {
            setIsActive(false);
            setIsStudyMode(false);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isActive, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsActive(true);
    setIsStudyMode(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setIsStudyMode(false);
    setTimeRemaining(sessionTime);
  };

  const handleSessionTimeChange = (minutes: number) => {
    const newTime = minutes * 60;
    setSessionTime(newTime);
    setTimeRemaining(newTime);
  };

  return (
    <div className="min-h-screen study-mode-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" size="sm" className="w-10 h-10 p-0 rounded-full border-cherry-red text-cherry-red hover:bg-cherry-red hover:text-white">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-800">Study Mode</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Card className="bg-soft-white/80 backdrop-blur-sm cute-shadow">
                <CardContent className="px-6 py-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cherry-red">
                      {formatTime(timeRemaining)}
                    </div>
                    <div className="text-sm text-gray-600">Study Time</div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex items-center space-x-2">
                <Button
                  onClick={isActive ? handlePause : handleStart}
                  className="bg-cherry-red hover:bg-wine-red text-white"
                  disabled={timeRemaining === 0}
                >
                  {isActive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isActive ? "Pause" : "Start"} Session
                </Button>
                
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="border-cherry-red text-cherry-red hover:bg-cherry-red hover:text-white"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Main Study Area */}
          <div className="text-center mb-8">
            <Card className="bg-soft-white/80 backdrop-blur-sm cute-shadow">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Focus Zone 🌸</h2>
                <p className="text-gray-600 mb-6">
                  You're in a distraction-free environment. We'll send gentle reminders to keep you healthy!
                </p>
                
                {/* Session Time Controls */}
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-3">Session Duration</p>
                  <div className="flex justify-center space-x-2">
                    {[15, 25, 45, 60].map((minutes) => (
                      <Button
                        key={minutes}
                        variant={sessionTime === minutes * 60 ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSessionTimeChange(minutes)}
                        disabled={isActive}
                        className={sessionTime === minutes * 60 ? "bg-cherry-red hover:bg-wine-red" : "border-cherry-red text-cherry-red hover:bg-cherry-red hover:text-white"}
                      >
                        {minutes}m
                      </Button>
                    ))}
                  </div>
                </div>
                
                {/* Wellness Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-baby-pink rounded-xl">
                    <div className="text-2xl mb-2">💧</div>
                    <h3 className="font-semibold text-gray-800">Water Reminder</h3>
                    <p className="text-sm text-gray-600">Every 30 minutes</p>
                  </div>
                  <div className="text-center p-4 bg-baby-pink rounded-xl">
                    <div className="text-2xl mb-2">🧘‍♀️</div>
                    <h3 className="font-semibold text-gray-800">Stretch Break</h3>
                    <p className="text-sm text-gray-600">Every 30 minutes</p>
                  </div>
                  <div className="text-center p-4 bg-baby-pink rounded-xl">
                    <div className="text-2xl mb-2">✨</div>
                    <h3 className="font-semibold text-gray-800">Motivation</h3>
                    <p className="text-sm text-gray-600">Every hour</p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="w-full bg-baby-pink rounded-full h-3">
                    <div 
                      className="bg-cherry-red h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${((sessionTime - timeRemaining) / sessionTime) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {Math.round(((sessionTime - timeRemaining) / sessionTime) * 100)}% Complete
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Study Tips */}
          <Card className="bg-soft-white/80 backdrop-blur-sm cute-shadow">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Study Tips 📚</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-cherry-red rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                    <p className="text-sm text-gray-700">Find a quiet, comfortable space free from distractions</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-cherry-red rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                    <p className="text-sm text-gray-700">Set specific goals for each study session</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-cherry-red rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                    <p className="text-sm text-gray-700">Take notes by hand to improve retention</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-cherry-red rounded-full flex items-center justify-center text-white text-xs font-bold">4</div>
                    <p className="text-sm text-gray-700">Use active recall techniques instead of passive reading</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-cherry-red rounded-full flex items-center justify-center text-white text-xs font-bold">5</div>
                    <p className="text-sm text-gray-700">Stay hydrated and take regular breaks</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-cherry-red rounded-full flex items-center justify-center text-white text-xs font-bold">6</div>
                    <p className="text-sm text-gray-700">Review material before bed to improve memory consolidation</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Wellness Notifications */}
      {reminders.map((reminder) => (
        <WellnessNotification
          key={reminder.id}
          reminder={reminder}
          onDismiss={dismissReminder}
        />
      ))}
      
      <SpotifyWidget />
    </div>
  );
}
