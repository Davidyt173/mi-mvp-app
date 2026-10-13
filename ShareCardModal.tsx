import React, { useState } from 'react';
import { X, Share2, Download, Check, Sparkles, Heart } from 'lucide-react';
import { DiagnosisRecord } from '../types';

interface ShareCardModalProps {
  diagnosis: DiagnosisRecord | null;
  onClose: () => void;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({ diagnosis, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!diagnosis) return null;

  const handleCopyText = () => {
    const text = `🐾 Plan de Adiestramiento de ${diagnosis.petName} con AdiestraPet Perú 🇵🇪:
Conducta: ${diagnosis.behaviorType}
Diagnóstico: ${diagnosis.petSummary}
Ejercicio de hoy: ${diagnosis.dailyExercise.title} (${diagnosis.dailyExercise.durationMinutes} min)
${diagnosis.peruvianTip}
¡Entrenando con refuerzo positivo y bienestar animal! #AdiestraPetPeru #DogTrainingPeru`;

    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#1F2321] border border-[#354B45] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-[#E1E3DF]">
        {/* Header */}
        <div className="p-3.5 bg-[#191C1B] border-b border-[#2D312E] flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-[#70F6E3]" />
            Tarjeta para Historias (Instagram / WhatsApp)
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#2D312E] text-[#89938E] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Visual Social Card Preview (9:16 aspect feel) */}
        <div className="p-4 overflow-y-auto flex flex-col items-center">
          <div
            id="shareable-pet-card"
            className="w-full bg-gradient-to-b from-[#003833] via-[#004D46] to-[#0A2623] rounded-3xl p-5 border border-[#70F6E3]/30 shadow-2xl relative overflow-hidden text-white flex flex-col justify-between min-h-[460px]"
          >
            {/* Ambient pattern */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#70F6E3]/10 rounded-full blur-2xl pointer-events-none"></div>

            {/* Top branding */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-[#70F6E3] text-[#003833] flex items-center justify-center font-black text-xs">
                  AP
                </div>
                <span className="font-extrabold text-sm tracking-tight">AdiestraPet</span>
                <span className="text-[9px] bg-white/20 px-1.5 py-0.2 rounded font-mono">Perú 🇵🇪</span>
              </div>
              <span className="text-[9px] text-[#A3EEDF] font-semibold uppercase tracking-wider bg-black/30 px-2 py-0.5 rounded-full">
                {diagnosis.engine === 'gemini-3.8-flash' ? 'IA Multimodal Gemini' : 'Etología Positiva'}
              </span>
            </div>

            {/* Pet Center Section */}
            <div className="my-4 text-center z-10 flex flex-col items-center">
              <div className="relative mb-2">
                {diagnosis.imageUrl ? (
                  <img
                    src={diagnosis.imageUrl}
                    alt={diagnosis.petName}
                    className="w-20 h-20 rounded-full object-cover border-3 border-[#70F6E3] shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#006A60] to-[#70F6E3] flex items-center justify-center text-3xl font-extrabold text-stone-900 border-2 border-white shadow-lg">
                    {diagnosis.petName.charAt(0)}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 bg-amber-400 text-stone-900 text-[10px] p-1 rounded-full shadow">
                  🐾
                </span>
              </div>

              <h3 className="text-xl font-black tracking-tight text-white">{diagnosis.petName}</h3>
              <p className="text-xs text-[#A3EEDF] font-medium">{diagnosis.behaviorType}</p>
            </div>

            {/* Mini Plan Box */}
            <div className="bg-black/30 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 z-10 space-y-2 text-left">
              <div>
                <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                  Ejercicio de Hoy
                </span>
                <h4 className="text-xs font-bold text-white">
                  {diagnosis.dailyExercise.title} ({diagnosis.dailyExercise.durationMinutes} min)
                </h4>
                <p className="text-[10px] text-white/80 line-clamp-2 mt-0.5">
                  {diagnosis.dailyExercise.instructions}
                </p>
              </div>

              <div className="border-t border-white/10 pt-2 flex items-center justify-between text-[10px] text-[#A3EEDF]">
                <span>Refuerzo 100% positivo</span>
                <span>Sin castigos físicos ❤️</span>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="pt-3 text-center z-10">
              <p className="text-[9px] text-white/70">
                {diagnosis.peruvianTip}
              </p>
              <span className="text-[9px] font-mono text-[#70F6E3] tracking-widest block mt-1">
                APP.ADIESTRAPET.PE
              </span>
            </div>
          </div>

          {/* Social share actions */}
          <div className="w-full grid grid-cols-2 gap-2 mt-4">
            <button
              onClick={handleCopyText}
              className="py-2.5 px-3 rounded-xl bg-[#2D312E] hover:bg-[#354B45] text-xs font-bold text-white flex items-center justify-center gap-1.5 transition"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#70F6E3]" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-[#70F6E3]" />
                  <span>Copiar Resumen</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                alert('¡Tarjeta lista para capturar o compartir en tus redes!');
              }}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#006A60] to-[#008779] text-xs font-bold text-white flex items-center justify-center gap-1.5 transition shadow"
            >
              <Download className="w-4 h-4" />
              <span>Guardar Imagen</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
