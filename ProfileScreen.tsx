import React, { useState } from 'react';
import {
  User,
  Plus,
  Sparkles,
  CreditCard,
  ShieldCheck,
  Heart,
  ChevronRight,
  RefreshCw,
  Award,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { Pet, Species, SubscriptionState } from '../types';
import { storageService } from '../services/storage';

interface ProfileScreenProps {
  activePet: Pet | null;
  allPets: Pet[];
  onSelectPet: (pet: Pet) => void;
  onRefreshPets: () => void;
  subscription: SubscriptionState;
  onOpenPaywall: (reason?: string) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  activePet,
  allPets,
  onSelectPet,
  onRefreshPets,
  subscription,
  onOpenPaywall,
}) => {
  const [showAddPet, setShowAddPet] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [species, setSpecies] = useState<Species>('perro');
  const [breed, setBreed] = useState<string>('');
  const [ageYears, setAgeYears] = useState<number>(1);
  const [ageMonths, setAgeMonths] = useState<number>(0);
  const [gender, setGender] = useState<'macho' | 'hembra'>('hembra');

  const handleRegisterPet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newPet: Pet = {
      id: `pet_${Date.now()}`,
      name: name.trim(),
      species,
      breed: breed.trim() || (species === 'perro' ? 'Mestizo Peruano' : 'Criollo'),
      ageYears,
      ageMonths,
      gender,
      createdAt: new Date().toISOString(),
    };

    storageService.addPet(newPet);
    onRefreshPets();
    onSelectPet(newPet);
    setShowAddPet(false);
    setName('');
    setBreed('');
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24 text-[#E1E3DF]">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          Perfil & Suscripción
          <User className="w-5 h-5 text-[#70F6E3]" />
        </h2>
        <p className="text-xs text-[#89938E] mt-0.5">
          Gestión de mascotas, estado de Google Play Billing y ética animal.
        </p>
      </div>

      {/* Subscription Status Card */}
      <div className="bg-gradient-to-br from-[#1F2624] via-[#242E2A] to-[#1C2320] rounded-3xl p-5 border border-[#354B45] shadow-lg space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#354B45] text-[#70F6E3] inline-flex items-center gap-1">
              <CreditCard className="w-3 h-3" />
              Google Play Billing Perú
            </span>
            <h3 className="text-lg font-black text-white">
              {subscription.isPremium ? subscription.planName : 'Plan Básico Gratuito'}
            </h3>
            <p className="text-xs text-[#89938E]">
              {subscription.isPremium
                ? `Suscripción activa en Soles (${subscription.pricePEN === 179.9 ? 'S/ 179,90/año' : 'S/ 19,90/mes'})`
                : 'Acceso limitado: sin videos HD ni Diagnóstico IA completo.'}
            </p>
          </div>

          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              subscription.isPremium
                ? 'bg-[#70F6E3] text-[#005047]'
                : 'bg-[#2D312E] text-[#89938E]'
            }`}
          >
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {subscription.isPremium ? (
          <div className="pt-2 border-t border-[#354B45] space-y-2 text-xs">
            <div className="flex items-center justify-between text-[#A3EEDF]">
              <span>ID de Recibo Google Play:</span>
              <span className="font-mono text-[10px]">{subscription.receiptId || 'GPA.7821-4912-30219'}</span>
            </div>
            <div className="flex items-center justify-between text-[#89938E] text-[11px]">
              <span>Renovación automática:</span>
              <span>Activa vía Google Play</span>
            </div>
          </div>
        ) : (
          <button
            onClick={() => onOpenPaywall('Pasa a AdiestraPet Premium para disfrutar sin restricciones.')}
            className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-[#006A60] to-[#008779] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#006A60]/30 transition hover:brightness-110"
          >
            <Sparkles className="w-4 h-4" />
            <span>Suscribirse desde S/ 14,99/mes (S/ 179,90/año)</span>
          </button>
        )}
      </div>

      {/* Pet Management List */}
      <div className="bg-[#242826] rounded-3xl p-4 border border-[#354B45] space-y-3 shadow-md">
        <div className="flex items-center justify-between border-b border-[#2D312E] pb-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Mis Mascotas ({allPets.length})
          </h3>
          <button
            onClick={() => setShowAddPet(!showAddPet)}
            className="flex items-center gap-1 text-[11px] bg-[#006A60] text-white px-2.5 py-1 rounded-full font-bold shadow-sm"
          >
            <Plus className="w-3 h-3" />
            <span>Añadir Mascota</span>
          </button>
        </div>

        {/* Add Pet Form */}
        {showAddPet && (
          <form
            onSubmit={handleRegisterPet}
            className="p-3 rounded-2xl bg-[#191C1B] border border-[#354B45] space-y-2.5 animate-in fade-in"
          >
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-[#89938E] block mb-1">Nombre:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Firulais, Kira"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 rounded-xl bg-[#242826] border border-[#354B45] text-white text-xs focus:outline-none focus:border-[#70F6E3]"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#89938E] block mb-1">Especie:</label>
                <div className="w-full p-2 rounded-xl bg-[#191C1B] border border-[#354B45] text-white text-xs flex items-center gap-1.5">
                  <span>🐶</span>
                  <span className="font-semibold">Perro (Canino)</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-[#89938E] block mb-1">Raza o cruza:</label>
                <input
                  type="text"
                  placeholder="Ej. Mestizo, Schnauzer"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  className="w-full p-2 rounded-xl bg-[#242826] border border-[#354B45] text-white text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#89938E] block mb-1">Edad (años):</label>
                <input
                  type="number"
                  min={0}
                  max={25}
                  value={ageYears}
                  onChange={(e) => setAgeYears(Number(e.target.value))}
                  className="w-full p-2 rounded-xl bg-[#242826] border border-[#354B45] text-white text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddPet(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-[#89938E]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-[#006A60] text-xs font-bold text-white shadow"
              >
                Registrar Mascota
              </button>
            </div>
          </form>
        )}

        {/* Existing pets list */}
        <div className="space-y-2">
          {allPets.map((p) => {
            const isSelected = activePet?.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => onSelectPet(p)}
                className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                  isSelected
                    ? 'border-[#70F6E3] bg-[#273934]'
                    : 'border-[#354B45] bg-[#1F2321] hover:border-[#4B635C]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#191C1B] border border-[#354B45] flex items-center justify-center text-lg">
                    🐶
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white">{p.name}</h4>
                      {isSelected && (
                        <span className="text-[9px] bg-[#006A60] text-white px-1.5 py-0.2 rounded font-semibold">
                          Activo
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#89938E]">
                      {p.breed} • {p.ageYears}a {p.ageMonths}m • {p.gender}
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-[#89938E]" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Animal Welfare Charter & LIMA Principles */}
      <div className="bg-[#242826] rounded-3xl p-4 border border-[#354B45] space-y-2 text-xs">
        <div className="flex items-center gap-2 text-[#70F6E3]">
          <Heart className="w-4 h-4 fill-[#70F6E3]" />
          <h4 className="font-bold uppercase tracking-wider">
            Manifiesto de Bienestar Animal AdiestraPet
          </h4>
        </div>
        <p className="text-[#C4C7C5] leading-relaxed">
          Nuestra metodología sigue el principio <strong>LIMA (Least Intrusive, Minimally Aversive)</strong> avalado por colegios veterinarios internacionales:
        </p>
        <ul className="space-y-1 text-[#89938E] text-[11px] pl-2">
          <li>• Cero castigos físicos, collares de púas o descargas eléctricas.</li>
          <li>• Comunicación clara mediante marcadores sonoros (Clicker) y premios de alto valor.</li>
          <li>• Descarte médico veterinario obligatorio ante agresividad o cambios bruscos.</li>
        </ul>
      </div>

      {/* App & Developer Info */}
      <div className="text-center text-[10px] text-[#89938E] space-y-1 pt-2">
        <p>AdiestraPet Perú v2.4.0 • Build Google AI Studio</p>
        <p>Soporte & Consultas: soporte@adiestrapet.pe</p>
      </div>
    </div>
  );
};
