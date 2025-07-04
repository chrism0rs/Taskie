import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Star, GraduationCap, Calendar, BarChart3, Music, Filter } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Task, User, insertTaskSchema } from "@shared/schema";
import { SUBJECTS, DIFFICULTY_LEVELS, BASE_POINTS, POINT_MULTIPLIERS } from "@/lib/constants";
import Header from "@/components/header";
import TaskCard from "@/components/task-card";
import TaskPieChart from "@/components/pie-chart";
import CelebrationModal from "@/components/celebration-modal";
import SpotifyWidget from "@/components/spotify-widget";
import { Link } from "wouter";

const createTaskSchema = insertTaskSchema.extend({
  dueDate: z.string().optional(),
});

type CreateTaskData = z.infer<typeof createTaskSchema>;

export default function Home() {
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [celebrationTask, setCelebrationTask] = useState<Task | null>(null);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<CreateTaskData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      subject: "",
      difficulty: 1,
      points: BASE_POINTS,
      createdBy: 1, // Mock user ID
    },
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['/api/tasks', selectedSubject, selectedDifficulty],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedSubject) params.append('subject', selectedSubject);
      if (selectedDifficulty && selectedDifficulty !== "all") params.append('difficulty', selectedDifficulty);
      
      const response = await fetch(`/api/tasks?${params}`);
      return response.json();
    },
  });

  const { data: user } = useQuery({
    queryKey: ['/api/user/profile'],
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/analytics/stats'],
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: CreateTaskData) => {
      const response = await apiRequest('POST', '/api/tasks', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/stats'] });
      setIsCreateTaskOpen(false);
      form.reset();
      toast({
        title: "Task created! 📝",
        description: "Your new task has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error creating task",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const response = await apiRequest('POST', `/api/tasks/${taskId}/complete`, {});
      return response.json();
    },
    onSuccess: (completedTask) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      
      setCelebrationTask(completedTask);
      setIsCelebrationOpen(true);
      
      toast({
        title: "Task completed! 🎉",
        description: `You earned ${completedTask.points} points!`,
      });
    },
    onError: () => {
      toast({
        title: "Error completing task",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateTaskData) => {
    const taskData = {
      ...data,
      points: Math.floor(BASE_POINTS * POINT_MULTIPLIERS[data.difficulty as keyof typeof POINT_MULTIPLIERS]),
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
    };
    createTaskMutation.mutate(taskData);
  };

  const handleCompleteTask = (taskId: number) => {
    completeTaskMutation.mutate(taskId);
  };

  const handleStartTask = (taskId: number) => {
    toast({
      title: "Task started! 🚀",
      description: "Good luck with your task!",
    });
  };

  const completedTasks = tasks.filter((task: Task) => task.isCompleted).length;
  const pendingTasks = tasks.length - completedTasks;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <Card className="bg-soft-white/80 backdrop-blur-sm cute-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, cutie! 🌸</h2>
                  <p className="text-gray-600">
                    You have {pendingTasks} tasks pending and {user?.totalPoints || 0} points earned!
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-2">
                    <Star className="w-5 h-5 text-yellow-400" fill="currentColor" />
                    <span className="text-2xl font-bold text-cherry-red">
                      {(user?.totalPoints || 0).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Total Points</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Pie Chart */}
        <div className="mb-8">
          <TaskPieChart completedTasks={completedTasks} pendingTasks={pendingTasks} />
        </div>

        {/* Task Filters */}
        <div className="mb-6">
          <Card className="bg-soft-white/80 backdrop-blur-sm cute-shadow">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filter Tasks
                  </h3>
                  <div className="flex space-x-2">
                    <Button
                      variant={!selectedSubject ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSubject("")}
                      className={!selectedSubject ? "bg-cherry-red hover:bg-wine-red" : ""}
                    >
                      All
                    </Button>
                    {SUBJECTS.slice(0, 4).map((subject) => (
                      <Button
                        key={subject.value}
                        variant={selectedSubject === subject.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedSubject(selectedSubject === subject.value ? "" : subject.value)}
                        className={selectedSubject === subject.value ? "bg-cherry-red hover:bg-wine-red" : ""}
                      >
                        {subject.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {DIFFICULTY_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value.toString()}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-cherry-red hover:bg-wine-red">
                        <Plus className="w-4 h-4 mr-2" />
                        New Task
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create New Task</DialogTitle>
                      </DialogHeader>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter task title" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Enter task description" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Subject</FormLabel>
                                <FormControl>
                                  <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {SUBJECTS.map((subject) => (
                                        <SelectItem key={subject.value} value={subject.value}>
                                          {subject.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="difficulty"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Difficulty</FormLabel>
                                <FormControl>
                                  <Select value={field.value.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select difficulty" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {DIFFICULTY_LEVELS.map((level) => (
                                        <SelectItem key={level.value} value={level.value.toString()}>
                                          {level.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="dueDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Due Date (Optional)</FormLabel>
                                <FormControl>
                                  <Input type="datetime-local" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" className="w-full bg-cherry-red hover:bg-wine-red" disabled={createTaskMutation.isPending}>
                            {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                          </Button>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {tasks.map((task: Task) => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={handleCompleteTask}
              onStart={handleStartTask}
            />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-soft-white/80 backdrop-blur-sm cute-shadow card-hover">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-baby-pink rounded-full flex items-center justify-center mx-auto mb-3">
                <GraduationCap className="text-cherry-red w-6 h-6" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">Study Mode</h4>
              <p className="text-sm text-gray-600 mb-3">Focus time with wellness reminders</p>
              <Link href="/study">
                <Button className="w-full bg-cherry-red text-white hover:bg-wine-red">
                  Start Study
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card className="bg-soft-white/80 backdrop-blur-sm cute-shadow card-hover">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-baby-pink rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="text-cherry-red w-6 h-6" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">Calendar</h4>
              <p className="text-sm text-gray-600 mb-3">View upcoming deadlines</p>
              <Link href="/calendar">
                <Button variant="outline" className="w-full border-cherry-red text-cherry-red hover:bg-cherry-red hover:text-white">
                  View Calendar
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card className="bg-soft-white/80 backdrop-blur-sm cute-shadow card-hover">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-baby-pink rounded-full flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="text-cherry-red w-6 h-6" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">Analytics</h4>
              <p className="text-sm text-gray-600 mb-3">Track your progress</p>
              <Link href="/analytics">
                <Button variant="outline" className="w-full border-cherry-red text-cherry-red hover:bg-cherry-red hover:text-white">
                  View Stats
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card className="bg-soft-white/80 backdrop-blur-sm cute-shadow card-hover">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-baby-pink rounded-full flex items-center justify-center mx-auto mb-3">
                <Music className="text-cherry-red w-6 h-6" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">Music</h4>
              <p className="text-sm text-gray-600 mb-3">Spotify integration</p>
              <Link href="/settings">
                <Button variant="outline" className="w-full border-cherry-red text-cherry-red hover:bg-cherry-red hover:text-white">
                  Connect
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      <SpotifyWidget />
      
      <CelebrationModal
        isOpen={isCelebrationOpen}
        onClose={() => setIsCelebrationOpen(false)}
        completedTask={celebrationTask}
        pointsEarned={celebrationTask?.points || 0}
        totalPoints={user?.totalPoints || 0}
      />
    </div>
  );
}
