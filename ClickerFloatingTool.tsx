import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, X, ChevronUp, ChevronDown, Sliders } from 'lucide-react';
import { audioTrainingService } from '../services/audioService';

interface ClickerFloatingToolProps {
  onIncrementRep?: () => void;
}

export const ClickerFloatingTool: React.FC<ClickerFloatingToolProps> = ({ onIncrementRep }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [clickCount, setClickCount] = useState<number>(0);
  const [isWhistling, setIsWhistling] = useState<boolean>(false);
  const [frequency, setFrequency] = useState<number>(14000);
  const [lastClickTime, setLastClickTime] = useState<string>('');

  const handleClick = () => {
    audioTrainingService.playClicker();
    setClickCount((prev) => prev + 1);
    setLastClickTime(new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    if (onIncrementRep) onIncrementRep();
  };

  const handleToggleWhistle = () => {
    if (isWhistling) {
      audioTrainingService.stopWhistle();
      setIsWhistling(false);
    } else {
      audioTrainingService.startWhistle(frequency);
      setIsWhistling(true);
      // Auto-stop after 4 seconds for pet comfort
      setTimeout(() => {
        audioTrainingService.stopWhistle();
        setIsWhistling(false);
      }, 4000);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end">
      {/* Expanded Tools Panel */}
      {isOpen && (
        <div className="mb-2 w-72 bg-[#1F2321] border border-[#354B45] rounded-3xl p-4 shadow-2xl animate-in slide-in-from-bottom-3 duration-200 text-[#E1E3DF]">
          <div className="flex items-center justify-between border-b border-[#2D312E] pb-2 mb-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#70F6E3] animate-pulse"></span>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Herramientas de Refuerzo
              </h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-[#2D312E] text-[#89938E]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Clicker interactive widget */}
          <div className="bg-[#242826] p-3 rounded-2xl border border-[#354B45]/60 mb-3 text-center">
            <div className="flex items-center justify-between text-[11px] text-[#89938E] mb-1">
              <span>Marcador Clicker</span>
              <span className="font-mono text-[#70F6E3]">{clickCount} clics</span>
            </div>

            <button
              onClick={handleClick}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#006A60] to-[#008779] active:scale-95 text-white font-extrabold text-base flex flex-col items-center justify-center gap-1 shadow-lg shadow-[#006A60]/40 transition hover:brightness-110"
            >
              <div className="w-8 h-2 rounded-full bg-[#70F6E3]/60 mb-0.5"></div>
              <span>¡CLICK!</span>
              <span className="text-[10px] font-normal text-white/80">Toca para marcar acierto</span>
            </button>

            <p className="text-[10px] text-[#A3EEDF] mt-2 italic">
              Regla de oro: El snack debe entregarse dentro de los 0.8s posteriores al click.
            </p>
          </div>

          {/* High Frequency Whistle Widget */}
          <div className="bg-[#242826] p-3 rounded-2xl border border-[#354B45]/60">
            <div className="flex items-center justify-between text-[11px] text-[#89938E] mb-2">
              <span className="flex items-center gap-1">
                <Sliders className="w-3 h-3 text-[#70F6E3]" />
                Silbato Canino Ultrasónico
              </span>
              <span className="font-mono text-white text-[10px]">{frequency} Hz</span>
            </div>

            <input
              type="range"
              min={10000}
              max={18000}
              step={500}
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              className="w-full h-1.5 bg-[#354B45] rounded-lg appearance-none cursor-pointer accent-[#70F6E3] mb-2"
            />

            <button
              onClick={handleToggleWhistle}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                isWhistling
                  ? 'bg-amber-500 text-stone-900 animate-pulse'
                  : 'bg-[#2D312E] hover:bg-[#354B45] text-[#C4C7C5]'
              }`}
            >
              {isWhistling ? (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>Silbando ({frequency} Hz)...</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-[#70F6E3]" />
                  <span>Emitir Tono Ultrasónico</span>
                </>
              )}
            </button>
            <span className="text-[9px] text-[#89938E] block text-center mt-1">
              Apagado automático de seguridad tras 4 segundos.
            </span>
          </div>
        </div>
      )}

      {/* Floating Pill Trigger */}
      <div className="flex items-center gap-1.5 bg-[#1F2321] border border-[#354B45] p-1.5 rounded-full shadow-xl">
        <button
          onClick={handleClick}
          className="px-3.5 py-2 rounded-full bg-gradient-to-r from-[#006A60] to-[#008779] active:scale-90 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#006A60]/30 transition hover:brightness-110"
          title="Hacer clic"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#70F6E3]" />
          <span>Clicker ({clickCount})</span>
        </button>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-full hover:bg-[#2D312E] text-[#70F6E3] transition"
          title="Abrir herramientas de audio"
        >
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
