import React, { useState } from 'react';
import {
  ShieldAlert,
  X,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Search,
  Sparkles,
} from 'lucide-react';
import { QuickSolution, Species } from '../types';
import { QUICK_SOLUTIONS } from '../data/defaultData';

interface QuickSolutionsScreenProps {
  onClose: () => void;
  onSelectSolutionLesson?: (lessonId: string) => void;
}

export const QuickSolutionsScreen: React.FC<QuickSolutionsScreenProps> = ({
  onClose,
  onSelectSolutionLesson,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = QUICK_SOLUTIONS.filter((sol) => {
    return (
      sol.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sol.trigger.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sol.immediateAction.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#1F2321] border border-[#354B45] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-[#E1E3DF]">
        {/* Header */}
        <div className="p-4 bg-[#191C1B] border-b border-[#2D312E] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Biblioteca SOS: Soluciones Caninas
              </h3>
              <p className="text-[11px] text-[#89938E]">
                Protocolos de emergencia para conductas críticas en casa y calle
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#2D312E] text-[#89938E] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="p-3 bg-[#1A1D1C] border-b border-[#2D312E] space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-[#89938E] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar conducta canina (ej. timbres, mordiscos, correa, cohetones)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#242826] border border-[#354B45] text-xs text-white placeholder-[#89938E] focus:outline-none"
            />
          </div>
        </div>

        {/* Solutions List */}
        <div className="p-4 overflow-y-auto space-y-3">
          {filtered.map((sol) => (
            <div
              key={sol.id}
              className="bg-[#242826] rounded-2xl p-4 border border-[#354B45] space-y-3 text-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] bg-[#354B45] text-[#70F6E3] font-bold px-2 py-0.5 rounded-full uppercase">
                    🐶 Canino
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1">{sol.title}</h4>
                </div>
              </div>

              <div className="text-[#89938E]">
                <strong className="text-white">Detonante habitual: </strong>
                {sol.trigger}
              </div>

              {/* Immediate action */}
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Qué SÍ hacer de inmediato:</span>
                </div>
                <p className="leading-relaxed">{sol.immediateAction}</p>
              </div>

              {/* What NOT to do */}
              <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-800/80 text-red-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-red-300">
                  <XCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Qué NUNCA hacer (evita empeorar el cuadro):</span>
                </div>
                <p className="leading-relaxed">{sol.whatNotToDo}</p>
              </div>

              {/* Peruvian urban tip */}
              <div className="p-2 rounded-xl bg-[#1F2321] border border-[#354B45] text-[#A3EEDF] text-[11px] flex items-start gap-2">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Tip Perú: </strong>
                  {sol.peruvianUrbanTip}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
