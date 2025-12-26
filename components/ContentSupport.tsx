
import React, { useState } from 'react';
import { generateContentStrategy } from '../services/geminiService';
import { ContentIdea } from '../types';

const ContentSupport: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState<ContentIdea | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const data = await generateContentStrategy(topic);
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 animate-fadeIn">
      <header className="border-b border-luxury-gold/10 pb-8">
        <p className="text-luxury-gold font-bold uppercase tracking-[0.3em] text-[10px] mb-2">STUDIO CRÉATIF</p>
        <h2 className="serif text-4xl text-luxury-burgundy italic">Estudio de Contenido</h2>
        <p className="text-gray-400 text-sm mt-2 italic font-light">Diseña mensajes que resuenen con tu audiencia ideal.</p>
      </header>

      <div className="bg-white p-10 rounded-[2.5rem] border border-luxury-gold/20 shadow-xl space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-luxury-gold uppercase tracking-[0.2em] ml-2">¿Cuál es el tema de hoy?</label>
          <input 
            type="text" 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ej: Empoderamiento femenino, lanzamiento de producto..." 
            className="w-full p-5 bg-luxury-cream/30 border-b border-luxury-gold/20 rounded-2xl focus:border-luxury-burgundy outline-none serif italic text-luxury-burgundy transition-all"
          />
        </div>
        <button 
          onClick={handleGenerate}
          disabled={loading}
          className="w-full burgundy-gradient text-luxury-champagne py-5 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? 'Consultando a la Musa...' : 'Generar Post de Alta Conversión'}
        </button>
      </div>

      {result && (
        <div className="bg-white p-12 rounded-[3rem] border border-luxury-gold/10 shadow-2xl space-y-10 animate-slideUp relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-luxury-gold/40"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-luxury-gold/5 pb-8">
            <h3 className="serif text-3xl text-luxury-burgundy italic">{result.title}</h3>
            <div className="flex flex-wrap gap-2">
              {result.platforms.map(p => (
                <span key={p} className="text-[9px] font-bold bg-luxury-gold/10 text-luxury-gold px-4 py-1 rounded-full uppercase tracking-widest border border-luxury-gold/20">{p}</span>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] uppercase font-bold text-luxury-gold tracking-[0.3em]">El Gancho (Hook)</p>
            <p className="serif text-2xl italic text-luxury-burgundy leading-relaxed">"{result.hook}"</p>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] uppercase font-bold text-luxury-gold tracking-[0.3em]">La Narrativa (Caption)</p>
            <div className="bg-luxury-cream/20 p-8 rounded-[2rem] border border-luxury-gold/5 text-luxury-burgundy/80 leading-loose text-sm italic font-light whitespace-pre-wrap">
              {result.caption}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <button 
              onClick={() => navigator.clipboard.writeText(`${result.hook}\n\n${result.caption}`)}
              className="text-luxury-gold text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-3 hover:text-luxury-burgundy transition-colors group"
            >
              <span className="p-2 bg-luxury-gold/10 rounded-full group-hover:bg-luxury-gold/20">📋</span> Copiar Estrategia
            </button>
            <div className="flex gap-4">
              <span className="text-[8px] text-gray-300 font-bold uppercase tracking-widest italic">IA Ruta by Titans Stars Elite</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentSupport;
