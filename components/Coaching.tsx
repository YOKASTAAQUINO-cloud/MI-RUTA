
import React, { useState, useRef, useEffect } from 'react';
import { getCoachingResponse, ai } from '../services/geminiService';
import { Modality, LiveServerMessage } from '@google/genai';

const Coaching: React.FC = () => {
  const [messages, setMessages] = useState<{role: 'user' | 'model', parts: {text: string}[]}[]>([
    { 
      role: 'model', 
      parts: [{ text: "Hola, querida. Soy Flow. ¿Quieres escribirme o prefieres que tengamos una sesión de mentoría por voz para desbloquear tu energía hoy?" }] 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Live API States
  const [liveActive, setLiveActive] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const liveSessionRef = useRef<any>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', parts: [{ text: userMsg }] }]);
    setLoading(true);
    try {
      const response = await getCoachingResponse(messages, userMsg);
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: response }] }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Live API Implementation
  const startLiveSession = async () => {
    setLiveActive(true);
    setIsLive(true);
    
    let nextStartTime = 0;
    const inputAudioContext = new AudioContext({sampleRate: 16000});
    const outputAudioContext = new AudioContext({sampleRate: 24000});
    audioContextRef.current = outputAudioContext;
    const sources = new Set<AudioBufferSourceNode>();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              const base64 = btoa(String.fromCharCode(...new Uint8Array(int16.buffer)));
              sessionPromise.then(s => s.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              const binary = atob(audioData);
              const bytes = new Uint8Array(binary.length);
              for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
              const dataInt16 = new Int16Array(bytes.buffer);
              const buffer = outputAudioContext.createBuffer(1, dataInt16.length, 24000);
              const channelData = buffer.getChannelData(0);
              for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
              
              const source = outputAudioContext.createBufferSource();
              source.buffer = buffer;
              source.connect(outputAudioContext.destination);
              nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
              source.start(nextStartTime);
              nextStartTime += buffer.duration;
              sources.add(source);
            }
            if (msg.serverContent?.interrupted) {
              sources.forEach(s => s.stop());
              sources.clear();
              nextStartTime = 0;
            }
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: 'Eres Flow, coach de élite. Habla con elegancia, firmeza y visión estratégica. Ayuda a la emprendedora a enfocarse en sus AGIs hoy.'
        }
      });
      liveSessionRef.current = await sessionPromise;
    } catch (e) {
      console.error(e);
      stopLiveSession();
    }
  };

  const stopLiveSession = () => {
    setIsLive(false);
    setLiveActive(false);
    if (liveSessionRef.current) liveSessionRef.current.close();
    if (audioContextRef.current) audioContextRef.current.close();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] max-w-4xl mx-auto animate-fadeIn">
      <header className="mb-8 flex justify-between items-end border-b border-luxury-gold/10 pb-6">
        <div>
          <p className="text-luxury-gold font-bold uppercase tracking-[0.3em] text-[10px] mb-2">FLOW ACADEMY</p>
          <h2 className="serif text-4xl text-luxury-burgundy italic">Tu Socia Estratégica</h2>
        </div>
        <button 
          onClick={isLive ? stopLiveSession : startLiveSession}
          className={`px-8 py-3 rounded-full font-bold flex items-center gap-3 transition-all shadow-xl text-[10px] uppercase tracking-widest border ${
            isLive ? 'bg-luxury-blush text-luxury-burgundy border-luxury-burgundy animate-pulse' : 'burgundy-gradient text-luxury-champagne border-luxury-gold/20 hover:scale-105'
          }`}
        >
          {isLive ? '🔴 Sesión Activa' : '🎙️ Sesión de Voz'}
        </button>
      </header>

      {isLive ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-12 bg-white rounded-[3rem] border border-luxury-gold/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-luxury-blush/20 rounded-full -mr-32 -mt-32 blur-[80px]"></div>
          <div className="relative">
            <div className="w-48 h-48 rounded-full bg-luxury-gold/10 animate-ping absolute opacity-30"></div>
            <div className="w-48 h-48 rounded-full bg-luxury-cream flex items-center justify-center relative z-10 border border-luxury-gold/20 shadow-2xl">
              <span className="text-6xl drop-shadow-lg">✨</span>
            </div>
          </div>
          <div className="text-center space-y-4 max-w-md">
            <h3 className="serif text-3xl text-luxury-burgundy italic">Hablando con Flow</h3>
            <p className="text-luxury-gold/80 text-sm italic leading-relaxed">
              "Sintoniza con tu visión más elevada. Cuéntame qué está bloqueando tu flujo hoy."
            </p>
          </div>
          <button 
            onClick={stopLiveSession}
            className="bg-white border border-luxury-gold/30 text-luxury-burgundy px-12 py-3 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-luxury-blush transition-all shadow-md"
          >
            Finalizar Sesión
          </button>
        </div>
      ) : (
        <div className="flex flex-col h-full space-y-6">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto space-y-6 p-8 bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-luxury-gold/10 shadow-inner scrollbar-hide"
          >
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-6 rounded-[2rem] shadow-sm ${
                  m.role === 'user' 
                    ? 'burgundy-gradient text-luxury-champagne rounded-tr-none' 
                    : 'bg-white text-luxury-burgundy border border-luxury-gold/5 rounded-tl-none'
                }`}>
                  <p className="text-sm leading-relaxed">{m.parts[0].text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/80 p-6 rounded-[2rem] rounded-tl-none border border-luxury-gold/10 animate-pulse flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-luxury-gold rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-luxury-gold rounded-full animate-bounce delay-75"></div>
                    <div className="w-1.5 h-1.5 bg-luxury-gold rounded-full animate-bounce delay-150"></div>
                  </div>
                  <span className="text-luxury-gold text-[9px] font-bold uppercase tracking-[0.2em]">Flow está canalizando...</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 p-2 bg-white/60 rounded-full border border-luxury-gold/20 shadow-xl">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Escribe tu consulta estratégica..."
              className="flex-1 bg-transparent px-8 py-4 outline-none text-sm text-luxury-burgundy placeholder:text-luxury-gold/40"
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="burgundy-gradient text-luxury-champagne w-14 h-14 rounded-full flex items-center justify-center hover:scale-105 transition-all shadow-lg active:scale-95"
            >
              <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coaching;
