import React, { useState, useEffect } from 'react';
import { AndroidStatusBar } from './components/AndroidStatusBar';
import { AndroidNavBar, NavTab } from './components/AndroidNavBar';
import { DeviceFrame } from './components/DeviceFrame';
import { PaywallModal } from './components/PaywallModal';
import { ClickerFloatingTool } from './components/ClickerFloatingTool';
import { ShareCardModal } from './components/ShareCardModal';
import { KotlinCodeModal } from './components/KotlinCodeModal';

import { HomeScreen } from './screens/HomeScreen';
import { TrainingScreen } from './screens/TrainingScreen';
import { DiagnosisScreen } from './screens/DiagnosisScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { QuickSolutionsScreen } from './screens/QuickSolutionsScreen';

import {
  Pet,
  TrainingProgress,
  DiagnosisRecord,
  SubscriptionState,
} from './types';
import { storageService } from './services/storage';

export default function App() {
  const [isMobileView, setIsMobileView] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<NavTab>('inicio');

  // Pets & Active Pet (Canine Only)
  const [allPets, setAllPets] = useState<Pet[]>([]);
  const [activePet, setActivePet] = useState<Pet | null>(null);

  // Training & Progress
  const [progress, setProgress] = useState<TrainingProgress>({
    petId: '',
    streakDays: 4,
    lastTrainedDate: new Date().toISOString().split('T')[0],
    totalMinutesTrained: 25,
    achievementsUnlocked: ['ach_primer_click'],
  });

  // Subscription / Google Play Billing
  const [subscription, setSubscription] = useState<SubscriptionState>(storageService.getSubscription());
  const [isPaywallOpen, setIsPaywallOpen] = useState<boolean>(false);
  const [paywallReason, setPaywallReason] = useState<string | undefined>();

  // Modals
  const [shareCardDiagnosis, setShareCardDiagnosis] = useState<DiagnosisRecord | null>(null);
  const [isKotlinModalOpen, setIsKotlinModalOpen] = useState<boolean>(false);
  const [isQuickSolutionsOpen, setIsQuickSolutionsOpen] = useState<boolean>(false);

  // Initialize data on mount
  useEffect(() => {
    const loadedPets = storageService.getPets();
    setAllPets(loadedPets);

    const active = storageService.getActivePet();
    setActivePet(active);

    if (active) {
      setProgress(storageService.getProgress(active.id));
    }
  }, []);

  const handleSelectPet = (pet: Pet) => {
    setActivePet(pet);
    storageService.setActivePetId(pet.id);
    setProgress(storageService.getProgress(pet.id));
  };

  const handleRefreshPets = () => {
    const loaded = storageService.getPets();
    setAllPets([...loaded]);
    const currentActive = storageService.getActivePet();
    if (currentActive) {
      setActivePet(currentActive);
    }
  };

  const handleOpenPaywall = (reason?: string) => {
    setPaywallReason(reason);
    setIsPaywallOpen(true);
  };

  const handleSubscriptionSuccess = (newSub: SubscriptionState) => {
    setSubscription(newSub);
  };

  return (
    <DeviceFrame
      isMobileView={isMobileView}
      onToggleView={() => setIsMobileView(!isMobileView)}
      onOpenKotlinCode={() => setIsKotlinModalOpen(true)}
      onOpenQuickSolutions={() => setIsQuickSolutionsOpen(true)}
    >
      {/* Android Top System Bar */}
      <AndroidStatusBar isPremium={subscription.isPremium} />

      {/* Screen Body View */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {currentTab === 'inicio' && (
          <HomeScreen
            activePet={activePet}
            allPets={allPets}
            onSelectPet={handleSelectPet}
            progress={progress}
            onOpenTraining={() => setCurrentTab('entrenamiento')}
            onOpenDiagnosis={() => setCurrentTab('diagnostico')}
            onOpenPaywall={handleOpenPaywall}
            onOpenQuickSolutions={() => setIsQuickSolutionsOpen(true)}
            isPremium={subscription.isPremium}
          />
        )}

        {currentTab === 'entrenamiento' && (
          <TrainingScreen
            isPremium={subscription.isPremium}
            onOpenPaywall={handleOpenPaywall}
          />
        )}

        {currentTab === 'diagnostico' && (
          <DiagnosisScreen
            activePet={activePet}
            isPremium={subscription.isPremium}
            onOpenPaywall={handleOpenPaywall}
            onOpenShareCard={(record) => setShareCardDiagnosis(record)}
          />
        )}

        {currentTab === 'progreso' && (
          <ProgressScreen activePet={activePet} progress={progress} />
        )}

        {currentTab === 'perfil' && (
          <ProfileScreen
            activePet={activePet}
            allPets={allPets}
            onSelectPet={handleSelectPet}
            onRefreshPets={handleRefreshPets}
            subscription={subscription}
            onOpenPaywall={handleOpenPaywall}
          />
        )}

        {/* Floating Clicker / Whistle Positive Reinforcement Trainer Tool */}
        <ClickerFloatingTool />
      </div>

      {/* Material 3 Bottom Navigation Bar */}
      <AndroidNavBar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        hasDiagnosisBadge={true}
      />

      {/* Google Play Billing Paywall Bottom Sheet */}
      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        onSubscriptionSuccess={handleSubscriptionSuccess}
        featureReason={paywallReason}
      />

      {/* Shareable Story Card Modal */}
      <ShareCardModal
        diagnosis={shareCardDiagnosis}
        onClose={() => setShareCardDiagnosis(null)}
      />

      {/* Kotlin + Jetpack Compose Code Inspector Modal */}
      <KotlinCodeModal
        isOpen={isKotlinModalOpen}
        onClose={() => setIsKotlinModalOpen(false)}
      />

      {/* Quick Solutions SOS Modal */}
      {isQuickSolutionsOpen && (
        <QuickSolutionsScreen
          onClose={() => setIsQuickSolutionsOpen(false)}
        />
      )}
    </DeviceFrame>
  );
}
