import React from 'react';
import { ProductionEvent } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { TrendingUp, PieChart as PieIcon } from 'lucide-react';

interface StatsViewProps {
  events: ProductionEvent[];
}

export const StatsView: React.FC<StatsViewProps> = ({ events }) => {
  
  // Prepare Data for Cost per Event
  const costPerEvent = events.map(event => ({
    name: (event.title.length > 15 ? event.title.substring(0, 15) + '...' : event.title).toUpperCase(),
    fullTitle: event.title,
    cost: event.shifts.reduce((acc, curr) => acc + (curr.totalInvoiceAmount || curr.agreedSalary || 0), 0)
  }));

  // Prepare Data for Role Distribution
  const roleCounts: Record<string, number> = {};
  events.forEach(e => {
    e.shifts.forEach(s => {
      let role = 'Otros';
      const r = s.role.toLowerCase();
      if (r.includes('camara')) role = 'Cámara';
      else if (r.includes('tecnico') || r.includes('jefe')) role = 'Técnico';
      else if (r.includes('realizador')) role = 'Realización';
      else if (r.includes('auxiliar') || r.includes('asistente')) role = 'Auxiliar';
      else if (r.includes('produccion')) role = 'Producción';
      
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    });
  });

  const roleData = Object.keys(roleCounts).map(key => ({ name: key, value: roleCounts[key] }));
  
  // GOLD & GRAY SCALE
  const COLORS = ['#EAB308', '#CA8A04', '#A16207', '#52525B', '#3F3F46', '#27272A'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <h2 className="text-3xl font-bold text-white tracking-tight uppercase">Analíticas</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Cost Chart */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-bold text-zinc-400 flex items-center gap-2 uppercase tracking-widest">
                <TrendingUp size={16} className="text-yellow-500"/> Coste por Evento
              </h3>
           </div>
           <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={costPerEvent} layout="vertical" margin={{ left: 20 }}>
                 <XAxis type="number" hide />
                 <YAxis dataKey="name" type="category" width={120} tick={{fill: '#71717a', fontSize: 10}} />
                 <Tooltip 
                    contentStyle={{ backgroundColor: '#000', borderColor: '#27272a', color: '#fff' }}
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    formatter={(value: number) => [`${value.toFixed(2)}€`, 'Coste']}
                 />
                 <Bar dataKey="cost" radius={[0, 2, 2, 0]} barSize={16}>
                    {costPerEvent.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={'#EAB308'} />
                    ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Role Distribution */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-bold text-zinc-400 flex items-center gap-2 uppercase tracking-widest">
                <PieIcon size={16} className="text-yellow-500"/> Personal por Roles
              </h3>
           </div>
           <div className="h-[300px] w-full flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={roleData}
                   cx="50%"
                   cy="50%"
                   innerRadius={70}
                   outerRadius={100}
                   paddingAngle={2}
                   dataKey="value"
                   stroke="none"
                 >
                   {roleData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: '#27272a', color: '#fff' }} />
               </PieChart>
             </ResponsiveContainer>
           </div>
           {/* Legend */}
           <div className="flex flex-wrap justify-center gap-4 text-[10px] mt-4 uppercase tracking-wider">
             {roleData.map((entry, index) => (
               <div key={entry.name} className="flex items-center gap-1.5 text-zinc-400">
                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                 {entry.name}
               </div>
             ))}
           </div>
        </div>

      </div>
    </div>
  );
};