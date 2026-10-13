import {
  Pet,
  TrainingProgress,
  DiagnosisRecord,
  Achievement,
  TrainingNote,
  SubscriptionState,
  DailyRoutineItem,
} from '../types';
import { INITIAL_PETS, INITIAL_ACHIEVEMENTS } from '../data/defaultData';

const KEYS = {
  PETS: 'adiestrapet_mascotas',
  ACTIVE_PET_ID: 'adiestrapet_active_pet_id',
  PROGRESS: 'adiestrapet_progreso',
  DIAGNOSES: 'adiestrapet_diagnosticos',
  ACHIEVEMENTS: 'adiestrapet_logros',
  NOTES: 'adiestrapet_notas',
  SUBSCRIPTION: 'adiestrapet_suscripcion',
  ROUTINES: 'adiestrapet_rutinas',
};

class StorageService {
  // --- PETS (Exclusively Canine) ---
  getPets(): Pet[] {
    try {
      const data = localStorage.getItem(KEYS.PETS);
      if (data) {
        const parsed: Pet[] = JSON.parse(data);
        // Ensure strictly canine pets
        const dogsOnly = parsed.filter((p) => p.species === 'perro');
        if (dogsOnly.length > 0) return dogsOnly;
      }
    } catch (e) {
      console.warn('Error reading pets:', e);
    }
    this.savePets(INITIAL_PETS);
    return INITIAL_PETS;
  }

  savePets(pets: Pet[]) {
    try {
      // Filter any accidental non-canine before saving
      const dogsOnly = pets.filter((p) => p.species === 'perro');
      localStorage.setItem(KEYS.PETS, JSON.stringify(dogsOnly));
    } catch (e) {
      console.error(e);
    }
  }

  addPet(pet: Pet) {
    const pets = this.getPets();
    pets.push(pet);
    this.savePets(pets);
    this.setActivePetId(pet.id);
  }

  getActivePet(): Pet | null {
    const pets = this.getPets();
    const activeId = localStorage.getItem(KEYS.ACTIVE_PET_ID);
    const found = pets.find((p) => p.id === activeId);
    return found || pets[0] || null;
  }

  setActivePetId(id: string) {
    localStorage.setItem(KEYS.ACTIVE_PET_ID, id);
  }

  // --- PROGRESS ---
  getProgress(petId: string): TrainingProgress {
    try {
      const all = localStorage.getItem(KEYS.PROGRESS);
      if (all) {
        const parsed: Record<string, TrainingProgress> = JSON.parse(all);
        if (parsed[petId]) return parsed[petId];
      }
    } catch (e) {
      console.warn(e);
    }
    // Default initial progress
    return {
      petId,
      streakDays: 4,
      lastTrainedDate: new Date().toISOString().split('T')[0],
      totalMinutesTrained: 27,
      achievementsUnlocked: ['ach_primer_click'],
    };
  }

  recordTrainingMinutes(petId: string, durationMinutes: number): TrainingProgress {
    const progress = this.getProgress(petId);
    progress.totalMinutesTrained += durationMinutes;

    // Update streak
    const today = new Date().toISOString().split('T')[0];
    if (progress.lastTrainedDate !== today) {
      progress.streakDays += 1;
      progress.lastTrainedDate = today;
    }

    try {
      const all = JSON.parse(localStorage.getItem(KEYS.PROGRESS) || '{}');
      all[petId] = progress;
      localStorage.setItem(KEYS.PROGRESS, JSON.stringify(all));
    } catch (e) {
      console.error(e);
    }

    return progress;
  }

  // --- DIAGNOSES ---
  getDiagnoses(): DiagnosisRecord[] {
    try {
      const data = localStorage.getItem(KEYS.DIAGNOSES);
      if (data) {
        const list: DiagnosisRecord[] = JSON.parse(data);
        return list.filter((d) => d.petSpecies === 'perro');
      }
    } catch (e) {
      console.warn(e);
    }
    return [];
  }

  saveDiagnosis(record: DiagnosisRecord) {
    const list = this.getDiagnoses();
    list.unshift(record);
    try {
      localStorage.setItem(KEYS.DIAGNOSES, JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
  }

  // --- ACHIEVEMENTS ---
  getAchievements(): Achievement[] {
    try {
      const data = localStorage.getItem(KEYS.ACHIEVEMENTS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn(e);
    }
    this.saveAchievements(INITIAL_ACHIEVEMENTS);
    return INITIAL_ACHIEVEMENTS;
  }

  saveAchievements(list: Achievement[]) {
    try {
      localStorage.setItem(KEYS.ACHIEVEMENTS, JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
  }

  unlockAchievement(id: string) {
    const list = this.getAchievements();
    const item = list.find((a) => a.id === id);
    if (item && !item.unlockedAt) {
      item.unlockedAt = new Date().toISOString();
      this.saveAchievements(list);
    }
  }

  // --- SUBSCRIPTION / GOOGLE PLAY BILLING ---
  getSubscription(): SubscriptionState {
    try {
      const data = localStorage.getItem(KEYS.SUBSCRIPTION);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn(e);
    }
    const initialSub: SubscriptionState = {
      isPremium: false,
      planId: 'free',
      planName: 'Plan Gratuito Limitado',
      pricePEN: 0,
      billingProvider: 'Google Play Store (Perú)',
    };
    return initialSub;
  }

  setSubscription(sub: SubscriptionState) {
    try {
      localStorage.setItem(KEYS.SUBSCRIPTION, JSON.stringify(sub));
    } catch (e) {
      console.error(e);
    }
  }

  // --- ROUTINES ---
  getRoutines(): DailyRoutineItem[] {
    try {
      const data = localStorage.getItem(KEYS.ROUTINES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn(e);
    }
    const defaultRoutines: DailyRoutineItem[] = [
      {
        id: 'rout_1',
        timeOfDay: 'mañana',
        title: 'Carga de Clicker & Contacto visual',
        durationMinutes: 5,
        completed: true,
        type: 'entrenamiento',
      },
      {
        id: 'rout_2',
        timeOfDay: 'tarde',
        title: 'Paseo Olfativo sin tirones (Sniffari)',
        durationMinutes: 20,
        completed: false,
        type: 'paseo',
      },
      {
        id: 'rout_3',
        timeOfDay: 'noche',
        title: 'Alfombra Olfativa o LickiMat de Calma',
        durationMinutes: 10,
        completed: false,
        type: 'calma',
      },
    ];
    this.saveRoutines(defaultRoutines);
    return defaultRoutines;
  }

  saveRoutines(routines: DailyRoutineItem[]) {
    try {
      localStorage.setItem(KEYS.ROUTINES, JSON.stringify(routines));
    } catch (e) {
      console.error(e);
    }
  }

  toggleRoutine(id: string): DailyRoutineItem[] {
    const list = this.getRoutines();
    const updated = list.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item));
    this.saveRoutines(updated);
    return updated;
  }

  // --- TRAINING NOTES ---
  getNotes(petId: string): TrainingNote[] {
    try {
      const data = localStorage.getItem(KEYS.NOTES);
      if (data) {
        const all: TrainingNote[] = JSON.parse(data);
        return all.filter((n) => n.petId === petId);
      }
    } catch (e) {
      console.warn(e);
    }
    return [
      {
        id: 'note_init_1',
        petId,
        date: new Date().toISOString().split('T')[0],
        lessonTitle: 'Cargar el Marcador (Clicker)',
        behaviorObserved: 'Conectó rapidísimo el sonido con el pollo. Movió la cola de inmediato en el 4to intento.',
        mood: 'excelente',
        treatsUsed: 'Pollo sancochado deshilachado sin sal',
      },
    ];
  }

  addNote(note: TrainingNote) {
    try {
      const all: TrainingNote[] = JSON.parse(localStorage.getItem(KEYS.NOTES) || '[]');
      all.unshift(note);
      localStorage.setItem(KEYS.NOTES, JSON.stringify(all));
    } catch (e) {
      console.error(e);
    }
  }
}

export const storageService = new StorageService();
