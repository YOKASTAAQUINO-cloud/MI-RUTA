
import React, { useState, useMemo } from 'react';
import { DailyStrategy } from '../types';

const StrategyCalendar: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());

  const monthInfo = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = firstDay === 0 ? 6 : firstDay - 1; // Ajuste para que lunes sea 0
    
    const days = [];
    for (let i = 0; i < offset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    
    return { days, monthName: now.toLocaleString('es-ES', { month: 'long' }), year };
  }, []);

  // Generador de estrategias diarias sugeridas (Template estratégico para Titans Stars)
  const getStrategyForDay = (day: number): DailyStrategy => {
    const dayOfWeek = (day + monthInfo.days.filter(d => d === null).length - 1) % 7;
    
    const templates = [
      { // Lunes - Mentalidad y Enfoque
        theme: "Inicios de Poder",
        tasks: {
          prospecting: "Conectar con 5 nuevos contactos de alta calidad.",
          education: "Compartir un tip de organización para emprendedoras.",
          selling: "Mencionar indirectamente el beneficio de tu producto estrella.",
          followup: "Seguimiento a las 3 conversaciones más calientes de la semana pasada.",
          interaction: "Comentar en 10 posts de cuentas líderes en tu nicho.",
          positive: "Post de intención: 'Mi éxito es inevitable'."
        }
      },
      { // Martes - Educación
        theme: "Autoridad y Valor",
        tasks: {
          prospecting: "Interactuar con historias de 10 prospectos ideales.",
          education: "Video/Reel explicando el 'por qué' de tu marca.",
          selling: "Compartir un testimonio real de cliente/socio.",
          followup: "Preguntar a 5 personas si vieron la info enviada.",
          interaction: "Responder todas las dudas en tus grupos de apoyo.",
          positive: "Frase de crecimiento: 'Invierto en mi activo más valioso: Yo'."
        }
      },
      { // Miércoles - Resultados
        theme: "Hitos y Evidencia",
        tasks: {
          prospecting: "Invitar a 3 personas a la próxima presentación/llamada.",
          education: "Mostrar el 'Detrás de Escena' de tu flujo de trabajo.",
          selling: "Oferta directa: 'Solo 2 cupos para mentoría personalizada'.",
          followup: "Llamada de cierre con prospectos en duda.",
          interaction: "Agradecer públicamente a un miembro del equipo.",
          positive: "Afirmación de abundancia: 'Dinero fluye hacia mí fácilmente'."
        }
      },
      { // Jueves - Lifestyle/Storytelling
        theme: "Conexión Humana",
        tasks: {
          prospecting: "Retomar contacto con 5 personas que dijeron 'luego'.",
          education: "Lista de 3 herramientas que salvaron tu tiempo hoy.",
          selling: "Storytelling: De dónde venías y a dónde vas gracias al negocio.",
          followup: "Enviar un audio de voz personalizado a 3 clientes VIP.",
          interaction: "Participar en un hilo de networking en Facebook/LinkedIn.",
          positive: "Mensaje de empoderamiento: 'Eres la diseñadora de tu destino'."
        }
      },
      { // Viernes - Estilo de Vida
        theme: "Libertad y Visión",
        tasks: {
          prospecting: "Expandir red: Buscar 5 perfiles similares a tus mejores socios.",
          education: "Tip de belleza/salud relacionado con el bienestar del negocio.",
          selling: "Promoción de fin de semana: Beneficio exclusivo.",
          followup: "Recordatorio de eventos del próximo lunes.",
          interaction: "Hacer una encuesta en historias para conocer a tu audiencia.",
          positive: "Celebración: 'Agradecida por el camino recorrido'."
        }
      },
      { // Sábado - Comunidad
        theme: "Relaciones Genuinas",
        tasks: {
          prospecting: "Conversaciones ligeras: Conectar sin agenda de venta.",
          education: "Resumen de lo aprendido en la semana.",
          selling: "Foto usando el producto en tu vida cotidiana.",
          followup: "Check-in rápido con tu equipo de Titans Stars.",
          interaction: "Compartir contenido de 3 seguidoras fieles.",
          positive: "Frase de descanso activo: 'Repongo mi energía para brillar'."
        }
      },
      { // Domingo - Preparación
        theme: "Planificación Elite",
        tasks: {
          prospecting: "Investigar 10 nuevas cuentas para conectar mañana.",
          education: "Preguntas y Respuestas (Q&A) en historias.",
          selling: "Expectativa para el lanzamiento de la nueva semana.",
          followup: "Organizar lista de contactos para la semana entrante.",
          interaction: "Enviar mensajes de gratitud a 5 personas.",
          positive: "Visión: 'Visualizo mi semana de máximo impacto'."
        }
      }
    ];

    return {
      day,
      ...templates[dayOfWeek]
    };
  };

  const currentStrategy = selectedDay ? getStrategyForDay(selectedDay) : null;

  return (
    <div className="space-y-12 animate-fadeIn pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-luxury-gold/10 pb-8">
        <div>
          <p className="text-luxury-gold font-bold uppercase tracking-[0.3em] text-[10px] mb-2">MAÎTRISE DU TEMPS</p>
          <h2 className="serif text-4xl text-luxury-burgundy italic">Plan Maestro de Contenido</h2>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Calendario Grid */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[3rem] border border-luxury-gold/10 shadow-sm space-y-8">
            <h3 className="serif text-2xl text-luxury-burgundy text-center italic border-b border-luxury-gold/5 pb-4 uppercase tracking-tighter">
              {monthInfo.monthName} {monthInfo.year}
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(d => (
                <div key={d} className="text-center text-[8px] font-bold text-luxury-gold uppercase tracking-widest mb-2">{d}</div>
              ))}
              {monthInfo.days.map((day, idx) => (
                <button
                  key={idx}
                  disabled={!day}
                  onClick={() => day && setSelectedDay(day)}
                  className={`h-10 rounded-xl text-[10px] font-bold transition-all relative group ${
                    !day ? 'opacity-0 cursor-default' : 
                    selectedDay === day ? 'burgundy-gradient text-white shadow-lg scale-110 z-10' : 
                    'bg-luxury-cream/30 text-luxury-gold hover:bg-luxury-blush border border-luxury-gold/5'
                  }`}
                >
                  {day}
                  {day && day === new Date().getDate() && !selectedDay === day && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-luxury-burgundy rounded-full border border-white"></div>
                  )}
                </button>
              ))}
            </div>
            <div className="pt-4 mt-4 border-t border-luxury-gold/5">
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                Selecciona un día para ver tu hoja de ruta estratégica sugerida por Titans Stars Elite.
              </p>
            </div>
          </div>
        </div>

        {/* Detalle de Estrategia */}
        <div className="lg:col-span-2">
          {currentStrategy ? (
            <div className="bg-white p-12 rounded-[3rem] border border-luxury-gold/20 shadow-2xl relative overflow-hidden animate-slideUp">
              <div className="absolute top-0 right-0 w-40 h-40 bg-luxury-blush/20 rounded-full -mr-20 -mt-20 blur-3xl"></div>
              
              <div className="flex justify-between items-start border-b border-luxury-gold/10 pb-8 mb-10">
                <div>
                  <span className="text-[10px] font-bold text-luxury-gold uppercase tracking-[0.4em]">Día {currentStrategy.day}</span>
                  <h3 className="serif text-3xl text-luxury-burgundy mt-2 italic">{currentStrategy.theme}</h3>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-luxury-burgundy flex items-center justify-center shadow-xl">
                  <span className="text-2xl">💎</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div className="group">
                    <p className="text-[9px] font-bold text-luxury-gold uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                      <span className="w-4 h-px bg-luxury-gold"></span> PROSPECCIÓN
                    </p>
                    <p className="text-sm text-luxury-burgundy/80 font-medium leading-relaxed italic border-l-2 border-luxury-blush pl-4 group-hover:border-luxury-gold transition-colors">
                      {currentStrategy.tasks.prospecting}
                    </p>
                  </div>
                  <div className="group">
                    <p className="text-[9px] font-bold text-luxury-gold uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                      <span className="w-4 h-px bg-luxury-gold"></span> EDUCACIÓN
                    </p>
                    <p className="text-sm text-luxury-burgundy/80 font-medium leading-relaxed italic border-l-2 border-luxury-blush pl-4 group-hover:border-luxury-gold transition-colors">
                      {currentStrategy.tasks.education}
                    </p>
                  </div>
                  <div className="group">
                    <p className="text-[9px] font-bold text-luxury-gold uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                      <span className="w-4 h-px bg-luxury-gold"></span> VENTA
                    </p>
                    <p className="text-sm text-luxury-burgundy/80 font-medium leading-relaxed italic border-l-2 border-luxury-blush pl-4 group-hover:border-luxury-gold transition-colors">
                      {currentStrategy.tasks.selling}
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="group">
                    <p className="text-[9px] font-bold text-luxury-gold uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                      <span className="w-4 h-px bg-luxury-gold"></span> SEGUIMIENTO
                    </p>
                    <p className="text-sm text-luxury-burgundy/80 font-medium leading-relaxed italic border-l-2 border-luxury-blush pl-4 group-hover:border-luxury-gold transition-colors">
                      {currentStrategy.tasks.followup}
                    </p>
                  </div>
                  <div className="group">
                    <p className="text-[9px] font-bold text-luxury-gold uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                      <span className="w-4 h-px bg-luxury-gold"></span> INTERACCIÓN
                    </p>
                    <p className="text-sm text-luxury-burgundy/80 font-medium leading-relaxed italic border-l-2 border-luxury-blush pl-4 group-hover:border-luxury-gold transition-colors">
                      {currentStrategy.tasks.interaction}
                    </p>
                  </div>
                  <div className="group">
                    <p className="text-[9px] font-bold text-luxury-gold uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                      <span className="w-4 h-px bg-luxury-gold"></span> MENSAJE POSITIVO
                    </p>
                    <p className="text-sm text-luxury-burgundy/80 font-medium leading-relaxed italic border-l-2 border-luxury-blush pl-4 group-hover:border-luxury-gold transition-colors">
                      {currentStrategy.tasks.positive}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-luxury-gold/10 flex justify-between items-center">
                <button className="text-[9px] font-bold text-luxury-gold uppercase tracking-widest border border-luxury-gold/30 px-6 py-2 rounded-full hover:bg-luxury-gold hover:text-white transition-all">
                  Exportar Hoja de Día
                </button>
                <span className="text-[8px] text-gray-300 font-bold uppercase tracking-widest">Ruta by Titans Stars Elite System</span>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center bg-white/40 rounded-[3rem] border border-dashed border-luxury-gold/20">
              <p className="serif text-xl text-gray-300 italic">Selecciona un día para revelar tu camino...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StrategyCalendar;
