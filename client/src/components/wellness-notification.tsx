import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Droplet, Activity, Heart } from "lucide-react";
import { WellnessReminder } from "@/hooks/use-wellness";

interface WellnessNotificationProps {
  reminder: WellnessReminder;
  onDismiss: (id: string) => void;
}

const iconMap = {
  droplet: Droplet,
  activity: Activity,
  heart: Heart,
};

export default function WellnessNotification({ reminder, onDismiss }: WellnessNotificationProps) {
  const IconComponent = iconMap[reminder.icon as keyof typeof iconMap] || Heart;

  return (
    <Card className="fixed top-20 right-4 bg-soft-white/90 backdrop-blur-sm cute-shadow max-w-sm z-50 animate-in slide-in-from-right">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-baby-pink rounded-full flex items-center justify-center">
            <IconComponent className="w-5 h-5 text-cherry-red" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800">{reminder.title}</h4>
            <p className="text-sm text-gray-600">{reminder.message}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDismiss(reminder.id)}
            className="text-gray-400 hover:text-cherry-red p-0 h-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
