import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Play, CheckCircle, Circle, Star } from "lucide-react";
import { Task } from "@shared/schema";
import { SUBJECTS, DIFFICULTY_LEVELS } from "@/lib/constants";
import { format } from "date-fns";

interface TaskCardProps {
  task: Task;
  onComplete: (taskId: number) => void;
  onStart: (taskId: number) => void;
}

export default function TaskCard({ task, onComplete, onStart }: TaskCardProps) {
  const subject = SUBJECTS.find(s => s.value === task.subject);
  const difficulty = DIFFICULTY_LEVELS.find(d => d.value === task.difficulty);
  const difficultyPercentage = (task.difficulty / 5) * 100;

  const handleCompleteToggle = () => {
    if (!task.isCompleted) {
      onComplete(task.id);
    }
  };

  const handleStart = () => {
    if (!task.isCompleted) {
      onStart(task.id);
    }
  };

  return (
    <Card className="bg-soft-white/80 backdrop-blur-sm cute-shadow card-hover">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-baby-pink rounded-full flex items-center justify-center">
              <i className={`fas fa-${subject?.icon || 'book'} text-cherry-red`}></i>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">{task.title}</h4>
              <p className="text-sm text-gray-600">{subject?.label || task.subject}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge 
              variant={task.difficulty >= 4 ? "destructive" : "secondary"}
              className={`text-xs ${task.difficulty >= 4 ? 'bg-wine-red text-white' : 'bg-baby-pink text-cherry-red'}`}
            >
              {difficulty?.label || `Level ${task.difficulty}`}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCompleteToggle}
              className="text-gray-400 hover:text-cherry-red p-0 h-auto"
            >
              {task.isCompleted ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Circle className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
          {task.dueDate && (
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="w-3 h-3 mr-1" />
              <span>Due: {format(new Date(task.dueDate), 'PPp')}</span>
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-600">Difficulty</span>
            <span className="text-xs text-cherry-red font-medium">{task.difficulty}/5</span>
          </div>
          <div className="w-full bg-baby-pink rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${task.difficulty >= 4 ? 'bg-wine-red' : 'bg-cherry-red'}`}
              style={{ width: `${difficultyPercentage}%` }}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
            <span className="text-sm font-medium text-gray-700">{task.points} pts</span>
            {task.isCompleted && (
              <span className="text-xs text-green-500 font-medium">✓ Earned</span>
            )}
          </div>
          
          {!task.isCompleted && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStart}
              className="text-cherry-red hover:text-wine-red p-0 h-auto"
            >
              <Play className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
