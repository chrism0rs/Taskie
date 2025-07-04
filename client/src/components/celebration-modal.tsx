import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, Trophy, Sparkles } from "lucide-react";
import { Task } from "@shared/schema";

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedTask: Task | null;
  pointsEarned: number;
  totalPoints: number;
}

export default function CelebrationModal({
  isOpen,
  onClose,
  completedTask,
  pointsEarned,
  totalPoints,
}: CelebrationModalProps) {
  if (!completedTask) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4 bg-soft-white rounded-2xl cute-shadow p-8 text-center">
        <div className="celebration-bounce">
          <div className="w-16 h-16 bg-cherry-red rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="text-white w-8 h-8" />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            Congratulations! 
            <Sparkles className="w-6 h-6 text-yellow-400" />
          </h3>
          
          <p className="text-gray-600 mb-6">
            You completed "{completedTask.title}" and earned {pointsEarned} points!
          </p>
          
          <div className="flex items-center justify-center space-x-8 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-cherry-red">+{pointsEarned}</div>
              <div className="text-sm text-gray-600">Points</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cherry-red">{totalPoints.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
          
          <div className="flex justify-center space-x-2 mb-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-6 h-6 ${i < Math.min(completedTask.difficulty, 5) ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
              />
            ))}
          </div>
          
          <Button
            onClick={onClose}
            className="w-full bg-cherry-red hover:bg-wine-red text-white py-3 rounded-full font-medium transition-colors"
          >
            Keep Going! 💪
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
