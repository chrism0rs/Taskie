import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface PieChartData {
  name: string;
  value: number;
  color: string;
}

interface TaskPieChartProps {
  completedTasks: number;
  pendingTasks: number;
}

export default function TaskPieChart({ completedTasks, pendingTasks }: TaskPieChartProps) {
  const data: PieChartData[] = [
    {
      name: 'Completed',
      value: completedTasks,
      color: 'hsl(348, 83%, 47%)', // cherry-red
    },
    {
      name: 'Pending',
      value: pendingTasks,
      color: 'hsl(350, 100%, 94%)', // baby-pink
    },
  ];

  const total = completedTasks + pendingTasks;
  const completedPercentage = total > 0 ? Math.round((completedTasks / total) * 100) : 0;

  return (
    <div className="bg-soft-white/80 backdrop-blur-sm rounded-2xl p-6 cute-shadow">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <i className="fas fa-chart-pie text-cherry-red mr-2"></i>
        Today's Progress
      </h3>
      
      <div className="flex items-center justify-center">
        <div className="relative w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-cherry-red">{completedPercentage}%</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
        </div>
        
        <div className="ml-8">
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-cherry-red rounded-full mr-3"></div>
              <span className="text-gray-700">Completed: {completedTasks}</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-baby-pink rounded-full mr-3"></div>
              <span className="text-gray-700">Pending: {pendingTasks}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
