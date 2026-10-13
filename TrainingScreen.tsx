import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Sparkles,
  Volume2,
  BookOpen,
} from 'lucide-react';
import { QuickSolution } from '../types';
import { QUICK_SOLUTIONS } from '../data/defaultData';
import { audioTrainingService } from '../services/audioService';

interface TrainingScreenProps {
  isPremium: boolean;
  onOpenPaywall: (reason?: string) => void;
}

export const TrainingScreen: React.FC<TrainingScreenProps> = ({
  isPremium,
  onOpenPaywall,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'soluciones' | 'clicker'>('soluciones');

  const filtered = QUICK_SOLUTIONS.filter((sol) => {
    return (
      sol.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sol.trigger.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sol.immediateAction.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24 text-[#E1E3DF]">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Guía Canina & Soluciones SOS
          </h2>
          <span className="text-[10px] bg-[#354B45] text-[#70F6E3] font-bold px-2 py-0.5 rounded-full uppercase">
            Canino 🐶
          </span>
        </div>
        <p className="text-xs text-[#89938E] mt-0.5">
          Protocolos etológicos de refuerzo positivo inmediato para conductas críticas y fundamentos de comunicación.
        </p>
      </div>

      {/* Mode Selector */}
      <div className="flex bg-[#242826] p-1 rounded-2xl border border-[#354B45] text-xs">
        <button
          onClick={() => setActiveTab('soluciones')}
          className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'soluciones'
              ? 'bg-[#006A60] text-white shadow-sm'
              : 'text-[#89938E] hover:text-[#C4C7C5]'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Soluciones SOS ({filtered.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('clicker')}
          className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'clicker'
              ? 'bg-[#006A60] text-white shadow-sm'
              : 'text-[#89938E] hover:text-[#C4C7C5]'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>Fundamentos Clicker</span>
        </button>
      </div>

      {activeTab === 'soluciones' ? (
        <div className="space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#89938E] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar conducta (ej. timbre, mordiscos, correa, cohetones)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-2xl bg-[#242826] border border-[#354B45] text-xs text-white placeholder-[#89938E] focus:outline-none focus:border-[#70F6E3]"
            />
          </div>

          {/* Solutions List */}
          {filtered.length === 0 ? (
            <div className="text-center py-8 bg-[#242826] rounded-3xl border border-[#354B45] p-6 space-y-2">
              <BookOpen className="w-8 h-8 text-[#89938E] mx-auto opacity-50" />
              <h4 className="text-sm font-bold text-white">Sin resultados</h4>
              <p className="text-xs text-[#89938E]">
                Prueba con otro término o consulta al IA Etólogo en la pestaña de Diagnóstico.
              </p>
            </div>
          ) : (
            filtered.map((sol) => (
              <div
                key={sol.id}
                className="bg-[#242826] rounded-3xl p-4 border border-[#354B45] space-y-3 text-xs shadow-md"
              >
                <div>
                  <span className="text-[10px] bg-[#354B45] text-[#70F6E3] font-bold px-2 py-0.5 rounded-full uppercase">
                    🐶 Conducta Canina
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1.5">{sol.title}</h4>
                </div>

                <div className="text-[#89938E]">
                  <strong className="text-white">Detonante habitual: </strong>
                  {sol.trigger}
                </div>

                {/* Immediate action */}
                <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>Qué SÍ hacer de inmediato:</span>
                  </div>
                  <p className="leading-relaxed">{sol.immediateAction}</p>
                </div>

                {/* What NOT to do */}
                <div className="p-3 rounded-2xl bg-red-950/40 border border-red-800/80 text-red-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-red-300">
                    <XCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Qué NUNCA hacer (evita empeorar el cuadro):</span>
                  </div>
                  <p className="leading-relaxed">{sol.whatNotToDo}</p>
                </div>

                {/* Peruvian urban tip */}
                <div className="p-2.5 rounded-2xl bg-[#1F2321] border border-[#354B45] text-[#A3EEDF] text-[11px] flex items-start gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Tip Perú: </strong>
                    {sol.peruvianUrbanTip}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Clicker & Positive Reinforcement Fundamentals */
        <div className="space-y-3">
          <div className="bg-[#242826] rounded-3xl p-5 border border-[#354B45] space-y-3 shadow-md">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-[#006A60] text-white flex items-center justify-center">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  ¿Cómo funciona el Clicker en perros?
                </h3>
                <span className="text-[10px] text-[#70F6E3]">Condicionamiento clásico y operante</span>
              </div>
            </div>

            <p className="text-xs text-[#C4C7C5] leading-relaxed">
              El clicker es una <strong>"cámara fotográfica" acústica</strong>. Marca el milisegundo exacto en que tu perro realiza la acción correcta y le comunica: <em>"¡Eso que acabas de hacer te acaba de ganar un premio delicioso!"</em>.
            </p>

            <div className="space-y-2 pt-1">
              <div className="p-3 rounded-2xl bg-[#1F2321] border border-[#354B45] text-xs space-y-1">
                <span className="font-bold text-white">1. Cargar el marcador (15 repeticiones)</span>
                <p className="text-[#89938E] leading-relaxed">
                  Haz sonar el clicker una sola vez sin pedir ninguna postura. Inmediatamente después (menos de 0.8s), dale un trocito de pollo sancochado sin sal. Repite 15 veces para asociar sonido con placer.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#1F2321] border border-[#354B45] text-xs space-y-1">
                <span className="font-bold text-white">2. Timing exacto</span>
                <p className="text-[#89938E] leading-relaxed">
                  El click se hace <strong>DURANTE</strong> la conducta deseada (ej. en el instante en que sus caderas tocan el suelo o cuando afloja la correa), nunca después de que ya se haya movido.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#1F2321] border border-[#354B45] text-xs space-y-1">
                <span className="font-bold text-white">3. Premios recomendados en Perú</span>
                <p className="text-[#89938E] leading-relaxed">
                  Pollo o molleja sancochada sin sal, pequeños cubos de camote cocido o queso fresco pasteurizado sin sal. Deben ser del tamaño de una arveja para tragar rápido sin masticar mucho.
                </p>
              </div>
            </div>

            <button
              onClick={() => audioTrainingService.playClicker()}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#006A60] to-[#008779] active:scale-95 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#006A60]/30 transition hover:brightness-110"
            >
              <Volume2 className="w-4 h-4" />
              <span>Probar Sonido del Clicker Aquí (¡CLICK!)</span>
            </button>
          </div>
        </div>
      )}

      {/* Paywall Banner if not premium */}
      {!isPremium && (
        <div className="bg-gradient-to-r from-[#005047] via-[#006A60] to-[#008779] rounded-3xl p-4 text-white shadow-xl flex items-center justify-between">
          <div className="space-y-0.5 max-w-[70%]">
            <span className="text-[10px] bg-amber-400 text-stone-900 font-black px-1.5 py-0.2 rounded-full uppercase">
              Google Play Billing
            </span>
            <h4 className="text-sm font-extrabold leading-tight">
              AdiestraPet Premium Canino
            </h4>
            <p className="text-[11px] text-white/80">
              Diagnósticos multimodales ilimitados con IA por S/ 14,99/mes (Anual S/ 179,90).
            </p>
          </div>

          <button
            onClick={() => onOpenPaywall('Accede a Diagnósticos Multimodales con IA ilimitados para tu perro.')}
            className="px-3.5 py-2 rounded-full bg-white text-[#005047] font-extrabold text-xs shadow-md hover:bg-[#70F6E3] transition"
          >
            Ver Planes
          </button>
        </div>
      )}
    </div>
  );
};
