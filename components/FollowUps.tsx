
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FollowUp } from '../types';
import { generateFollowUpMessage } from '../services/geminiService';

const FollowUps: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [reminderFilter, setReminderFilter] = useState<string>('all');
  const [leads, setLeads] = useState<FollowUp[]>([
    { id: '1', name: 'Samantha Reed', lastContact: 'hace 2 días', notes: 'Interesada en el paquete de retiro.', status: 'hot', reminderDate: new Date(new Date().getTime() + 60000).toISOString() },
    { id: '2', name: 'Jessica Miller', lastContact: 'hace 1 semana', notes: 'Necesita más info sobre el plan de compensación.', status: 'follow-up-needed', reminderDate: new Date(new Date().getTime() + 120000).toISOString() },
    { id: '3', name: 'Linda K.', lastContact: 'Ayer', notes: 'Esperando el link de inscripción.', status: 'warm' },
  ]);

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [suggestedMessage, setSuggestedMessage] = useState<{ id: string, text: string } | null>(null);
  const [activeReminderId, setActiveReminderId] = useState<string | null>(null);
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [notification, setNotification] = useState<FollowUp | null>(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
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

  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  // Función para disparar notificación del sistema
  const triggerSystemNotification = (lead: FollowUp) => {
    if (permissionStatus === 'granted') {
      const n = new Notification(`💎 Recordatorio: ${lead.name}`, {
        body: `Es momento de elevar la conexión. Notas: ${lead.notes}`,
        icon: '/favicon.ico', 
        tag: `followup-${lead.id}`,
      });
      n.onclick = () => {
        window.focus();
        setNotification(lead);
      };
    }
  };

  // Sistema de monitoreo de recordatorios
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const dueReminder = leads.find(l => {
        if (!l.reminderDate) return false;
        const rDate = new Date(l.reminderDate);
        return rDate <= now;
      });

      if (dueReminder) {
        setNotification(dueReminder);
        triggerSystemNotification(dueReminder);
        setLeads(prev => prev.map(l => 
          l.id === dueReminder.id ? { ...l, reminderDate: undefined } : l
        ));
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [leads, permissionStatus]);

  const getStatusLabel = (status: FollowUp['status']) => {
    switch (status) {
      case 'hot': return 'Prioridad VIP';
      case 'warm': return 'Interesada';
      case 'follow-up-needed': return 'Seguimiento';
      case 'closed': return 'Éxito';
      default: return status;
    }
  };

  const getStatusColor = (status: FollowUp['status']) => {
    switch (status) {
      case 'hot': return 'bg-luxury-burgundy text-luxury-champagne';
      case 'warm': return 'bg-luxury-gold/20 text-luxury-gold';
      case 'follow-up-needed': return 'bg-luxury-blush text-luxury-burgundy';
      case 'closed': return 'bg-green-50 text-green-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const handleSuggestMessage = async (lead: FollowUp) => {
    setLoadingId(lead.id);
    try {
      const message = await generateFollowUpMessage(lead.name, lead.status, lead.notes);
      setSuggestedMessage({ id: lead.id, text: message });
    } catch (error) {
      console.error("Error generating message:", error);
    } finally {
      setLoadingId(null);
    }
  };

  const setReminder = (id: string, dateStr: string) => {
    if (permissionStatus !== 'granted') {
      requestNotificationPermission();
    }
    setLeads(prev => prev.map(l => 
      l.id === id ? { ...l, reminderDate: new Date(dateStr).toISOString() } : l
    ));
    setActiveReminderId(null);
  };

  const updateStatus = (id: string, newStatus: FollowUp['status']) => {
    setLeads(prev => prev.map(l => 
      l.id === id ? { ...l, status: newStatus } : l
    ));
    setEditingStatusId(null);
  };

  const markAsClosed = (id: string) => {
    updateStatus(id, 'closed');
    setLeads(prev => prev.map(l => 
      l.id === id ? { ...l, reminderDate: undefined } : l
    ));
    if (suggestedMessage?.id === id) setSuggestedMessage(null);
    if (activeReminderId === id) setActiveReminderId(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(suggestedMessage?.id || null);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatReminderDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('es-ES', { 
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
    });
  };

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      const matchesReminder = reminderFilter === 'all' 
        || (reminderFilter === 'yes' && !!lead.reminderDate) 
        || (reminderFilter === 'no' && !lead.reminderDate);
      return matchesStatus && matchesReminder;
    });
  }, [leads, statusFilter, reminderFilter]);

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
    return { days, monthName: now.toLocaleString('es-ES', { month: 'long' }), year };
  }, []);

  const getLeadsForDay = (day: number) => {
    return leads.filter(l => {
      if (!l.reminderDate) return false;
      const d = new Date(l.reminderDate);
      return d.getDate() === day && d.getMonth() === new Date().getMonth();
    });
  };

  return (
    <div className="space-y-12 animate-fadeIn relative pb-20">
      {permissionStatus === 'default' && (
        <div className="bg-luxury-gold/10 border border-luxury-gold/30 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4 animate-slideDown">
          <div className="flex items-center gap-4">
            <span className="text-2xl">🔔</span>
            <p className="text-xs font-medium text-luxury-burgundy italic">Activa las notificaciones de sistema para recibir alertas de tus recordatorios élite incluso con la app en segundo plano.</p>
          </div>
          <button 
            onClick={requestNotificationPermission}
            className="burgundy-gradient text-luxury-champagne px-8 py-2 rounded-full font-bold text-[9px] uppercase tracking-widest shadow-md"
          >
            ACTIVAR ALERTAS
          </button>
        </div>
      )}

      {notification && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-luxury-burgundy/60 backdrop-blur-xl p-4">
          <div className="bg-white rounded-[3rem] p-12 max-w-sm w-full shadow-2xl border border-luxury-gold/20 text-center animate-fadeIn relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 burgundy-gradient"></div>
            <div className="text-5xl mb-6">💎</div>
            <h3 className="serif text-2xl text-luxury-burgundy mb-2 italic">Momento de Impacto</h3>
            <p className="text-gray-500 mb-8 font-light italic">Es hora de reconectar con <strong>{notification.name}</strong> y elevar la relación.</p>
            <div className="bg-luxury-cream/50 p-6 rounded-2xl mb-8 text-xs italic text-luxury-gold border border-luxury-gold/10">
              "{notification.notes}"
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="w-full burgundy-gradient text-luxury-champagne py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg"
            >
              PROCEDER AL CONTACTO
            </button>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-luxury-gold/10 pb-8">
        <div>
          <p className="text-luxury-gold font-bold uppercase tracking-[0.3em] text-[10px] mb-2">CERCLE D'INFLUENCE</p>
          <h2 className="serif text-4xl text-luxury-burgundy italic">Conexiones Élite</h2>
        </div>
        
        <div className="flex items-center gap-2 bg-luxury-cream/50 p-1.5 rounded-full border border-luxury-gold/10">
          <button onClick={() => setViewMode('list')} className={`px-6 py-2 rounded-full text-[10px] font-bold tracking-widest transition-all ${viewMode === 'list' ? 'bg-luxury-burgundy text-white shadow-lg' : 'text-luxury-gold hover:text-luxury-burgundy'}`}>LISTA</button>
          <button onClick={() => setViewMode('calendar')} className={`px-6 py-2 rounded-full text-[10px] font-bold tracking-widest transition-all ${viewMode === 'calendar' ? 'bg-luxury-burgundy text-white shadow-lg' : 'text-luxury-gold hover:text-luxury-burgundy'}`}>CALENDARIO</button>
        </div>
      </header>

      {viewMode === 'list' ? (
        <div className="space-y-10">
          <div className="flex flex-wrap items-center gap-8 bg-white p-6 rounded-[2rem] border border-luxury-gold/10 shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-[10px] font-bold text-luxury-gold uppercase tracking-[0.2em] mr-2">Filtrar:</span>
              {['all', 'hot', 'warm', 'follow-up-needed', 'closed'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-5 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all border ${
                    statusFilter === status 
                      ? 'burgundy-gradient text-white border-transparent shadow-md' 
                      : 'bg-transparent text-luxury-gold border-luxury-gold/20 hover:border-luxury-gold'
                  }`}
                >
                  {status === 'all' ? 'Todos' : getStatusLabel(status as any)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {filteredLeads.length > 0 ? (
              filteredLeads.map(lead => (
                <div key={lead.id} className="group flex flex-col gap-4 animate-fadeIn">
                  <div className="glass-luxury p-8 rounded-[2.5rem] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-500 hover:border-luxury-gold/40 hover:shadow-xl relative overflow-hidden">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-luxury-blush/30 rounded-full flex items-center justify-center text-luxury-burgundy font-light serif text-2xl border border-luxury-gold/10">
                        {lead.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="serif text-xl text-luxury-burgundy italic">{lead.name}</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Último Contacto: {lead.lastContact}</p>
                        {lead.reminderDate && (
                          <p className="text-[9px] text-luxury-gold font-bold mt-2 flex items-center gap-2 uppercase tracking-tighter">
                            <span className="animate-pulse">⏰</span> RAPPEL: {formatReminderDate(lead.reminderDate)}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1 px-8 hidden md:block">
                      <p className="text-sm text-luxury-gold/60 italic font-light truncate">"{lead.notes}"</p>
                    </div>

                    <div className="flex items-center gap-4">
                      {editingStatusId === lead.id ? (
                        <div className="flex flex-wrap gap-2 animate-fadeIn bg-luxury-cream/50 p-2 rounded-2xl border border-luxury-gold/10">
                          {['hot', 'warm', 'follow-up-needed', 'closed'].map(s => (
                            <button
                              key={s}
                              onClick={() => updateStatus(lead.id, s as any)}
                              className={`text-[8px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest transition-all ${
                                lead.status === s ? 'burgundy-gradient text-white' : 'bg-white text-luxury-gold border border-luxury-gold/10'
                              }`}
                            >
                              {getStatusLabel(s as any)}
                            </button>
                          ))}
                          <button onClick={() => setEditingStatusId(null)} className="text-[8px] font-bold text-gray-400 px-2">X</button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setEditingStatusId(lead.id)}
                          className={`text-[8px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm hover:scale-105 transition-transform ${getStatusColor(lead.status)}`}
                          title="Cambiar Estado"
                        >
                          {getStatusLabel(lead.status)}
                        </button>
                      )}
                      
                      <div className="flex items-center gap-2 bg-luxury-cream/40 rounded-full p-1.5 border border-luxury-gold/10">
                        <button 
                          onClick={() => handleSuggestMessage(lead)}
                          disabled={loadingId === lead.id || lead.status === 'closed'}
                          className="w-10 h-10 rounded-full bg-white text-luxury-burgundy shadow-sm hover:scale-110 transition-transform flex items-center justify-center disabled:opacity-20"
                          title="Sugerencia IA"
                        >
                          {loadingId === lead.id ? '✨' : '🖋️'}
                        </button>
                        <button 
                          onClick={() => setActiveReminderId(activeReminderId === lead.id ? null : lead.id)}
                          disabled={lead.status === 'closed'}
                          className="w-10 h-10 rounded-full bg-white text-luxury-gold shadow-sm hover:scale-110 transition-transform flex items-center justify-center disabled:opacity-20"
                          title="Recordatorio"
                        >
                          📅
                        </button>
                        <button 
                          onClick={() => markAsClosed(lead.id)}
                          disabled={lead.status === 'closed'}
                          className="w-10 h-10 rounded-full bg-white text-green-600 shadow-sm hover:scale-110 transition-transform flex items-center justify-center disabled:bg-green-50 disabled:text-green-200"
                          title="Cerrar Venta"
                        >
                          💎
                        </button>
                      </div>
                    </div>
                  </div>

                  {activeReminderId === lead.id && (
                    <div className="bg-white border border-luxury-gold/20 p-8 rounded-[2rem] mx-8 shadow-2xl animate-slideDown flex flex-col md:flex-row items-center gap-8 border-t-4 border-t-luxury-gold">
                      <label className="text-[10px] font-bold text-luxury-burgundy uppercase tracking-widest">Planificar Recordatorio</label>
                      <input 
                        type="datetime-local" 
                        className="flex-1 p-3 bg-luxury-cream/20 border-b border-luxury-gold outline-none serif text-lg text-luxury-burgundy"
                        onChange={(e) => setReminder(lead.id, e.target.value)}
                      />
                      <button onClick={() => setActiveReminderId(null)} className="text-[9px] font-bold text-gray-400 uppercase tracking-widest hover:text-luxury-claret">Cancelar</button>
                    </div>
                  )}

                  {suggestedMessage?.id === lead.id && (
                    <div className="bg-white p-10 rounded-[3rem] border border-luxury-gold/30 shadow-2xl animate-slideDown mx-8 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                      <p className="text-[9px] font-bold text-luxury-gold uppercase tracking-[0.3em] mb-6">MESSAGERIE ÉLITE RUTA</p>
                      <textarea
                        className="w-full p-8 rounded-[2rem] border border-luxury-gold/10 bg-luxury-cream/10 text-sm text-luxury-burgundy leading-loose italic font-light focus:ring-1 focus:ring-luxury-gold outline-none min-h-[160px] resize-none"
                        value={suggestedMessage.text}
                        onChange={(e) => setSuggestedMessage({ ...suggestedMessage, text: e.target.value })}
                      />
                      <div className="flex justify-end mt-8">
                        <button 
                          onClick={() => copyToClipboard(suggestedMessage.text)}
                          className={`px-10 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg ${
                            copiedId === lead.id ? 'bg-green-600 text-white' : 'burgundy-gradient text-luxury-champagne hover:scale-105'
                          }`}
                        >
                          {copiedId === lead.id ? 'COPIADO' : 'COPIAR EL MESSAGE'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-luxury-gold/20">
                <p className="text-gray-400 italic font-light">No hay contactos en esta categoría.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="animate-fadeIn bg-white p-12 rounded-[3rem] border border-luxury-gold/10 shadow-sm">
          <h3 className="serif text-3xl text-luxury-burgundy mb-12 text-center italic">{calendarData.monthName} {calendarData.year}</h3>
          <div className="grid grid-cols-7 gap-4">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => <div key={d} className="text-center text-[9px] font-bold text-luxury-gold uppercase tracking-[0.2em] mb-6">{d}</div>)}
            {calendarData.days.map((day, idx) => {
              const dayLeads = day ? getLeadsForDay(day) : [];
              const isToday = day === new Date().getDate();
              const isSelected = selectedCalendarDate === day;
              
              return (
                <button
                  key={idx}
                  disabled={!day}
                  onClick={() => day && setSelectedCalendarDate(day)}
                  className={`h-24 rounded-[1.5rem] border transition-all flex flex-col items-center justify-center relative overflow-hidden ${
                    !day ? 'border-transparent' : 
                    isSelected ? 'burgundy-gradient text-white border-none shadow-xl scale-105 z-10' :
                    isToday ? 'bg-luxury-blush/30 border-luxury-gold' :
                    dayLeads.length > 0 ? 'bg-luxury-cream/50 border-luxury-gold/30' : 'bg-white border-luxury-gold/5 hover:border-luxury-gold/20'
                  }`}
                >
                  {day && (
                    <>
                      <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-luxury-burgundy'}`}>{day}</span>
                      {dayLeads.length > 0 && !isSelected && (
                        <div className="mt-2 flex gap-1">
                          {dayLeads.slice(0, 3).map((_, i) => <div key={i} className="w-1 h-1 rounded-full bg-luxury-gold"></div>)}
                        </div>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowUps;
