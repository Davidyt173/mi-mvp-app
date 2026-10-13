import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Lock,
  Sparkles,
  CreditCard,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Check,
  Zap,
} from 'lucide-react';
import { SubscriptionState } from '../types';
import { storageService } from '../services/storage';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscriptionSuccess: (sub: SubscriptionState) => void;
  featureReason?: string;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  onSubscriptionSuccess,
  featureReason,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly_19' | 'annual_179'>('annual_179');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('yape_plin');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);

  if (!isOpen) return null;

  const handlePurchase = async () => {
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      // Generate a simulated Google Play Billing Purchase Token
      const purchaseToken = `play_pe_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      // Verify token through backend route
      const res = await fetch('/api/verify-billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchaseToken,
          packageId: selectedPlan,
          paymentMethod: selectedPaymentMethod,
        }),
      });

      const data = await res.json();

      if (data.success && data.verified) {
        const newSub: SubscriptionState = {
          isPremium: true,
          planId: selectedPlan,
          planName: selectedPlan === 'annual_179' ? 'Plan Anual Premium' : 'Plan Mensual Premium',
          pricePEN: selectedPlan === 'annual_179' ? 179.9 : 19.9,
          billingProvider: 'Google Play Billing Perú (v7.0.0)',
          purchaseToken,
          receiptId: data.receiptId,
          expiresAt: data.expiresAt,
        };

        storageService.setSubscription(newSub);
        onSubscriptionSuccess(newSub);
        onClose();
      } else {
        setErrorMsg('Google Play no pudo autorizar la transacción. Verifica tu saldo o método.');
      }
    } catch (e: any) {
      setErrorMsg('Error de conexión al validar con Google Play Console.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestorePurchases = async () => {
    setIsRestoring(true);
    setErrorMsg(null);
    setTimeout(() => {
      setIsRestoring(false);
      const existing = storageService.getSubscription();
      if (existing.isPremium) {
        onSubscriptionSuccess(existing);
        onClose();
      } else {
        setErrorMsg('No se encontraron compras activas asociadas a tu cuenta de Google Play en Perú.');
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#1F2321] border border-[#354B45] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-[#E1E3DF]">
        {/* Header with Google Play Badge */}
        <div className="relative bg-gradient-to-br from-[#005047] via-[#006A60] to-[#008779] p-5 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#70F6E3] text-[#003731]">
              Google Play Billing
            </span>
            <span className="text-[11px] text-white/80 font-medium">Mercado Perú (PEN)</span>
          </div>

          <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            AdiestraPet Premium
            <Sparkles className="w-5 h-5 text-amber-300" />
          </h2>

          <p className="text-xs text-white/90 mt-1">
            {featureReason || 'Desbloquea Diagnósticos Multimodales Ilimitados con IA Canina y Guías SOS completas.'}
          </p>
        </div>

        {/* Content & Plans */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Benefit highlights */}
          <div className="space-y-2 bg-[#282D2A] p-3 rounded-2xl border border-[#354B45]/60 text-xs">
            <div className="flex items-center gap-2 text-[#C4C7C5]">
              <CheckCircle2 className="w-4 h-4 text-[#70F6E3] flex-shrink-0" />
              <span>Diagnósticos Multimodales Ilimitados con IA para perros y cachorros.</span>
            </div>
            <div className="flex items-center gap-2 text-[#C4C7C5]">
              <CheckCircle2 className="w-4 h-4 text-[#70F6E3] flex-shrink-0" />
              <span>Acceso completo a la biblioteca de Soluciones SOS y protocolos etológicos.</span>
            </div>
            <div className="flex items-center gap-2 text-[#C4C7C5]">
              <CheckCircle2 className="w-4 h-4 text-[#70F6E3] flex-shrink-0" />
              <span>Videos de demostración HD paso a paso y Clicker interactivo.</span>
            </div>
            <div className="flex items-center gap-2 text-[#C4C7C5]">
              <CheckCircle2 className="w-4 h-4 text-[#70F6E3] flex-shrink-0" />
              <span>Certificados de logros y notas de seguimiento en tu cuenta.</span>
            </div>
          </div>

          {/* Plan Selection with Price Anchoring */}
          <div className="grid grid-cols-1 gap-3">
            {/* Annual Plan (Featured with Price Anchoring) */}
            <div
              onClick={() => setSelectedPlan('annual_179')}
              className={`relative p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col gap-2 ${
                selectedPlan === 'annual_179'
                  ? 'border-[#70F6E3] bg-[#223631] shadow-lg shadow-[#006A60]/20'
                  : 'border-[#354B45] bg-[#242826] hover:border-[#4B635C]'
              }`}
            >
              {/* Highlight Badge */}
              <div className="absolute -top-3 right-4 bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-black text-[11px] px-3 py-0.5 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3 fill-stone-950" />
                <span>«AHORRA 25%»</span>
              </div>

              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0 ${
                      selectedPlan === 'annual_179'
                        ? 'border-[#70F6E3] bg-[#70F6E3]'
                        : 'border-[#89938E]'
                    }`}
                  >
                    {selectedPlan === 'annual_179' && <Check className="w-3.5 h-3.5 text-stone-900 stroke-[3]" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-white">Plan Anual</h4>
                      <span className="text-[10px] bg-[#006A60] text-[#70F6E3] font-bold px-1.5 py-0.2 rounded">
                        Pago único anual
                      </span>
                    </div>
                    <p className="text-xs text-[#70F6E3] font-bold mt-0.5">
                      Equivalente a S/ 14,99/mes
                    </p>
                  </div>
                </div>

                {/* Price block with anchor */}
                <div className="text-right">
                  <div className="text-[11px] text-[#89938E] line-through decoration-red-400">
                    S/ 238,80
                  </div>
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-lg font-black text-white">S/ 179,90</span>
                    <span className="text-[11px] text-[#A3EEDF] font-semibold">/año</span>
                  </div>
                </div>
              </div>

              {/* Anchoring & Savings Banner */}
              <div className="pt-2 border-t border-[#354B45]/70 flex items-center justify-between text-[11px]">
                <span className="text-[#C4C7C5]">
                  Precio de referencia anual: <span className="line-through text-[#89938E]">S/ 238,80</span>
                </span>
                <span className="text-amber-300 font-extrabold bg-amber-400/10 px-2 py-0.5 rounded-md">
                  Ahorro anual: S/ 58,90 (25% aprox.)
                </span>
              </div>
            </div>

            {/* Monthly Plan */}
            <div
              onClick={() => setSelectedPlan('monthly_19')}
              className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
                selectedPlan === 'monthly_19'
                  ? 'border-[#70F6E3] bg-[#223631]'
                  : 'border-[#354B45] bg-[#242826] hover:border-[#4B635C]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    selectedPlan === 'monthly_19'
                      ? 'border-[#70F6E3] bg-[#70F6E3]'
                      : 'border-[#89938E]'
                  }`}
                >
                  {selectedPlan === 'monthly_19' && <Check className="w-3.5 h-3.5 text-stone-900 stroke-[3]" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-white">Plan Mensual</h4>
                    <span className="text-[10px] bg-[#2D312E] text-[#C4C7C5] font-medium px-1.5 py-0.2 rounded">
                      Pago mensual
                    </span>
                  </div>
                  <p className="text-[11px] text-[#89938E]">Flexibilidad total, cancela cuando desees</p>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-baseline justify-end gap-1">
                  <span className="text-lg font-black text-white">S/ 19,90</span>
                  <span className="text-[11px] text-[#89938E] font-semibold">/mes</span>
                </div>
                <span className="text-[10px] text-[#89938E] block">Cobro mensual</span>
              </div>
            </div>
          </div>

          {/* Payment Method Selector in Peru */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[#89938E] uppercase tracking-wider">
              Método de Pago Google Play (Perú)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedPaymentMethod('yape_plin')}
                className={`p-2 rounded-xl text-xs font-medium border flex items-center gap-2 justify-center transition ${
                  selectedPaymentMethod === 'yape_plin'
                    ? 'border-[#70F6E3] bg-[#273934] text-[#70F6E3]'
                    : 'border-[#354B45] bg-[#242826] text-[#C4C7C5]'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                Yape / Plin / QR
              </button>
              <button
                type="button"
                onClick={() => setSelectedPaymentMethod('card_googleplay')}
                className={`p-2 rounded-xl text-xs font-medium border flex items-center gap-2 justify-center transition ${
                  selectedPaymentMethod === 'card_googleplay'
                    ? 'border-[#70F6E3] bg-[#273934] text-[#70F6E3]'
                    : 'border-[#354B45] bg-[#242826] text-[#C4C7C5]'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                Tarjeta / Play Store
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Purchase button */}
          <button
            onClick={handlePurchase}
            disabled={isProcessing}
            className="w-full py-3.5 px-4 rounded-full bg-gradient-to-r from-[#006A60] to-[#008779] hover:from-[#008779] hover:to-[#70F6E3] text-white hover:text-stone-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#006A60]/30 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Verificando con Google Play...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>
                  Suscribirse por {selectedPlan === 'annual_179' ? 'S/ 179,90/año (S/ 14,99/mes)' : 'S/ 19,90/mes'}
                </span>
              </>
            )}
          </button>

          {/* Bottom actions */}
          <div className="flex items-center justify-between text-[11px] text-[#89938E] pt-1">
            <button
              onClick={handleRestorePurchases}
              disabled={isRestoring}
              className="hover:underline flex items-center gap-1 text-[#A3EEDF]"
            >
              <RefreshCw className={`w-3 h-3 ${isRestoring ? 'animate-spin' : ''}`} />
              Restaurar Compras
            </button>
            <span className="text-[10px]">Facturación oficial Google Play</span>
          </div>

          <p className="text-[10px] text-center text-[#89938E]/80 leading-relaxed">
            La suscripción se renueva automáticamente según las políticas de Google Play Store. Puedes cancelarla en cualquier momento desde Google Play &gt; Pagos y suscripciones. Precios en Soles (PEN) con IGV incluido.
          </p>
        </div>
      </div>
    </div>
  );
};
