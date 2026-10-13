import React, { useState } from 'react';
import {
  TrendingUp,
  Flame,
  Clock,
  Award,
  BookOpen,
  Plus,
  CheckCircle2,
  Calendar,
  Smile,
  Zap,
} from 'lucide-react';
import { Pet, TrainingProgress, Achievement, TrainingNote } from '../types';
import { storageService } from '../services/storage';

interface ProgressScreenProps {
  activePet: Pet | null;
  progress: TrainingProgress;
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({ activePet, progress }) => {
  const [achievements, setAchievements] = useState<Achievement[]>(storageService.getAchievements());
  const [notes, setNotes] = useState<TrainingNote[]>(
    storageService.getNotes(activePet?.id || 'pet_chaska_01')
  );
  const [showAddNote, setShowAddNote] = useState<boolean>(false);
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [newNoteTreats, setNewNoteTreats] = useState<string>('Pollo sancochado');
  const [newNoteMood, setNewNoteMood] = useState<'excelente' | 'bueno' | 'distraido' | 'frustrado'>('excelente');

  const handleSaveNote = () => {
    if (!newNoteText.trim() || !activePet) return;
    const note: TrainingNote = {
      id: `note_${Date.now()}`,
      petId: activePet.id,
      date: new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }),
      behaviorObserved: newNoteText,
      mood: newNoteMood,
      treatsUsed: newNoteTreats,
    };
    storageService.addNote(note);
    setNotes([note, ...notes]);
    setNewNoteText('');
    setShowAddNote(false);
  };

  const unlockedCount = achievements.filter((a) => a.unlockedAt).length;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24 text-[#E1E3DF]">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          Progreso & Logros
          <TrendingUp className="w-5 h-5 text-[#70F6E3]" />
        </h2>
        <p className="text-xs text-[#89938E] mt-0.5">
          Evolución del aprendizaje y diario de campo de {activePet?.name || 'tu mascota'}.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-[#242826] p-3 rounded-2xl border border-[#354B45] text-center">
          <Flame className="w-5 h-5 text-amber-400 mx-auto mb-1 fill-amber-400" />
          <span className="text-base font-black text-white font-mono block">
            {progress.streakDays} Días
          </span>
          <span className="text-[10px] text-[#89938E]">Racha Activa</span>
        </div>

        <div className="bg-[#242826] p-3 rounded-2xl border border-[#354B45] text-center">
          <Clock className="w-5 h-5 text-[#70F6E3] mx-auto mb-1" />
          <span className="text-base font-black text-white font-mono block">
            {progress.totalMinutesTrained} min
          </span>
          <span className="text-[10px] text-[#89938E]">Tiempo Total</span>
        </div>

        <div className="bg-[#242826] p-3 rounded-2xl border border-[#354B45] text-center">
          <Award className="w-5 h-5 text-purple-400 mx-auto mb-1" />
          <span className="text-base font-black text-white font-mono block">
            {unlockedCount}/{achievements.length}
          </span>
          <span className="text-[10px] text-[#89938E]">Insignias</span>
        </div>
      </div>

      {/* 7-Day Training Streak Visualizer */}
      <div className="bg-[#242826] rounded-3xl p-4 border border-[#354B45] space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#70F6E3]" />
            Semana de Entrenamiento
          </span>
          <span className="text-[10px] text-[#70F6E3] font-semibold">Excelente constancia</span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, idx) => {
            const isDone = idx < 4; // Mock completed streak days
            return (
              <div
                key={idx}
                className={`py-2 rounded-xl text-center flex flex-col items-center gap-1 border ${
                  isDone
                    ? 'border-[#70F6E3] bg-[#273934] text-[#70F6E3]'
                    : 'border-[#354B45] bg-[#1F2321] text-[#89938E]'
                }`}
              >
                <span className="text-[10px] font-bold">{day}</span>
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#70F6E3]" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-[#354B45]"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements Badges Grid */}
      <div className="bg-[#242826] rounded-3xl p-4 border border-[#354B45] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            Insignias Desbloqueadas
          </h3>
          <span className="text-[10px] text-[#89938E]">
            {unlockedCount} de {achievements.length}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {achievements.map((item) => {
            const isUnlocked = !!item.unlockedAt;
            return (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border text-xs flex items-center gap-2.5 transition ${
                  isUnlocked
                    ? 'border-amber-500/40 bg-gradient-to-br from-[#2D2A20] to-[#24221A] text-white shadow-sm'
                    : 'border-[#354B45]/40 bg-[#1C1F1E] opacity-50 text-[#89938E]'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isUnlocked ? 'bg-amber-400/20 text-amber-300' : 'bg-[#2D312E] text-[#89938E]'
                  }`}
                >
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs leading-tight">{item.title}</h4>
                  <p className="text-[10px] text-[#89938E] mt-0.5 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Notes / Field Diary */}
      <div className="bg-[#242826] rounded-3xl p-4 border border-[#354B45] space-y-3">
        <div className="flex items-center justify-between border-b border-[#2D312E] pb-2">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-[#70F6E3]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Diario de Observaciones
            </h3>
          </div>

          <button
            onClick={() => setShowAddNote(!showAddNote)}
            className="flex items-center gap-1 text-[11px] bg-[#006A60] hover:bg-[#008779] text-white px-2.5 py-1 rounded-full font-bold transition shadow-sm"
          >
            <Plus className="w-3 h-3" />
            <span>Nueva Nota</span>
          </button>
        </div>

        {/* Add note inline form */}
        {showAddNote && (
          <div className="p-3 rounded-2xl bg-[#191C1B] border border-[#354B45] space-y-2 animate-in fade-in">
            <textarea
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="¿Qué conducta observaste hoy durante la sesión de entrenamiento?"
              rows={2}
              className="w-full p-2.5 rounded-xl bg-[#242826] border border-[#354B45] text-xs text-white placeholder-[#89938E] focus:outline-none focus:border-[#70F6E3] resize-none"
            />

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-[#89938E] block mb-1">Estado de ánimo:</label>
                <select
                  value={newNoteMood}
                  onChange={(e: any) => setNewNoteMood(e.target.value)}
                  className="w-full p-1.5 rounded-lg bg-[#242826] border border-[#354B45] text-xs text-white focus:outline-none"
                >
                  <option value="excelente">Excelente (Muy enfocado)</option>
                  <option value="bueno">Bueno (Colaborativo)</option>
                  <option value="distraido">Distraído</option>
                  <option value="frustrado">Frustrado (Bajar dificultad)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[#89938E] block mb-1">Premio usado:</label>
                <input
                  type="text"
                  value={newNoteTreats}
                  onChange={(e) => setNewNoteTreats(e.target.value)}
                  className="w-full p-1.5 rounded-lg bg-[#242826] border border-[#354B45] text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddNote(false)}
                className="px-3 py-1 rounded-lg text-xs text-[#89938E] hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveNote}
                className="px-3.5 py-1 rounded-lg bg-[#006A60] text-xs font-bold text-white shadow"
              >
                Guardar
              </button>
            </div>
          </div>
        )}

        {/* Existing notes list */}
        <div className="space-y-2">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-3 rounded-2xl bg-[#1F2321] border border-[#354B45] text-xs space-y-1"
            >
              <div className="flex items-center justify-between text-[10px] text-[#89938E]">
                <span className="font-semibold text-[#A3EEDF] font-mono">{note.date}</span>
                <span className="capitalize px-1.5 py-0.2 rounded bg-[#354B45] text-white">
                  Ánimo: {note.mood}
                </span>
              </div>
              <p className="text-white leading-relaxed">{note.behaviorObserved}</p>
              <span className="text-[10px] text-[#89938E] block">
                Recompensa: {note.treatsUsed}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
