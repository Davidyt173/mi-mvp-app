import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  CheckCircle2,
  Circle,
  Compass,
  ChevronRight,
  ShieldAlert,
  Volume2,
  Calendar,
  Zap,
} from 'lucide-react';
import { Pet, TrainingProgress, DailyRoutineItem } from '../types';
import { storageService } from '../services/storage';
import { audioTrainingService } from '../services/audioService';

interface HomeScreenProps {
  activePet: Pet | null;
  allPets: Pet[];
  onSelectPet: (pet: Pet) => void;
  progress: TrainingProgress;
  onOpenTraining: () => void;
  onOpenDiagnosis: () => void;
  onOpenPaywall: (reason?: string) => void;
  onOpenQuickSolutions: () => void;
  isPremium: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  activePet,
  allPets,
  onSelectPet,
  progress,
  onOpenTraining,
  onOpenDiagnosis,
  onOpenPaywall,
  onOpenQuickSolutions,
  isPremium,
}) => {
  const [routines, setRoutines] = useState<DailyRoutineItem[]>(storageService.getRoutines());
  const [clickCount, setClickCount] = useState<number>(0);

  const toggleRoutine = (id: string) => {
    const updated = storageService.toggleRoutine(id);
    setRoutines([...updated]);
    audioTrainingService.playSuccessChime();
  };

  const handleQuickClick = () => {
    audioTrainingService.playClicker();
    setClickCount((p) => p + 1);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24 text-[#E1E3DF]">
      {/* Top Pet Switcher Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            {activePet?.photoUrl ? (
              <img
                src={activePet.photoUrl}
                alt={activePet.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-[#70F6E3] shadow-md"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#006A60] to-[#70F6E3] flex items-center justify-center font-bold text-stone-900 text-lg">
                {activePet?.name.charAt(0) || 'P'}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 text-[11px] bg-[#191C1B] rounded-full p-0.5 border border-[#354B45]">
              🐶
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white tracking-tight">
                Hola, {activePet?.name || 'Compañero'}
              </h2>
            </div>
            <p className="text-xs text-[#89938E]">
              {activePet?.breed || 'Mestizo'} • {activePet?.ageYears}a {activePet?.ageMonths}m
            </p>
          </div>
        </div>

        {/* Streak counter badge */}
        <div className="flex items-center gap-1.5 bg-[#2A2318] border border-amber-600/50 px-3 py-1.5 rounded-2xl shadow-sm">
          <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
          <div className="text-right">
            <span className="text-xs font-black text-amber-300 font-mono block leading-none">
              {progress.streakDays} DÍAS
            </span>
            <span className="text-[9px] text-amber-200/70 font-semibold uppercase">Racha</span>
          </div>
        </div>
      </div>

      {/* Pet Quick Selector Pills if tutor has multiple dogs */}
      {allPets.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] text-[#89938E] flex-shrink-0">Mascotas caninas:</span>
          {allPets.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectPet(p)}
              className={`px-3 py-1 rounded-full flex items-center gap-1.5 transition flex-shrink-0 ${
                activePet?.id === p.id
                  ? 'bg-[#354B45] text-[#70F6E3] font-bold border border-[#70F6E3]/40'
                  : 'bg-[#242826] text-[#C4C7C5] hover:bg-[#2D312E]'
              }`}
            >
              <span>🐶</span>
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* WOW AI Diagnosis Hero Card */}
      <div
        onClick={onOpenDiagnosis}
        className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-[#004D44] via-[#006A60] to-[#0A332F] border border-[#70F6E3]/40 shadow-xl cursor-pointer hover:border-[#70F6E3] transition group"
      >
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#70F6E3]/15 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition duration-500"></div>

        <div className="relative z-10 flex items-start justify-between">
          <div className="space-y-1 max-w-[75%]">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] bg-amber-400 text-stone-900 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Función WOW • IA Multimodal
              </span>
            </div>
            <h3 className="text-lg font-black text-white tracking-tight leading-snug">
              ¿Tu perro tiene una conducta difícil hoy?
            </h3>
            <p className="text-xs text-[#A3EEDF] leading-relaxed">
              Describe lo que ocurre o sube una foto. Nuestro etólogo canino con IA generará un mini-plan de refuerzo positivo inmediato.
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-[#70F6E3] text-[#004D44] flex items-center justify-center shadow-lg group-hover:rotate-12 transition">
            <Sparkles className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-white">
          <span className="flex items-center gap-1.5 text-[#70F6E3]">
            <Zap className="w-3.5 h-3.5 fill-[#70F6E3]" />
            Analizar Conducta Canina con IA
          </span>
          <ChevronRight className="w-4 h-4 text-[#70F6E3] group-hover:translate-x-1 transition" />
        </div>
      </div>

      {/* Daily Routine Checklist */}
      <div className="bg-[#242826] rounded-3xl p-4 border border-[#354B45] shadow-md space-y-3">
        <div className="flex items-center justify-between border-b border-[#2D312E] pb-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#70F6E3]" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Rutina Positiva Canina de Hoy
            </h3>
          </div>
          <span className="text-[11px] text-[#89938E]">
            {routines.filter((r) => r.completed).length}/{routines.length} hechas
          </span>
        </div>

        <div className="space-y-2">
          {routines.map((routine) => (
            <div
              key={routine.id}
              onClick={() => toggleRoutine(routine.id)}
              className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                routine.completed
                  ? 'border-emerald-800/60 bg-emerald-950/20 text-[#A3EEDF]'
                  : 'border-[#354B45] bg-[#1F2321] text-white hover:border-[#4B635C]'
              }`}
            >
              <div className="flex items-center gap-3">
                {routine.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-[#70F6E3] flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-[#89938E] flex-shrink-0" />
                )}
                <div>
                  <h4 className={`text-xs font-semibold ${routine.completed ? 'line-through opacity-75' : ''}`}>
                    {routine.title}
                  </h4>
                  <span className="text-[10px] text-[#89938E] capitalize">
                    Momento: {routine.timeOfDay} • {routine.durationMinutes} min
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Quick Clicker Bar */}
      <div className="bg-gradient-to-r from-[#1F2523] to-[#27322F] rounded-3xl p-4 border border-[#354B45] flex items-center justify-between shadow-md">
        <div className="space-y-0.5">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-[#70F6E3]" />
            Marcador Clicker Canino
          </span>
          <p className="text-[11px] text-[#89938E]">
            Usa el clicker en sesiones de 5 min para marcar aciertos
          </p>
        </div>

        <button
          onClick={handleQuickClick}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#006A60] to-[#008779] active:scale-90 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-[#006A60]/40 transition hover:brightness-110"
        >
          <span>¡CLICK!</span>
          {clickCount > 0 && (
            <span className="bg-[#70F6E3] text-stone-900 px-1.5 py-0.2 rounded-full text-[10px]">
              {clickCount}
            </span>
          )}
        </button>
      </div>

      {/* Peruvian Urban Pet Tip Banner */}
      <div className="bg-[#242826] rounded-3xl p-4 border border-[#354B45] space-y-2">
        <div className="flex items-center gap-2 text-amber-400">
          <Compass className="w-4 h-4" />
          <h4 className="text-xs font-bold uppercase tracking-wider">
            Consejo Urbano Perú: Paseos en Lima & Provincias
          </h4>
        </div>
        <p className="text-xs text-[#C4C7C5] leading-relaxed">
          En ciudades peruanas con pistas calientes al mediodía (30°C en verano), aplica la <strong>regla de los 5 segundos</strong>: apoya el dorso de tu mano en el asfalto. Si no aguantas 5 segundos, quemará las almohadillas de tu perro. Prefiere salidas a las 6:30 am o 7:30 pm.
        </p>
      </div>

      {/* Quick Solutions Shortcut Button */}
      <button
        onClick={onOpenQuickSolutions}
        className="w-full py-3 px-4 rounded-2xl bg-[#2D312E] hover:bg-[#354B45] text-amber-300 font-bold text-xs flex items-center justify-center gap-2 border border-amber-600/30 transition shadow-sm"
      >
        <ShieldAlert className="w-4 h-4 text-amber-400" />
        <span>Biblioteca SOS: Soluciones Rápidas para Conductas Críticas</span>
      </button>
    </div>
  );
};
