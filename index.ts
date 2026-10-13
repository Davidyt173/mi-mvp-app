export type Species = 'perro';

export interface Pet {
  id: string;
  name: string;
  species: Species;
  breed: string;
  ageYears: number;
  ageMonths: number;
  gender: 'macho' | 'hembra';
  photoUrl?: string;
  weightKg?: number;
  temperament?: string[];
  notes?: string;
  createdAt: string;
}

export interface TrainingProgress {
  petId: string;
  completedLessonIds?: string[];
  streakDays: number;
  lastTrainedDate: string;
  totalMinutesTrained: number;
  achievementsUnlocked: string[];
}

export interface DailyRoutineItem {
  id: string;
  timeOfDay: 'mañana' | 'tarde' | 'noche';
  title: string;
  durationMinutes: number;
  completed: boolean;
  type: 'entrenamiento' | 'olfato' | 'paseo' | 'calma';
}

export interface DiagnosisRecord {
  id: string;
  date: string;
  petName: string;
  petSpecies: Species;
  behaviorDescription: string;
  imageUrl?: string;
  engine: 'gemini-3.8-flash' | 'sistema_experto_reglas';
  petSummary: string;
  behaviorType: string;
  urgencyLevel: 'Normal' | 'Moderado' | 'Atención Requerida' | 'Alerta Profesional Urgente';
  professionalWarning: boolean;
  warningDetails?: string;
  possibleCauses: string[];
  positiveSteps: string[];
  dailyExercise: {
    title: string;
    durationMinutes: number;
    instructions: string;
  };
  recommendedModules: string[];
  peruvianTip: string;
  shareSummary: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: 'entrenamiento' | 'racha' | 'diagnostico' | 'social';
  unlockedAt?: string;
}

export interface TrainingNote {
  id: string;
  petId: string;
  date: string;
  lessonTitle?: string;
  behaviorObserved: string;
  mood: 'excelente' | 'bueno' | 'distraido' | 'frustrado';
  treatsUsed: string;
}

export interface SubscriptionState {
  isPremium: boolean;
  planId: 'free' | 'monthly_19' | 'annual_179' | 'monthly_29' | 'annual_199';
  planName: string;
  pricePEN: number;
  billingProvider: string;
  purchaseToken?: string;
  receiptId?: string;
  expiresAt?: string;
}

export interface QuickSolution {
  id: string;
  species: Species;
  title: string;
  trigger: string;
  immediateAction: string;
  whatNotToDo: string;
  peruvianUrbanTip: string;
}

