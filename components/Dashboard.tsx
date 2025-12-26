
import React, { useState, useEffect } from 'react';
import { getMindsetAffirmation } from '../services/geminiService';

const TitansLogo = () => (
  <div className="relative w-48 h-48 mx-auto mb-10 group">
    {/* Efecto de resplandor áurico */}
    <div className="absolute inset-0 bg-luxury-gold/20 rounded-full blur-[40px] opacity-50 group-hover:opacity-80 transition-opacity duration-1000"></div>
    
    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_15px_15px_rgba(212,175,55,0.3)]">
      <defs>
        <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#D4AF37', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#F4E4E2', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#D4AF37', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      {/* Estrella Estilizada (Inspirada en el logo Titans Stars) */}
      <path 
        d="M100 20 L123.5 75 L182.4 75 L135 110 L153 165 L100 130 L47 165 L65 110 L17.6 75 L76.5 75 Z" 
        fill="url(#gold-grad)"
        className="transition-transform duration-700 group-hover:scale-105"
      />
      {/* Detalle Central (Brillo) */}
      <path 
        d="M100 20 L100 130 L153 165 L135 110 L182.4 75 Z" 
        fill="rgba(0,0,0,0.1)"
      />
    </svg>
    
    <div className="absolute -bottom-2 left-0 right-0 text-center">
      <h1 className="serif text-xs font-bold tracking-[0.4em] text-luxury-burgundy uppercase">TITANS STARS</h1>
      <div className="w-10 h-[1px] bg-luxury-gold mx-auto mt-2 opacity-60"></div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [affirmation, setAffirmation] = useState("Elevando tu frecuencia vibratoria...");

  useEffect(() => {
    getMindsetAffirmation().then(setAffirmation);
  }, []);

  return (
    <div className="space-y-12 animate-fadeIn pt-4">
      {/* Brand Identity Section */}
      <TitansLogo />

      <header className="space-y-2 border-b border-luxury-gold/10 pb-8 text-center md:text-left">
        <p className="text-luxury-gold font-bold uppercase tracking-[0.3em] text-[10px]">Bienvenida, Excelencia</p>
        <h2 className="serif text-4xl text-luxury-burgundy italic">Tu Ruta hacia la Grandeza.</h2>
      </header>

      <div className="relative group p-12 rounded-[3rem] bg-white border border-luxury-gold/20 shadow-2xl shadow-luxury-gold/5 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-luxury-gold/40 to-transparent"></div>
        <div className="relative z-10 text-center space-y-6">
          <span className="text-luxury-gold font-bold uppercase tracking-widest text-[10px]">Energía del Día</span>
          <p className="serif text-3xl md:text-4xl text-luxury-burgundy leading-[1.4] max-w-2xl mx-auto italic">
            "{affirmation}"
          </p>
          <div className="w-12 h-[1px] bg-luxury-gold mx-auto opacity-50"></div>
        </div>
        {/* Decoración Luxury */}
        <div className="absolute -bottom-10 -right-10 text-luxury-blush opacity-30 transform rotate-12 scale-150 pointer-events-none">
          <svg width="200" height="200" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[2.5rem] border border-luxury-gold/10 shadow-sm flex flex-col justify-between hover:border-luxury-gold/40 transition-colors duration-500">
          <div>
            <h3 className="serif text-xl text-luxury-burgundy mb-6 italic">Fortuna y Metas</h3>
            <div className="w-full bg-luxury-blush rounded-full h-1.5 overflow-hidden">
              <div className="bg-luxury-gold h-full rounded-full transition-all duration-1000" style={{ width: '65%' }}></div>
            </div>
            <div className="flex justify-between mt-4">
              <p className="text-[10px] font-bold text-luxury-gold uppercase tracking-widest">Actual: 65%</p>
              <p className="text-[10px] font-bold text-luxury-burgundy uppercase tracking-widest">Objetivo: $10k</p>
            </div>
          </div>
          <button className="mt-8 text-luxury-gold font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 group">
            CONSULTAR DETALLES <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>

        <div className="bg-luxury-burgundy p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-3xl"></div>
          <h3 className="serif text-xl text-luxury-champagne mb-6 italic">Prioridad Élite</h3>
          <div className="flex items-center gap-6 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
            <span className="text-3xl text-luxury-gold">💎</span>
            <div>
              <p className="font-semibold text-white tracking-tight text-lg">Adquisición de Clientes VIP</p>
              <p className="text-[10px] text-luxury-champagne font-bold uppercase tracking-widest mt-1">Impacto Máximo</p>
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-8 pt-8">
        <div className="flex items-center justify-between">
          <h3 className="serif text-2xl text-luxury-burgundy italic">Revisión de Rendimiento</h3>
          <div className="h-[1px] bg-luxury-gold/20 flex-1 mx-6"></div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Seguimientos', val: '08', color: 'text-luxury-burgundy' },
            { label: 'Prospectos', val: '03', color: 'text-luxury-gold' },
            { label: 'Estrategia', val: '01', color: 'text-luxury-claret' },
            { label: 'Círculo', val: '02', color: 'text-luxury-burgundy' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-[2rem] border border-luxury-gold/5 shadow-sm text-center hover:shadow-lg transition-all duration-500">
              <span className={`text-4xl font-light serif ${stat.color}`}>{stat.val}</span>
              <div className="w-4 h-[1px] bg-luxury-gold/30 mx-auto my-3"></div>
              <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-gray-400">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
