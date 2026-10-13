import React, { useState } from 'react';
import {
  Sparkles,
  Camera,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Share2,
  History,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  X,
  FileText,
  Lightbulb,
} from 'lucide-react';
import { Pet, DiagnosisRecord } from '../types';
import { storageService } from '../services/storage';
import { audioTrainingService } from '../services/audioService';

interface DiagnosisScreenProps {
  activePet: Pet | null;
  isPremium: boolean;
  onOpenPaywall: (reason?: string) => void;
  onOpenShareCard: (record: DiagnosisRecord) => void;
}

export const DiagnosisScreen: React.FC<DiagnosisScreenProps> = ({
  activePet,
  isPremium,
  onOpenPaywall,
  onOpenShareCard,
}) => {
  const [behaviorText, setBehaviorText] = useState<string>('');
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [selectedImageMime, setSelectedImageMime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentResult, setCurrentResult] = useState<DiagnosisRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<'nuevo' | 'historial'>('nuevo');
  const [history, setHistory] = useState<DiagnosisRecord[]>(storageService.getDiagnoses());

  // Quick preset behavioral problems common in Peru
  const quickPresets = [
    'Ladra desesperado cuando tocan el interfono o timbre del departamento',
    'Tira muy fuerte de la correa durante el paseo en el parque',
    'Muerde las manos y los tobillos jugando como si fueran presas',
    'Salta sobre las visitas de forma descontrolada al entrar a casa',
    'Pánico y temblores cuando revientan cohetones o pirotecnia',
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('La imagen no debe superar los 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImageBase64(reader.result as string);
      setSelectedImageMime(file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleRunDiagnosis = async () => {
    if (!behaviorText.trim()) {
      setErrorMsg('Por favor describe la conducta o situación que observas en tu mascota.');
      return;
    }

    // Commercial paywall check: free users can test 1 diagnosis, or require subscription
    const existingDiagnoses = storageService.getDiagnoses();
    if (!isPremium && existingDiagnoses.length >= 1) {
      onOpenPaywall('Has usado tu diagnóstico de prueba gratuito. Suscríbete para diagnósticos multimodales ilimitados con IA.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const payload = {
        petName: activePet?.name || 'Mascota',
        petSpecies: activePet?.species || 'perro',
        petAge: `${activePet?.ageYears || 1} años`,
        petBreed: activePet?.breed || 'Mestizo',
        behaviorDescription: behaviorText,
        imageBase64: selectedImageBase64 || undefined,
        imageMimeType: selectedImageMime || undefined,
        isPeruvianContext: true,
      };

      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        const record: DiagnosisRecord = {
          id: `diag_${Date.now()}`,
          date: new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }),
          petName: activePet?.name || 'Mascota',
          petSpecies: activePet?.species || 'perro',
          behaviorDescription: behaviorText,
          imageUrl: selectedImageBase64 || undefined,
          engine: data.engine === 'gemini-3.8-flash' ? 'gemini-3.8-flash' : 'sistema_experto_reglas',
          petSummary: data.petSummary,
          behaviorType: data.behaviorType,
          urgencyLevel: data.urgencyLevel,
          professionalWarning: data.professionalWarning,
          warningDetails: data.warningDetails,
          possibleCauses: data.possibleCauses || [],
          positiveSteps: data.positiveSteps || [],
          dailyExercise: data.dailyExercise,
          recommendedModules: data.recommendedModules || [],
          peruvianTip: data.peruvianTip,
          shareSummary: data.shareSummary,
        };

        storageService.saveDiagnosis(record);
        setHistory(storageService.getDiagnoses());
        setCurrentResult(record);
        audioTrainingService.playSuccessChime();
        storageService.unlockAchievement('ach_diagnostico_ia');
      } else {
        setErrorMsg('No se pudo procesar la solicitud de diagnóstico. Inténtalo nuevamente.');
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg('Error de red al conectar con el motor de IA.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24 text-[#E1E3DF]">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Diagnóstico IA Multimodal
            </h2>
            <span className="text-[10px] bg-gradient-to-r from-amber-400 to-amber-500 text-stone-900 font-extrabold px-2 py-0.5 rounded-full uppercase">
              WOW
            </span>
          </div>
          <p className="text-xs text-[#89938E] mt-0.5">
            Etología clínica canina con refuerzo positivo adaptada a Perú.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex bg-[#242826] p-1 rounded-2xl border border-[#354B45] text-xs">
          <button
            onClick={() => setViewTab('nuevo')}
            className={`px-3 py-1 rounded-xl font-medium transition ${
              viewTab === 'nuevo' ? 'bg-[#006A60] text-white' : 'text-[#89938E]'
            }`}
          >
            Evaluar
          </button>
          <button
            onClick={() => setViewTab('historial')}
            className={`px-3 py-1 rounded-xl font-medium transition flex items-center gap-1 ${
              viewTab === 'historial' ? 'bg-[#006A60] text-white' : 'text-[#89938E]'
            }`}
          >
            <History className="w-3 h-3" />
            <span>({history.length})</span>
          </button>
        </div>
      </div>

      {viewTab === 'historial' ? (
        /* Historial View */
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12 bg-[#242826] rounded-3xl border border-[#354B45] p-6 space-y-2">
              <History className="w-8 h-8 text-[#89938E] mx-auto opacity-50" />
              <h4 className="text-sm font-bold text-white">Sin diagnósticos previos</h4>
              <p className="text-xs text-[#89938E]">
                Describe la primera conducta de {activePet?.name || 'tu mascota'} en la pestaña "Evaluar".
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setCurrentResult(item);
                  setViewTab('nuevo');
                }}
                className="bg-[#242826] rounded-3xl p-4 border border-[#354B45] hover:border-[#70F6E3] transition cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{item.behaviorType}</span>
                  <span className="text-[10px] text-[#89938E] font-mono">{item.date}</span>
                </div>
                <p className="text-xs text-[#C4C7C5] line-clamp-2">
                  "{item.behaviorDescription}"
                </p>
                <div className="pt-2 border-t border-[#2D312E] flex items-center justify-between text-[11px]">
                  <span className="text-[#A3EEDF] font-medium">Ver plan completo</span>
                  <span className="text-[10px] bg-[#354B45] px-2 py-0.5 rounded text-[#70F6E3]">
                    {item.engine === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'Reglas Clínicas'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : currentResult ? (
        /* Result Detail View */
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Top Result Banner */}
          <div className="bg-[#242826] rounded-3xl p-5 border border-[#354B45] shadow-lg space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] bg-[#006A60] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Evaluación para {currentResult.petName}
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  {currentResult.behaviorType}
                </h3>
              </div>
              <button
                onClick={() => onOpenShareCard(currentResult)}
                className="flex items-center gap-1.5 text-xs bg-[#2D312E] hover:bg-[#354B45] text-[#70F6E3] border border-[#006A60] px-3 py-1.5 rounded-xl font-bold transition shadow"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Tarjeta Social</span>
              </button>
            </div>

            <p className="text-xs text-[#C4C7C5] leading-relaxed">
              {currentResult.petSummary}
            </p>

            <div className="flex items-center gap-2 pt-1 text-[11px]">
              <span className="text-[#89938E]">Nivel de Atención:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                  currentResult.urgencyLevel.includes('Alerta')
                    ? 'bg-red-950 text-red-300 border border-red-700'
                    : 'bg-[#354B45] text-[#70F6E3]'
                }`}
              >
                {currentResult.urgencyLevel}
              </span>
              <span className="text-[10px] text-[#89938E] font-mono ml-auto">
                Motor: {currentResult.engine === 'gemini-3.8-flash' ? 'Gemini IA' : 'Reglas LIMA'}
              </span>
            </div>
          </div>

          {/* Professional / Veterinary Warning if applicable */}
          {currentResult.professionalWarning && (
            <div className="bg-red-950/40 border-2 border-red-700 rounded-3xl p-4 space-y-2 text-xs text-red-200">
              <div className="flex items-center gap-2 text-red-400 font-bold">
                <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                <span className="uppercase tracking-wider">Advertencia de Seguridad y Bienestar Animal</span>
              </div>
              <p className="leading-relaxed">
                {currentResult.warningDetails ||
                  'Se detectan señales de dolor físico o riesgo elevado de agresión. Antes de aplicar entrenamiento conductual, es indispensable descartar patologías orgánicas con un médico veterinario colegiado.'}
              </p>
            </div>
          )}

          {/* Causes Accordion */}
          <div className="bg-[#242826] rounded-3xl p-4 border border-[#354B45] space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              Posibles Causas Etológicas
            </h4>
            <ul className="space-y-1.5 text-xs text-[#C4C7C5]">
              {currentResult.possibleCauses.map((cause, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#70F6E3] mt-1.5 flex-shrink-0"></span>
                  <span>{cause}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Mini-Plan: Positive Reinforcement Steps */}
          <div className="bg-[#242826] rounded-3xl p-4 border border-[#354B45] space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#70F6E3]" />
              Mini-Plan de Refuerzo Positivo (3 a 5 Pasos)
            </h4>
            <div className="space-y-2">
              {currentResult.positiveSteps.map((step, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-[#1F2321] border border-[#354B45] text-xs">
                  <span className="font-semibold text-white block mb-0.5">Paso {idx + 1}</span>
                  <p className="text-[#C4C7C5] leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Daily Exercise */}
          <div className="bg-gradient-to-br from-[#004D44] to-[#0A332F] rounded-3xl p-5 border border-[#70F6E3]/40 shadow-lg text-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] bg-amber-400 text-stone-900 font-extrabold px-2 py-0.5 rounded-full uppercase">
                Ejercicio para Hoy
              </span>
              <span className="text-xs text-[#A3EEDF] flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3" />
                {currentResult.dailyExercise.durationMinutes} min
              </span>
            </div>
            <h4 className="text-base font-bold">{currentResult.dailyExercise.title}</h4>
            <p className="text-xs text-white/90 leading-relaxed">
              {currentResult.dailyExercise.instructions}
            </p>
          </div>

          {/* Peruvian Urban Context Tip */}
          <div className="bg-[#242826] rounded-3xl p-4 border border-[#354B45] space-y-1.5 text-xs">
            <span className="font-bold text-[#70F6E3] flex items-center gap-1.5">
              <span>🇵🇪</span>
              <span>Recomendación Local para Perú</span>
            </span>
            <p className="text-[#C4C7C5] leading-relaxed">
              {currentResult.peruvianTip}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => setCurrentResult(null)}
              className="flex-1 py-3 px-4 rounded-full bg-[#2D312E] hover:bg-[#354B45] text-xs font-bold text-white transition text-center"
            >
              Nueva Consulta
            </button>
            <button
              onClick={() => onOpenShareCard(currentResult)}
              className="flex-1 py-3 px-4 rounded-full bg-gradient-to-r from-[#006A60] to-[#008779] text-xs font-bold text-white transition text-center shadow"
            >
              Compartir en Redes
            </button>
          </div>
        </div>
      ) : (
        /* New Diagnosis Input Form */
        <div className="space-y-4">
          <div className="bg-[#242826] rounded-3xl p-4 border border-[#354B45] space-y-3 shadow-md">
            <div>
              <label className="text-xs font-bold text-white flex items-center justify-between">
                <span>¿Qué conducta deseas evaluar en {activePet?.name || 'tu mascota'}?</span>
                <span className="text-[10px] text-[#89938E]">Refuerzo Positivo</span>
              </label>
              <textarea
                value={behaviorText}
                onChange={(e) => setBehaviorText(e.target.value)}
                placeholder="Ejemplo: Cada vez que suena el timbre o pasa una moto de delivery por la calle, corre hacia la puerta ladrando con desesperación..."
                rows={4}
                className="w-full mt-2 p-3 rounded-2xl bg-[#191C1B] border border-[#354B45] text-xs text-white placeholder-[#89938E] focus:outline-none focus:border-[#70F6E3] leading-relaxed resize-none"
              />
            </div>

            {/* Quick preset chips */}
            <div>
              <span className="text-[10px] text-[#89938E] font-medium block mb-1.5">
                Casos frecuentes en Perú:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setBehaviorText(preset)}
                    className="text-[10px] bg-[#1F2321] hover:bg-[#2D312E] text-[#A3EEDF] border border-[#354B45] px-2.5 py-1 rounded-full text-left transition"
                  >
                    {preset.length > 40 ? preset.substring(0, 40) + '...' : preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Upload / Camera for Multimodal AI */}
            <div className="border-t border-[#2D312E] pt-3">
              <label className="text-xs font-bold text-white flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-[#70F6E3]" />
                  Fotografía de la Mascota o Entorno (Opcional Multimodal)
                </span>
                <span className="text-[10px] text-[#70F6E3]">Visión IA</span>
              </label>

              {selectedImageBase64 ? (
                <div className="relative rounded-2xl overflow-hidden border border-[#70F6E3] h-36 bg-black">
                  <img
                    src={selectedImageBase64}
                    alt="Mascota para diagnóstico"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImageBase64(null);
                      setSelectedImageMime(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-[#354B45] hover:border-[#70F6E3] bg-[#191C1B] cursor-pointer transition text-center group">
                  <Upload className="w-5 h-5 text-[#89938E] group-hover:text-[#70F6E3] mb-1 transition" />
                  <span className="text-xs font-semibold text-white">
                    Toma una foto o sube desde la galería
                  </span>
                  <span className="text-[10px] text-[#89938E] mt-0.5">
                    Permite a Gemini analizar postura corporal, orejas y cola (PNG, JPG hasta 8MB)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Run Button */}
            <button
              onClick={handleRunDiagnosis}
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-full bg-gradient-to-r from-[#006A60] to-[#008779] hover:from-[#008779] hover:to-[#70F6E3] text-white hover:text-stone-950 font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-[#006A60]/30 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#70F6E3]" />
                  <span>Analizando etología con Gemini 3.8 Flash...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generar Mini-Plan de Refuerzo Positivo</span>
                </>
              )}
            </button>
          </div>

          {/* Ethics Banner */}
          <div className="bg-[#1C1F1E] rounded-2xl p-3 border border-[#354B45]/60 text-[11px] text-[#89938E] space-y-1">
            <span className="font-semibold text-[#A3EEDF] block">
              Compromiso de Bienestar Animal (LIMA)
            </span>
            <p className="leading-relaxed">
              AdiestraPet nunca recomienda castigos físicos, collares de ahorque ni métodos aversivos. Todo diagnóstico busca la causa emocional subyacente y fomenta el refuerzo positivo.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
