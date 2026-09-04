import { useTasks } from '../../context/TaskContext';

// stats overview cards on the dashboard
export default function StatsCards() {
  const { stats } = useTasks();

  const cards = [
    {
      label: 'TOTAL TASKS', value: stats?.total || 0,
      iconBg: 'bg-blue-500/20', iconColor: 'text-blue-400',
      icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    },
    {
      label: 'LOW PRIORITY', value: stats?.lowPriority || 0,
      iconBg: 'bg-green-500/20', iconColor: 'text-green-400',
      icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /></svg>,
    },
    {
      label: 'MEDIUM PRIORITY', value: stats?.mediumPriority || 0,
      iconBg: 'bg-orange-500/20', iconColor: 'text-orange-400',
      icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /></svg>,
    },
    {
      label: 'HIGH PRIORITY', value: stats?.highPriority || 0,
      iconBg: 'bg-red-500/20', iconColor: 'text-red-400',
      icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /></svg>,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card, i) => (
        <div key={i} className="bg-dark-card border border-dark-border rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg ${card.iconBg} ${card.iconColor} flex items-center justify-center flex-shrink-0`}>
            {card.icon}
          </div>
          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-bold text-white">{card.value}</p>
            <p className="text-[10px] sm:text-xs text-gray-500 font-medium truncate">{card.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
