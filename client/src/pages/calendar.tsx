import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar as CalendarIcon, Plus, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format, isToday, isSameDay, parseISO } from "date-fns";
import { Task } from "@shared/schema";
import { SUBJECTS } from "@/lib/constants";
import Header from "@/components/header";
import SpotifyWidget from "@/components/spotify-widget";

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const { data: tasks = [] } = useQuery({
    queryKey: ['/api/tasks'],
  });

  const tasksWithDates = tasks.filter((task: Task) => task.dueDate);
  
  const getTasksForDate = (date: Date) => {
    return tasksWithDates.filter((task: Task) => 
      task.dueDate && isSameDay(parseISO(task.dueDate), date)
    );
  };

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  const getDatesWithTasks = () => {
    return tasksWithDates.map((task: Task) => parseISO(task.dueDate!));
  };

  const getUpcomingTasks = () => {
    const now = new Date();
    return tasksWithDates
      .filter((task: Task) => !task.isCompleted && task.dueDate && new Date(task.dueDate) >= now)
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5);
  };

  const upcomingTasks = getUpcomingTasks();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                <CalendarIcon className="w-8 h-8 text-cherry-red" />
                Calendar
              </h1>
              <p className="text-gray-600">Keep track of your task deadlines and schedule</p>
            </div>
            <Button className="bg-cherry-red hover:bg-wine-red">
              <Plus className="w-4 h-4 mr-2" />
              Schedule Task
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card className="bg-soft-white/80 backdrop-blur-sm cute-shadow">
              <CardContent className="p-6">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border-none"
                  classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4",
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-sm font-medium",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                    row: "flex w-full mt-2",
                    cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-baby-pink [&:has([aria-selected].day-outside)]:bg-baby-pink/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
                    day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-baby-pink rounded-md transition-colors",
                    day_range_end: "day-range-end",
                    day_selected: "bg-cherry-red text-white hover:bg-cherry-red hover:text-white focus:bg-cherry-red focus:text-white",
                    day_today: "bg-baby-pink text-cherry-red font-semibold",
                    day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-baby-pink/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                    day_disabled: "text-muted-foreground opacity-50",
                    day_range_middle: "aria-selected:bg-baby-pink aria-selected:text-cherry-red",
                    day_hidden: "invisible",
                  }}
                  modifiers={{
                    hasTasks: getDatesWithTasks(),
                  }}
                  modifiersClassNames={{
                    hasTasks: "bg-cherry-red/10 text-cherry-red font-semibold",
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Date Tasks */}
            <Card className="bg-soft-white/80 backdrop-blur-sm cute-shadow">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
                </h3>
                
                {selectedDateTasks.length === 0 ? (
                  <p className="text-gray-500 text-sm">No tasks scheduled for this date</p>
                ) : (
                  <div className="space-y-3">
                    {selectedDateTasks.map((task: Task) => {
                      const subject = SUBJECTS.find(s => s.value === task.subject);
                      return (
                        <div key={task.id} className="flex items-center space-x-3 p-3 bg-baby-pink/50 rounded-lg">
                          <div className="w-8 h-8 bg-baby-pink rounded-full flex items-center justify-center">
                            <i className={`fas fa-${subject?.icon || 'book'} text-cherry-red text-xs`}></i>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 text-sm">{task.title}</p>
                            <p className="text-xs text-gray-600">{subject?.label}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={task.isCompleted ? "default" : "secondary"}>
                              {task.isCompleted ? "Done" : "Pending"}
                            </Badge>
                            {task.isCompleted ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <Clock className="w-4 h-4 text-orange-500" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card className="bg-soft-white/80 backdrop-blur-sm cute-shadow">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Deadlines</h3>
                
                {upcomingTasks.length === 0 ? (
                  <p className="text-gray-500 text-sm">No upcoming deadlines</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingTasks.map((task: Task) => {
                      const subject = SUBJECTS.find(s => s.value === task.subject);
                      const dueDate = parseISO(task.dueDate!);
                      const isOverdue = dueDate < new Date();
                      
                      return (
                        <div key={task.id} className="flex items-center space-x-3 p-3 bg-baby-pink/30 rounded-lg">
                          <div className="w-8 h-8 bg-baby-pink rounded-full flex items-center justify-center">
                            <i className={`fas fa-${subject?.icon || 'book'} text-cherry-red text-xs`}></i>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 text-sm">{task.title}</p>
                            <p className="text-xs text-gray-600">
                              {isToday(dueDate) ? 'Today' : format(dueDate, 'MMM d, h:mm a')}
                            </p>
                          </div>
                          {isOverdue && (
                            <Badge variant="destructive" className="text-xs">
                              Overdue
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-soft-white/80 backdrop-blur-sm cute-shadow">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Tasks</span>
                    <span className="font-semibold text-cherry-red">{tasksWithDates.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completed</span>
                    <span className="font-semibold text-green-600">
                      {tasksWithDates.filter(t => t.isCompleted).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pending</span>
                    <span className="font-semibold text-orange-600">
                      {tasksWithDates.filter(t => !t.isCompleted).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <SpotifyWidget />
    </div>
  );
}
