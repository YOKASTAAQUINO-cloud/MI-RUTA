
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const initialData = [
  { name: 'Lun', income: 400, target: 500 },
  { name: 'Mar', income: 300, target: 500 },
  { name: 'Mié', income: 800, target: 500 },
  { name: 'Jue', income: 200, target: 500 },
  { name: 'Vie', income: 600, target: 500 },
  { name: 'Sáb', income: 1100, target: 500 },
  { name: 'Dom', income: 0, target: 500 },
];

const IncomeTracker: React.FC = () => {
  const [data, setData] = useState(initialData);
  const [showAdd, setShowAdd] = useState(false);
  const [showEditGoal, setShowEditGoal] = useState(false);
  const [sharingAchievement, setSharingAchievement] = useState<any | null>(null);
  
  const [monthlyGoal, setMonthlyGoal] = useState(10000);
  const [weeklyTarget, setWeeklyTarget] = useState(2500);
  
  const [tempGoal, setTempGoal] = useState(monthlyGoal.toString());
  const [tempWeeklyGoal, setTempWeeklyGoal] = useState(weeklyTarget.toString());
  
  const [newAmount, setNewAmount] = useState('');
  const [day, setDay] = useState('Dom');
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  const handleAddIncome = () => {
    const amount = parseFloat(newAmount);
    if (isNaN(amount)) return;
    
    setData(prev => prev.map(d => 
      d.name === day ? { ...d, income: d.income + amount } : d
    ));
    setNewAmount('');
    setShowAdd(false);
  };

  const handleUpdateGoals = () => {
    const mGoal = parseFloat(tempGoal);
    const wGoal = parseFloat(tempWeeklyGoal);
    
    if (!isNaN(mGoal) && mGoal > 0) setMonthlyGoal(mGoal);
    if (!isNaN(wGoal) && wGoal > 0) setWeeklyTarget(wGoal);
    
    setShowEditGoal(false);
  };

  const getShareMessage = (achievement: any) => {
    return `${achievement.icon} ¡Hito Alcanzado: ${achievement.title}! ✨\n\n"${achievement.affirmation}"\n\nEstoy manifestando mi éxito y elevando mi negocio con Ruta by Titans Stars. 💎 #TitansStars #Abundancia #Emprendedora #HighFrequency`;
  };

  const handleFinalShare = async (achievement: any) => {
    const shareText = getShareMessage(achievement);
    
    if (navigator.share) {
      try { 
        await navigator.share({ 
          title: `Logro Ruta: ${achievement.title}`, 
          text: shareText, 
          url: window.location.href 
        }); 
        setSharingAchievement(null);
      } catch (err) {
        await copyToClipboard(shareText, achievement.id);
      }
    } else {
      await copyToClipboard(shareText, achievement.id);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShareStatus(id);
      setTimeout(() => {
        setShareStatus(null);
        if (sharingAchievement) setSharingAchievement(null);
      }, 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const weeklyTotal = useMemo(() => data.reduce((acc, curr) => acc + curr.income, 0), [data]);
  const weeklyProgressPercent = Math.min(100, (weeklyTotal / weeklyTarget) * 100);
  const monthlyProgressPercent = Math.min(100, (weeklyTotal / monthlyGoal) * 100);

  const achievements = useMemo(() => {
    const consistentDays = data.filter(d => d.income > 0).length;
    return [
      { 
        id: 'consistency', 
        title: 'Reina de la Disciplina', 
        description: '👑 Excelencia en la Rutina', 
        unlocked: consistentDays >= 5, 
        icon: '👑', 
        affirmation: 'Mi disciplina es la llave que abre todas las puertas de la abundancia.' 
      },
      { 
        id: 'weekly', 
        title: 'Guerrera Semanal', 
        description: '🌟 Maestría Semanal', 
        unlocked: weeklyTotal >= weeklyTarget, 
        icon: '🌟', 
        affirmation: 'Domino mi flujo financiero con gracia y autoridad.' 
      },
      { 
        id: 'halfway', 
        title: 'Maestra de Manifestación', 
        description: '✨ 50% Meta Mensual', 
        unlocked: monthlyProgressPercent >= 50, 
        icon: '✨', 
        affirmation: 'Soy un imán para las oportunidades de alta rentabilidad.' 
      },
      { 
        id: 'monthly', 
        title: 'Constructora de Imperios', 
        description: '🏰 Victoria Mensual', 
        unlocked: monthlyProgressPercent >= 100, 
        icon: '🏰', 
        affirmation: 'Mi éxito es inevitable y mi impacto es infinito.' 
      }
    ];
  }, [data, weeklyTotal, weeklyTarget, monthlyProgressPercent]);

  const manifestationAchievement = achievements.find(a => a.id === 'halfway');

  return (
    <div className="space-y-12 animate-fadeIn pb-20">
      {/* Modal de Compartir Estilo Tarjeta Social */}
      {sharingAchievement && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-luxury-burgundy/80 backdrop-blur-md p-6">
          <div className="bg-white rounded-[3rem] max-w-lg w-full p-10 shadow-2xl border border-luxury-gold/30 animate-fadeIn relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 burgundy-gradient"></div>
            
            <button 
              onClick={() => setSharingAchievement(null)} 
              className="absolute top-6 right-6 text-gray-400 hover:text-luxury-burgundy transition-colors text-xl"
            >
              ✕
            </button>

            <div className="text-center space-y-6">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-luxury-gold/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="w-24 h-24 bg-luxury-cream rounded-full flex items-center justify-center text-5xl border border-luxury-gold/20 shadow-inner relative z-10">
                  {sharingAchievement.icon}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-luxury-gold uppercase tracking-[0.4em] mb-2">LOGRO DESBLOQUEADO</p>
                <h3 className="serif text-3xl text-luxury-burgundy italic">{sharingAchievement.title}</h3>
              </div>

              <div className="bg-luxury-cream/30 p-8 rounded-[2rem] border border-luxury-gold/10 italic">
                <p className="text-luxury-burgundy/80 serif text-xl leading-relaxed">
                  "{sharingAchievement.affirmation}"
                </p>
              </div>

              <div className="pt-6 flex flex-col gap-4">
                <button 
                  onClick={() => handleFinalShare(sharingAchievement)}
                  className="w-full burgundy-gradient text-luxury-champagne py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                >
                  <span className="text-lg">📱</span> COMPARTIR EN REDES
                </button>
                <button 
                  onClick={() => copyToClipboard(getShareMessage(sharingAchievement), sharingAchievement.id)}
                  className="w-full bg-white border border-luxury-gold/30 text-luxury-gold py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-luxury-cream transition-all"
                >
                  {shareStatus === sharingAchievement.id ? '¡TEXTO COPIADO!' : 'COPIAR TEXTO DEL LOGRO'}
                </button>
              </div>
              
              <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">
                Ruta by Titans Stars Elite System
              </p>
            </div>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-luxury-gold/10 pb-8">
        <div>
          <p className="text-luxury-gold font-bold uppercase tracking-[0.3em] text-[10px] mb-2">GESTIÓN DE PATRIMONIO</p>
          <h2 className="serif text-4xl text-luxury-burgundy italic">Rastreador de Fortuna</h2>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setShowEditGoal(!showEditGoal)} className="bg-white border border-luxury-gold/30 text-luxury-burgundy px-6 py-2 rounded-full font-bold shadow-sm hover:bg-luxury-blush transition-all text-[10px] uppercase tracking-widest">
            Ajustar Metas
          </button>
          <button onClick={() => setShowAdd(!showAdd)} className="bg-luxury-burgundy text-luxury-champagne px-6 py-2 rounded-full font-bold shadow-xl hover:bg-luxury-claret transition-all text-[10px] uppercase tracking-widest border border-luxury-gold/20">
            {showAdd ? 'Cerrar' : '+ Registrar Venta'}
          </button>
        </div>
      </header>

      {/* Banner Especial para Maestra de Manifestación */}
      {manifestationAchievement?.unlocked && (
        <div className="bg-luxury-gold/10 border border-luxury-gold/30 p-8 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-6 animate-fadeIn relative overflow-hidden">
          <div className="absolute -left-4 -top-4 text-4xl opacity-20">✨</div>
          <div className="absolute -right-4 -bottom-4 text-4xl opacity-20">✨</div>
          <div className="flex items-center gap-6 relative z-10">
            <span className="text-5xl animate-bounce">✨</span>
            <div>
              <h4 className="serif text-2xl text-luxury-burgundy italic">¡Felicidades, Maestra de Manifestación!</h4>
              <p className="text-sm text-luxury-gold font-medium">Has superado el 50% de tu meta mensual. Tu energía está creando abundancia real.</p>
            </div>
          </div>
          <button 
            onClick={() => setSharingAchievement(manifestationAchievement)}
            className="burgundy-gradient text-luxury-champagne px-10 py-4 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-transform flex items-center gap-3 relative z-10"
          >
            <span className="text-lg">🤳</span> COMPARTIR LOGRO ✨
          </button>
        </div>
      )}

      {/* Stats and Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-luxury-gold/10 shadow-sm">
           <div className="flex justify-between items-center mb-10">
              <h3 className="serif text-2xl text-luxury-burgundy italic">Rendimiento Semanal</h3>
              <div className="text-[10px] font-bold text-luxury-gold uppercase tracking-widest">
                Objetivo Semanal: ${weeklyTarget}
              </div>
           </div>
           <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4E4E2" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#D4AF37', fontSize: 10, fontWeight: 'bold' }}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(212, 175, 55, 0.05)' }}
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: '1px solid #D4AF37', 
                    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                    padding: '15px'
                  }}
                />
                <Bar dataKey="income" radius={[10, 10, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.income >= entry.target ? '#4A0E0E' : '#D4AF37'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
           </div>
        </div>

        <div className="space-y-6">
          <div className="bg-luxury-burgundy p-10 rounded-[3rem] shadow-xl text-luxury-champagne relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-60 mb-2">TOTAL SEMANAL</p>
            <h4 className="serif text-4xl italic">${weeklyTotal}</h4>
            <div className="mt-8 space-y-4">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                <span>Progreso</span>
                <span>{weeklyProgressPercent.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-luxury-gold h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${weeklyProgressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-luxury-gold/10 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-bold text-luxury-gold uppercase tracking-[0.4em] mb-2">META MENSUAL</p>
              <h4 className="serif text-2xl text-luxury-burgundy italic">${monthlyGoal}</h4>
              <div className="mt-6 w-full bg-luxury-blush rounded-full h-1">
                <div 
                  className="bg-luxury-burgundy h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${monthlyProgressPercent}%` }}
                ></div>
              </div>
              <p className="text-[9px] text-gray-400 mt-3 font-bold uppercase tracking-widest">Impacto en la visión: {monthlyProgressPercent.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Logros */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="serif text-2xl text-luxury-burgundy italic">Hitos de Abundancia</h3>
          <div className="h-px bg-luxury-gold/20 flex-1 mx-6"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {achievements.map((achievement) => (
            <div 
              key={achievement.id}
              className={`p-8 rounded-[2.5rem] border transition-all duration-500 flex flex-col items-center text-center gap-4 relative group ${
                achievement.unlocked 
                  ? 'bg-white border-luxury-gold/30 shadow-lg scale-105' 
                  : 'bg-gray-50 border-gray-100 grayscale opacity-40'
              }`}
            >
              {achievement.unlocked && (
                <button 
                  onClick={() => setSharingAchievement(achievement)}
                  className="absolute top-4 right-4 text-luxury-gold hover:text-luxury-burgundy transition-colors p-2 bg-luxury-cream/50 rounded-full"
                  title="Compartir logro"
                >
                  📤
                </button>
              )}
              <span className="text-4xl">{achievement.icon}</span>
              <div>
                <h5 className="serif text-lg text-luxury-burgundy italic">{achievement.title}</h5>
                <p className="text-[9px] font-bold text-luxury-gold uppercase tracking-widest mt-1">{achievement.description}</p>
              </div>
              {achievement.unlocked && (
                <button 
                  onClick={() => setSharingAchievement(achievement)}
                  className={`mt-2 font-bold text-[8px] uppercase tracking-widest border-b pb-1 transition-colors ${
                    achievement.id === 'halfway' ? 'text-luxury-gold border-luxury-gold animate-pulse' : 'text-luxury-burgundy border-luxury-gold'
                  }`}
                >
                  {achievement.id === 'halfway' ? 'COMPARTIR ✨' : 'Compartir Éxito'}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Modals for Add Income and Edit Goal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-6">
          <div className="bg-white rounded-[3rem] max-w-sm w-full p-10 shadow-2xl border border-luxury-gold/20 animate-slideUp">
            <h3 className="serif text-2xl text-luxury-burgundy mb-8 italic">Registrar Venta</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-luxury-gold uppercase tracking-widest">Monto ($)</label>
                <input 
                  type="number" 
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full p-4 bg-luxury-cream/30 border-b border-luxury-gold outline-none serif text-2xl text-luxury-burgundy"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-luxury-gold uppercase tracking-widest">Día</label>
                <select 
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="w-full p-4 bg-luxury-cream/30 border-b border-luxury-gold outline-none text-sm text-luxury-burgundy"
                >
                  {data.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cancelar</button>
                <button onClick={handleAddIncome} className="flex-1 burgundy-gradient text-luxury-champagne py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-lg">Confirmar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-6">
          <div className="bg-white rounded-[3rem] max-w-sm w-full p-10 shadow-2xl border border-luxury-gold/20 animate-slideUp">
            <h3 className="serif text-2xl text-luxury-burgundy mb-8 italic">Configurar Metas</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-luxury-gold uppercase tracking-widest">Meta Mensual ($)</label>
                <input 
                  type="number" 
                  value={tempGoal}
                  onChange={(e) => setTempGoal(e.target.value)}
                  className="w-full p-4 bg-luxury-cream/30 border-b border-luxury-gold outline-none serif text-xl text-luxury-burgundy"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-luxury-gold uppercase tracking-widest">Objetivo Semanal ($)</label>
                <input 
                  type="number" 
                  value={tempWeeklyGoal}
                  onChange={(e) => setTempWeeklyGoal(e.target.value)}
                  className="w-full p-4 bg-luxury-cream/30 border-b border-luxury-gold outline-none serif text-xl text-luxury-burgundy"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowEditGoal(false)} className="flex-1 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cancelar</button>
                <button onClick={handleUpdateGoals} className="flex-1 burgundy-gradient text-luxury-champagne py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-lg">Actualizar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomeTracker;
