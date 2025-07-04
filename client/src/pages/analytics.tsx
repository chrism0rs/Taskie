import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Target, Star, Calendar, Clock, Trophy, BookOpen, Zap } from "lucide-react";
import { SUBJECTS } from "@/lib/constants";
import Header from "@/components/header";
import SpotifyWidget from "@/components/spotify-widget";

export default function Analytics() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/analytics/stats'],
  });

  const { data: user } = useQuery({
    queryKey: ['/api/user/profile'],
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['/api/tasks'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-baby-pink rounded w-48"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-baby-pink rounded-2xl"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  const completionRate = stats?.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;
  
  // Prepare data for charts
  const subjectData = stats?.tasksBySubject?.map((item: any) => ({
    name: SUBJECTS.find(s => s.value === item.subject)?.label || item.subject,
    value: item.count,
    color: item.subject === 'math' ? 'hsl(348, 83%, 47%)' : 
           item.subject === 'science' ? 'hsl(0, 69%, 42%)' : 
           'hsl(350, 100%, 94%)'
  })) || [];

  const difficultyData = stats?.tasksByDifficulty?.map((item: any) => ({
    difficulty: `Level ${item.difficulty}`,
    tasks: item.count,
    color: item.difficulty >= 4 ? 'hsl(0, 69%, 42%)' : 'hsl(348, 83%, 47%)'
  })) || [];

  // Mock productivity data for the week
  const productivityData = [
    { day: 'Mon', completed: 3, created: 4 },
    { day: 'Tue', completed: 5, created: 3 },
    { day: 'Wed', completed: 2, created: 5 },
    { day: 'Thu', completed: 4, created: 2 },
    { day: 'Fri', completed: 6, created: 3 },
    { day: 'Sat', completed: 1, created: 2 },
    { day: 'Sun', completed: 2, created: 1 },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-cherry-red" />
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">Track your productivity and progress over time</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-soft-white/80 backdrop-blur-sm cute-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Tasks</p>
                  <p className="text-2xl font-bold text-cherry-red">{stats?.totalTasks || 0}</p>
                </div>
                <div className="w-12 h-12 bg-baby-pink rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-cherry-red" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-soft-white/80 backdrop-blur-sm cute-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats?.completedTasks || 0}</p>
                </div>
                <div className="w-12 h-12 bg-baby-pink rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-cherry-red" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-soft-white/80 backdrop-blur-sm cute-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-cherry-red">{completionRate}%</p>
                </div>
                <div className="w-12 h-12 bg-baby-pink rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-cherry-red" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-soft-white/80 backdrop-blur-sm cute-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Points</p>
                  <p className="text-2xl font-bold text-cherry-red">{(user?.totalPoints || 0).toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-baby-pink rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-cherry-red" fill="currentColor" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Subject Breakdown */}
          <Card className="bg-soft-white/80 backdrop-blur-sm cute-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cherry-red" />
                Tasks by Subject
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subjectData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={subjectData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {subjectData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <p>No tasks created yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Difficulty Analysis */}
          <Card className="bg-soft-white/80 backdrop-blur-sm cute-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-cherry-red" />
                Difficulty Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {difficultyData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={difficultyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(350, 100%, 94%)" />
                      <XAxis 
                        dataKey="difficulty" 
                        stroke="hsl(25, 5.3%, 44.7%)"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="hsl(25, 5.3%, 44.7%)"
                        fontSize={12}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(0, 0%, 100%)',
                          border: '1px solid hsl(350, 30%, 90%)',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar 
                        dataKey="tasks" 
                        fill="hsl(348, 83%, 47%)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <p>No tasks created yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Productivity Trends */}
        <Card className="bg-soft-white/80 backdrop-blur-sm cute-shadow mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cherry-red" />
              Weekly Productivity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={productivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(350, 100%, 94%)" />
                  <XAxis 
                    dataKey="day" 
                    stroke="hsl(25, 5.3%, 44.7%)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(25, 5.3%, 44.7%)"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(0, 0%, 100%)',
                      border: '1px solid hsl(350, 30%, 90%)',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke="hsl(348, 83%, 47%)" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(348, 83%, 47%)', strokeWidth: 2 }}
                    name="Completed"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="created" 
                    stroke="hsl(0, 69%, 42%)" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(0, 69%, 42%)', strokeWidth: 2 }}
                    name="Created"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-soft-white/80 backdrop-blur-sm cute-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-cherry-red" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.slice(0, 5).map((task: any) => {
                const subject = SUBJECTS.find(s => s.value === task.subject);
                return (
                  <div key={task.id} className="flex items-center space-x-3 p-3 bg-baby-pink/30 rounded-lg">
                    <div className="w-8 h-8 bg-baby-pink rounded-full flex items-center justify-center">
                      <i className={`fas fa-${subject?.icon || 'book'} text-cherry-red text-xs`}></i>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm">{task.title}</p>
                      <p className="text-xs text-gray-600">{subject?.label} • {task.points} points</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {task.isCompleted ? (
                        <span className="text-green-600 font-medium">✓ Completed</span>
                      ) : (
                        <span className="text-orange-600 font-medium">⏳ Pending</span>
                      )}
                    </div>
                  </div>
                );
              })}
              {tasks.length === 0 && (
                <p className="text-gray-500 text-center py-8">No tasks created yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
      
      <SpotifyWidget />
    </div>
  );
}
