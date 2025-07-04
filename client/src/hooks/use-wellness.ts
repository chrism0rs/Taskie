import { useState, useEffect, useRef } from "react";
import { WELLNESS_REMINDERS, MOTIVATIONAL_QUOTES } from "@/lib/constants";

interface WellnessReminder {
  id: string;
  type: keyof typeof WELLNESS_REMINDERS;
  title: string;
  message: string;
  icon: string;
  timestamp: Date;
}

export function useWellness(isStudyMode: boolean) {
  const [reminders, setReminders] = useState<WellnessReminder[]>([]);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        setIsNotificationEnabled(permission === 'granted');
      });
    }
  }, []);

  useEffect(() => {
    if (!isStudyMode) {
      // Clear all timers when not in study mode
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current = [];
      return;
    }

    // Set up wellness reminder timers
    const waterTimer = setInterval(() => {
      showReminder('WATER');
    }, WELLNESS_REMINDERS.WATER.interval);

    const stretchTimer = setInterval(() => {
      showReminder('STRETCH');
    }, WELLNESS_REMINDERS.STRETCH.interval);

    const motivationTimer = setInterval(() => {
      showReminder('MOTIVATION');
    }, WELLNESS_REMINDERS.MOTIVATION.interval);

    timersRef.current = [waterTimer, stretchTimer, motivationTimer];

    return () => {
      timersRef.current.forEach(timer => clearInterval(timer));
      timersRef.current = [];
    };
  }, [isStudyMode]);

  const showReminder = (type: keyof typeof WELLNESS_REMINDERS) => {
    const reminderConfig = WELLNESS_REMINDERS[type];
    let message = reminderConfig.message;
    
    // Add motivational quote for motivation reminders
    if (type === 'MOTIVATION') {
      const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
      message = randomQuote;
    }

    const reminder: WellnessReminder = {
      id: Date.now().toString(),
      type,
      title: reminderConfig.title,
      message,
      icon: reminderConfig.icon,
      timestamp: new Date(),
    };

    setReminders(prev => [...prev, reminder]);

    // Show browser notification if enabled
    if (isNotificationEnabled) {
      new Notification(reminder.title, {
        body: reminder.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });
    }

    // Auto-remove reminder after 5 seconds
    setTimeout(() => {
      dismissReminder(reminder.id);
    }, 5000);
  };

  const dismissReminder = (id: string) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== id));
  };

  const dismissAllReminders = () => {
    setReminders([]);
  };

  return {
    reminders,
    showReminder,
    dismissReminder,
    dismissAllReminders,
    isNotificationEnabled,
  };
}
