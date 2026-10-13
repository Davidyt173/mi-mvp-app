package com.adiestrapet.pe;

import android.app.Activity;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.android.billingclient.api.AcknowledgePurchaseParams;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesResponseListener;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CapacitorPlugin(name = "PlayBilling")
public class PlayBillingPlugin extends Plugin implements PurchasesUpdatedListener {

    private BillingClient billingClient;
    private final Map<String, ProductDetails> productDetailsMap = new HashMap<>();
    private PluginCall activePurchaseCall;

    @Override
    public void load() {
        super.load();
        initBillingClient();
    }

    private void initBillingClient() {
        billingClient = BillingClient.newBuilder(getContext())
                .setListener(this)
                .enablePendingPurchases()
                .build();

        billingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(@NonNull BillingResult billingResult) {
                if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    preloadProducts();
                }
            }

            @Override
            public void onBillingServiceDisconnected() {
                // Retry connection if needed
            }
        });
    }

    private void preloadProducts() {
        List<QueryProductDetailsParams.Product> productList = new ArrayList<>();
        productList.add(QueryProductDetailsParams.Product.newBuilder()
                .setProductId("adiestrapet_monthly_19")
                .setProductType(BillingClient.ProductType.SUBS)
                .build());
        productList.add(QueryProductDetailsParams.Product.newBuilder()
                .setProductId("adiestrapet_annual_179")
                .setProductType(BillingClient.ProductType.SUBS)
                .build());

        QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder()
                .setProductList(productList)
                .build();

        billingClient.queryProductDetailsAsync(params, (billingResult, productDetailsList) -> {
            if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                for (ProductDetails details : productDetailsList) {
                    productDetailsMap.put(details.getProductId(), details);
                }
            }
        });
    }

    @PluginMethod
    public void isReady(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("isReady", billingClient != null && billingClient.isReady());
        call.resolve(ret);
    }

    @PluginMethod
    public void launchPurchase(PluginCall call) {
        String productId = call.getString("productId");
        if (productId == null || productId.isEmpty()) {
            call.reject("ProductId es requerido");
            return;
        }

        if (billingClient == null || !billingClient.isReady()) {
            call.reject("BillingClient no está conectado");
            return;
        }

        ProductDetails productDetails = productDetailsMap.get(productId);
        if (productDetails == null) {
            call.reject("Producto no encontrado en Google Play: " + productId);
            return;
        }

        List<ProductDetails.SubscriptionOfferDetails> offers = productDetails.getSubscriptionOfferDetails();
        if (offers == null || offers.isEmpty()) {
            call.reject("No hay ofertas activas para esta suscripción");
            return;
        }

        String offerToken = offers.get(0).getOfferToken();

        List<BillingFlowParams.ProductDetailsParams> detailsParams = new ArrayList<>();
        detailsParams.add(BillingFlowParams.ProductDetailsParams.newBuilder()
                .setProductDetails(productDetails)
                .setOfferToken(offerToken)
                .build());

        BillingFlowParams flowParams = BillingFlowParams.newBuilder()
                .setProductDetailsParamsList(detailsParams)
                .build();

        this.activePurchaseCall = call;
        Activity activity = getActivity();
        if (activity != null) {
            billingClient.launchBillingFlow(activity, flowParams);
        } else {
            call.reject("Actividad Android no disponible");
        }
    }

    @PluginMethod
    public void restorePurchases(PluginCall call) {
        if (billingClient == null || !billingClient.isReady()) {
            call.reject("BillingClient no está listo");
            return;
        }

        QueryPurchasesParams params = QueryPurchasesParams.newBuilder()
                .setProductType(BillingClient.ProductType.SUBS)
                .build();

        billingClient.queryPurchasesAsync(params, (billingResult, purchases) -> {
            if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                JSObject ret = new JSObject();
                boolean hasActive = false;
                String activeToken = null;
                String activePackage = null;

                for (Purchase p : purchases) {
                    if (p.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
                        hasActive = true;
                        activeToken = p.getPurchaseToken();
                        List<String> prods = p.getProducts();
                        if (!prods.isEmpty()) {
                            activePackage = prods.get(0);
                        }
                        break;
                    }
                }
                ret.put("hasActiveSubscription", hasActive);
                ret.put("purchaseToken", activeToken);
                ret.put("productId", activePackage);
                call.resolve(ret);
            } else {
                call.reject("Error al consultar compras: " + billingResult.getDebugMessage());
            }
        });
    }

    @Override
    public void onPurchasesUpdated(@NonNull BillingResult billingResult, @Nullable List<Purchase> purchases) {
        if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK && purchases != null) {
            for (Purchase purchase : purchases) {
                handlePurchaseSuccess(purchase);
            }
        } else if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.USER_CANCELED) {
            if (activePurchaseCall != null) {
                activePurchaseCall.reject("Compra cancelada por el usuario");
                activePurchaseCall = null;
            }
        } else {
            if (activePurchaseCall != null) {
                activePurchaseCall.reject("Error Google Play: " + billingResult.getDebugMessage());
                activePurchaseCall = null;
            }
        }
    }

    private void handlePurchaseSuccess(Purchase purchase) {
        // Acknowledge if not acknowledged yet
        if (purchase.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
            if (!purchase.isAcknowledged()) {
                AcknowledgePurchaseParams ackParams = AcknowledgePurchaseParams.newBuilder()
                        .setPurchaseToken(purchase.getPurchaseToken())
                        .build();
                billingClient.acknowledgePurchase(ackParams, ackResult -> {
                    // Purchase acknowledged
                });
            }

            if (activePurchaseCall != null) {
                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("orderId", purchase.getOrderId());
                ret.put("purchaseToken", purchase.getPurchaseToken());
                ret.put("purchaseTime", purchase.getPurchaseTime());
                ret.put("products", purchase.getProducts().toString());
                activePurchaseCall.resolve(ret);
                activePurchaseCall = null;
            }

            // Also emit event to JS listener
            JSObject eventData = new JSObject();
            eventData.put("orderId", purchase.getOrderId());
            eventData.put("purchaseToken", purchase.getPurchaseToken());
            notifyListeners("onPurchaseCompleted", eventData);
        }
    }
}
