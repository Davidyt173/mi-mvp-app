import { registerPlugin, Capacitor } from '@capacitor/core';

interface PlayBillingPluginType {
  isReady(): Promise<{ isReady: boolean }>;
  launchPurchase(options: { productId: string }): Promise<{
    success: boolean;
    orderId?: string;
    purchaseToken: string;
    purchaseTime?: number;
    products?: string;
  }>;
  restorePurchases(): Promise<{
    hasActiveSubscription: boolean;
    purchaseToken?: string;
    productId?: string;
  }>;
}

const NativePlayBilling = registerPlugin<PlayBillingPluginType>('PlayBilling');

export class BillingService {
  isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  async checkBillingReady(): Promise<boolean> {
    if (!this.isNative()) return true;
    try {
      const res = await NativePlayBilling.isReady();
      return res.isReady;
    } catch {
      return false;
    }
  }

  async launchSubscriptionFlow(planId: 'monthly_19' | 'annual_179'): Promise<{
    success: boolean;
    purchaseToken: string;
    orderId?: string;
  }> {
    const skuMap = {
      monthly_19: 'adiestrapet_monthly_19',
      annual_179: 'adiestrapet_annual_179',
    };
    const productId = skuMap[planId];

    if (this.isNative()) {
      // Real Google Play Billing via native BillingClient v7
      const nativeResult = await NativePlayBilling.launchPurchase({ productId });
      return {
        success: nativeResult.success,
        purchaseToken: nativeResult.purchaseToken,
        orderId: nativeResult.orderId,
      };
    } else {
      // In web preview environment, generate simulated token for testing backend verification
      const purchaseToken = `play_pe_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      return {
        success: true,
        purchaseToken,
        orderId: `GPA.${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      };
    }
  }

  async restoreNativePurchases(): Promise<{
    hasActiveSubscription: boolean;
    purchaseToken?: string;
    productId?: string;
  }> {
    if (this.isNative()) {
      return await NativePlayBilling.restorePurchases();
    }
    return { hasActiveSubscription: false };
  }
}

export const billingService = new BillingService();
