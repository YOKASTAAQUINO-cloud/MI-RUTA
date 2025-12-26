
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { getAIPrioritization } from '../services/geminiService';
import { TaskCategory, Task } from '../types';

const Planner: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [input, setInput] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [settingReminderId, setSettingReminderId] = useState<string | null>(null);
  
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  // Solicitar permiso para notificaciones
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
    }
  }, []);

  // Sistema de monitoreo de recordatorios
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      tasks.forEach(task => {
        if (task.reminderDate && !task.reminderTriggered && !task.completed) {
          const rDate = new Date(task.reminderDate);
          if (rDate <= now) {
            triggerNotification(task);
            setTasks(prev => prev.map(t => 
              t.id === task.id ? { ...t, reminderTriggered: true } : t
            ));
          }
        }
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [tasks]);

  const triggerNotification = (task: Task) => {
    if (permissionStatus === 'granted') {
      new Notification(`📜 Recordatorio: ${task.title}`, {
        body: `Es momento de realizar esta tarea estratégica.`,
        icon: '/favicon.ico',
        tag: `task-${task.id}`,
      });
    }
  };

  const handleAISort = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const taskStrings = input.split('\n').filter(t => t.trim());
      const sortedData = await getAIPrioritization(taskStrings);
      
      const newTasks: Task[] = sortedData.map((t: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        title: t.title,
        category: t.category,
        priority: t.priority,
        reasoning: t.reasoning,
        completed: false,
        date: selectedDate,
        notes: '',
        reminderTriggered: false
      }));

      setTasks(prev => [...prev, ...newTasks]);
      setInput('');
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const updateTaskNotes = (id: string, notes: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, notes } : t));
  };

  const updateTaskTitle = (id: string, title: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, title } : t));
  };

  const setTaskReminder = (id: string, dateStr: string) => {
    if (permissionStatus !== 'granted') requestNotificationPermission();
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, reminderDate: new Date(dateStr).toISOString(), reminderTriggered: false } : t
    ));
    setSettingReminderId(null);
  };

  const deleteTask = (id: string) => {
    if (window.confirm('¿Estás segura de que quieres eliminar esta tarea estratégica?')) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const calendarData = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    
    const days = [];
    for (let i = 0; i < offset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    
    return { days, monthName: now.toLocaleString('es-ES', { month: 'long' }), year, month };
  }, []);

  const getTasksForDate = (dateStr: string) => {
    return tasks.filter(t => t.date === dateStr);
  };

  const currentDayTasks = useMemo(() => getTasksForDate(selectedDate), [tasks, selectedDate]);

  const TaskItem: React.FC<{ task: Task }> = ({ task }) => {
    const isEditing = editingNotesId === task.id;
    const isSettingReminder = settingReminderId === task.id;
    
    return (
      <div 
        className={`p-6 rounded-[2rem] border transition-all flex flex-col gap-4 animate-fadeIn relative overflow-hidden ${
          task.category === TaskCategory.IPA 
            ? 'bg-luxury-cream/40 border-luxury-gold/30 shadow-sm' 
            : 'bg-white border-luxury-gold/10'
        }`}
      >
        {task.reminderTriggered && !task.completed && (
          <div className="absolute top-0 right-0 bg-luxury-claret text-white text-[7px] font-bold px-4 py-1 rounded-bl-xl uppercase tracking-widest animate-pulse">
            Recordatorio Pendiente
          </div>
        )}

        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-5 flex-1">
            <input 
              type="checkbox" 
              checked={task.completed} 
              onChange={() => toggleTask(task.id)}
              className="w-5 h-5 rounded-full border-luxury-gold text-luxury-burgundy focus:ring-luxury-burgundy cursor-pointer accent-luxury-burgundy"
            />
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className={`text-[9px] font-bold px-3 py-0.5 rounded-full uppercase tracking-widest ${
                  task.category === TaskCategory.IPA ? 'bg-luxury-burgundy text-luxury-champagne' : 'bg-luxury-gold/10 text-luxury-gold'
                }`}>
                  {task.category === TaskCategory.IPA ? 'ALTA RENTABILIDAD' : 'MANTENIMIENTO'}
                </span>
                {task.priority === 'high' && <span className="text-[8px] border border-luxury-claret text-luxury-claret px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Urgente</span>}
                {task.reminderDate && !task.completed && (
                  <span className="text-[8px] text-luxury-gold font-bold uppercase tracking-tighter flex items-center gap-1">
                    ⏰ {new Date(task.reminderDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
              {isEditing ? (
                <input
                  type="text"
                  className="w-full mt-2 bg-transparent border-b border-luxury-gold/30 focus:border-luxury-gold outline-none serif text-lg text-luxury-burgundy py-1"
                  value={task.title}
                  onChange={(e) => updateTaskTitle(task.id, e.target.value)}
                  autoFocus
                />
              ) : (
                <p className={`serif text-lg mt-2 ${task.completed ? 'line-through text-gray-300' : 'text-luxury-burgundy'}`}>
                  {task.title}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setSettingReminderId(isSettingReminder ? null : task.id)} 
              className={`p-2 rounded-full transition-all ${isSettingReminder ? 'bg-luxury-gold text-white' : 'text-luxury-gold hover:bg-luxury-cream'}`}
              title="Programar Recordatorio"
            >
              ⏰
            </button>
            <button onClick={() => setEditingNotesId(isEditing ? null : task.id)} className={`p-2 rounded-full transition-all ${isEditing ? 'bg-luxury-burgundy text-white' : 'text-luxury-gold hover:bg-luxury-cream'}`} title="Notas">
              {isEditing ? '✓' : '📝'}
            </button>
            <button onClick={() => deleteTask(task.id)} className="p-2 text-gray-300 hover:text-luxury-claret transition-colors">🗑️</button>
          </div>
        </div>

        {isSettingReminder && (
          <div className="pl-10 pb-4 animate-slideDown">
            <div className="flex flex-col md:flex-row items-center gap-4 bg-luxury-cream/30 p-4 rounded-2xl border border-luxury-gold/20">
              <label className="text-[9px] font-bold text-luxury-burgundy uppercase tracking-widest">Hora de Alerta:</label>
              <input 
                type="datetime-local" 
                className="flex-1 bg-transparent border-none outline-none text-xs text-luxury-burgundy font-medium"
                onChange={(e) => setTaskReminder(task.id, e.target.value)}
              />
              <button onClick={() => setSettingReminderId(null)} className="text-[9px] font-bold text-gray-400 uppercase">Cerrar</button>
            </div>
          </div>
        )}

        {task.reasoning && (
          <div className="pl-10 border-l border-luxury-gold/20">
            <p className="text-[10px] text-luxury-gold/70 italic leading-relaxed">
              <span className="font-bold uppercase tracking-widest mr-2">Estrategia Flow:</span> {task.reasoning}
            </p>
          </div>
        )}

        {(isEditing || task.notes) && (
          <div className="pl-10 animate-fadeIn">
            {isEditing ? (
              <textarea
                className="w-full p-4 rounded-2xl border border-luxury-gold/20 bg-luxury-cream/10 text-xs text-gray-600 focus:ring-1 focus:ring-luxury-gold outline-none min-h-[80px] resize-none"
                placeholder="Detalles estratégicos..."
                value={task.notes || ''}
                onChange={(e) => updateTaskNotes(task.id, e.target.value)}
              />
            ) : (
              <p className="text-[11px] text-gray-500 italic whitespace-pre-wrap">{task.notes}</p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-12 animate-fadeIn pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-luxury-gold/10 pb-8">
        <div>
          <p className="text-luxury-gold font-bold uppercase tracking-[0.3em] text-[10px] mb-2">ATELIER DE PRODUCTIVITÉ</p>
          <h2 className="serif text-4xl text-luxury-burgundy italic">Tu Agenda de Éxito</h2>
        </div>
        
        <div className="flex items-center gap-2 bg-luxury-cream/50 p-1.5 rounded-full border border-luxury-gold/10">
          <button onClick={() => setViewMode('list')} className={`px-6 py-2 rounded-full text-[10px] font-bold tracking-widest transition-all ${viewMode === 'list' ? 'bg-luxury-burgundy text-white shadow-lg' : 'text-luxury-gold hover:text-luxury-burgundy'}`}>LISTA</button>
          <button onClick={() => setViewMode('calendar')} className={`px-6 py-2 rounded-full text-[10px] font-bold tracking-widest transition-all ${viewMode === 'calendar' ? 'bg-luxury-burgundy text-white shadow-lg' : 'text-luxury-gold hover:text-luxury-burgundy'}`}>CALENDARIO</button>
        </div>
      </header>

      {permissionStatus === 'default' && (
        <div className="bg-luxury-gold/10 border border-luxury-gold/30 p-6 rounded-[2rem] flex items-center justify-between gap-4">
          <p className="text-[10px] text-luxury-burgundy italic">Activa las alertas para no perder ninguna Actividad Generadora de Ingresos.</p>
          <button 
            onClick={requestNotificationPermission}
            className="burgundy-gradient text-luxury-champagne px-6 py-2 rounded-full font-bold text-[8px] uppercase tracking-widest"
          >
            ACTIVAR ALERTAS
          </button>
        </div>
      )}

      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-luxury-gold/20 shadow-xl space-y-6">
              <label className="block text-[10px] font-bold text-luxury-gold uppercase tracking-[0.2em]">Depósito de Ideas</label>
              <textarea
                className="w-full h-40 p-5 rounded-[1.5rem] border-none bg-luxury-cream/30 focus:ring-1 focus:ring-luxury-gold outline-none text-sm serif italic text-luxury-burgundy"
                placeholder="Enumera tus tareas sin orden..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button onClick={handleAISort} disabled={loading || !input.trim()} className="w-full burgundy-gradient text-luxury-champagne py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg disabled:opacity-50 hover:scale-[1.02] transition-transform">
                {loading ? 'PRIORIZANDO...' : 'REFINAR CON IA'}
              </button>
            </div>
            
            <div className="bg-luxury-burgundy p-8 rounded-[2rem] text-luxury-champagne relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-50 mb-3">CONSEJO ELITE</p>
              <p className="text-sm italic font-light leading-relaxed">"Enfócate en las tareas que mueven la aguja financiera primero. El resto es ruido."</p>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="serif text-2xl text-luxury-burgundy italic">Estrategia de Hoy</h3>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent border-none text-luxury-gold font-bold text-[10px] tracking-widest outline-none cursor-pointer" />
            </div>
            <div className="space-y-4">
              {currentDayTasks.length > 0 ? (
                currentDayTasks.map(task => <TaskItem key={task.id} task={task} />)
              ) : (
                <div className="text-center py-24 border border-dashed border-luxury-gold/20 rounded-[3rem] bg-white/30">
                  <p className="text-gray-400 italic text-sm">Sin tareas asignadas. Comienza tu plan para hoy.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          <div className="animate-fadeIn bg-white p-12 rounded-[3rem] border border-luxury-gold/10 shadow-sm">
            <h3 className="serif text-2xl text-luxury-burgundy mb-10 text-center italic">{calendarData.monthName} {calendarData.year}</h3>
            <div className="grid grid-cols-7 gap-4">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => <div key={d} className="text-center text-[9px] font-bold text-luxury-gold uppercase tracking-[0.2em] mb-4">{d}</div>)}
              {calendarData.days.map((day, i) => {
                const dateKey = day ? `${calendarData.year}-${String(calendarData.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
                const isSelected = selectedDate === dateKey;
                const dayTasks = day ? getTasksForDate(dateKey) : [];
                const hasIPA = dayTasks.some(t => t.category === TaskCategory.IPA);
                const hasHighPriority = dayTasks.some(t => t.priority === 'high');

                return (
                  <button 
                    key={i} 
                    onClick={() => day && setSelectedDate(dateKey)} 
                    disabled={!day}
                    className={`h-28 rounded-[1.5rem] border transition-all flex flex-col items-center justify-center relative overflow-hidden group ${
                      !day ? 'border-transparent cursor-default' : 
                      isSelected ? 'burgundy-gradient text-white border-none shadow-xl scale-105 z-10' : 
                      dayTasks.length > 0 ? 'bg-luxury-cream/30 border-luxury-gold/20 hover:border-luxury-gold' : 'bg-white border-luxury-gold/5 hover:border-luxury-gold/20'
                    }`}
                  >
                    {day && (
                      <>
                        <span className={`text-sm font-bold mb-2 transition-colors ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-luxury-burgundy'}`}>{day}</span>
                        {dayTasks.length > 0 && (
                          <div className="flex gap-1.5 flex-wrap justify-center px-2">
                            {dayTasks.slice(0, 3).map((t, idx) => (
                              <div 
                                key={idx} 
                                className={`w-2 h-2 rounded-full shadow-sm ${
                                  isSelected ? 'bg-white/50' : 
                                  t.category === TaskCategory.IPA ? 'bg-luxury-burgundy' : 
                                  t.priority === 'high' ? 'bg-luxury-claret' : 'bg-luxury-gold/40'
                                }`} 
                                title={t.title}
                              />
                            ))}
                            {dayTasks.length > 3 && (
                              <span className={`text-[8px] font-bold ${isSelected ? 'text-white/60' : 'text-luxury-gold'}`}>+{dayTasks.length - 3}</span>
                            )}
                          </div>
                        )}
                        <div className="absolute bottom-2 flex gap-1">
                          {hasIPA && !isSelected && <div className="w-1 h-1 bg-luxury-gold rounded-full"></div>}
                          {hasHighPriority && !isSelected && <div className="w-1 h-1 bg-luxury-claret rounded-full"></div>}
                        </div>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-8 animate-slideUp">
             <div className="flex items-center justify-between border-b border-luxury-gold/10 pb-4">
              <h3 className="serif text-2xl text-luxury-burgundy italic">Agenda del {new Date(selectedDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</h3>
              <div className="text-[10px] font-bold text-luxury-gold uppercase tracking-[0.2em]">
                {currentDayTasks.length} Tareas Planificadas
              </div>
            </div>
            <div className="space-y-4">
              {currentDayTasks.length > 0 ? (
                currentDayTasks.map(task => <TaskItem key={task.id} task={task} />)
              ) : (
                <div className="text-center py-20 border border-dashed border-luxury-gold/20 rounded-[3rem] bg-white">
                  <p className="text-gray-400 italic text-sm">No hay tareas programadas para este día.</p>
                  <button onClick={() => setViewMode('list')} className="mt-4 text-[10px] font-bold text-luxury-burgundy uppercase tracking-widest underline decoration-luxury-gold">Añadir Tareas con IA</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Planner;
