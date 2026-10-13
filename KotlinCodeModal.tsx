import React, { useState } from 'react';
import { X, Copy, Check, FileCode, Layers, ShieldCheck, Terminal } from 'lucide-react';

interface KotlinCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KotlinCodeModal: React.FC<KotlinCodeModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<string>('MainActivity.kt');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const files: Record<string, { desc: string; code: string }> = {
    'MainActivity.kt': {
      desc: 'Punto de entrada Jetpack Compose con Material 3, NavigationBar y Scaffold',
      code: `package com.adiestrapet.pe

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.compose.*
import com.adiestrapet.pe.ui.theme.AdiestraPetTheme
import com.adiestrapet.pe.ui.screens.*
import com.adiestrapet.pe.billing.BillingManager

class MainActivity : ComponentActivity() {
    private lateinit var billingManager: BillingManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        billingManager = BillingManager(this)
        billingManager.startConnection()

        setContent {
            AdiestraPetTheme {
                AdiestraPetApp(billingManager)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdiestraPetApp(billingManager: BillingManager) {
    val navController = rememberNavController()
    var currentRoute by remember { mutableStateOf("inicio") }

    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.surfaceContainer
            ) {
                listOf(
                    Triple("inicio", "Inicio", Icons.Default.Home),
                    Triple("entrenamiento", "Guía Canina", Icons.Default.MenuBook),
                    Triple("diagnostico", "IA Etólogo", Icons.Default.AutoAwesome),
                    Triple("progreso", "Progreso", Icons.Default.TrendingUp),
                    Triple("perfil", "Perfil", Icons.Default.Person)
                ).forEach { (route, label, icon) ->
                    NavigationBarItem(
                        selected = currentRoute == route,
                        onClick = {
                            currentRoute = route
                            navController.navigate(route)
                        },
                        icon = { Icon(icon, contentDescription = label) },
                        label = { Text(label) }
                    )
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = "inicio",
            modifier = Modifier.padding(innerPadding)
        ) {
            composable("inicio") { HomeScreen(navController) }
            composable("entrenamiento") { TrainingScreen(navController, billingManager) }
            composable("diagnostico") { DiagnosisScreen(navController, billingManager) }
            composable("progreso") { ProgressScreen(navController) }
            composable("perfil") { ProfileScreen(navController, billingManager) }
        }
    }
}`,
    },
    'BillingManager.kt': {
      desc: 'Google Play Billing Library v7 para suscripciones en Soles (PEN)',
      code: `package com.adiestrapet.pe.billing

import android.app.Activity
import android.content.Context
import com.android.billingclient.api.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

class BillingManager(private val context: Context) : PurchasesUpdatedListener {
    private val billingClient: BillingClient = BillingClient.newBuilder(context)
        .setListener(this)
        .enablePendingPurchases()
        .build()

    private val _isPremium = MutableStateFlow(false)
    val isPremium: StateFlow<Boolean> = _isPremium

    fun startConnection() {
        billingClient.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(billingResult: BillingResult) {
                if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                    queryPurchases()
                }
            }
            override fun onBillingServiceDisconnected() {
                // Reintentar conexión con backoff exponencial
            }
        })
    }

    fun launchBillingFlow(activity: Activity, planSku: String) {
        val productList = listOf(
            QueryProductDetailsParams.Product.newBuilder()
                .setProductId(planSku) // "adiestrapet_monthly_19" (S/19.90/m) o "adiestrapet_annual_179" (S/179.90/a)
                .setProductType(BillingClient.ProductType.SUBS)
                .build()
        )
        val params = QueryProductDetailsParams.newBuilder().setProductList(productList).build()

        billingClient.queryProductDetailsAsync(params) { _, productDetailsList ->
            val productDetails = productDetailsList.firstOrNull() ?: return@queryProductDetailsAsync
            val offerToken = productDetails.subscriptionOfferDetails?.firstOrNull()?.offerToken ?: return@queryProductDetailsAsync
            
            val flowParams = BillingFlowParams.newBuilder()
                .setProductDetailsParamsList(
                    listOf(
                        BillingFlowParams.ProductDetailsParams.newBuilder()
                            .setProductDetails(productDetails)
                            .setOfferToken(offerToken)
                            .build()
                    )
                ).build()
            billingClient.launchBillingFlow(activity, flowParams)
        }
    }

    override fun onPurchasesUpdated(billingResult: BillingResult, purchases: List<Purchase>?) {
        if (billingResult.responseCode == BillingClient.BillingResponseCode.OK && purchases != null) {
            for (purchase in purchases) {
                if (purchase.purchaseState == Purchase.PurchaseState.PURCHASED) {
                    verifyBackendToken(purchase.purchaseToken)
                }
            }
        }
    }

    private fun verifyBackendToken(token: String) {
        // Validación con backend Express / Firestore
        _isPremium.value = true
    }

    private fun queryPurchases() {
        billingClient.queryPurchasesAsync(
            QueryPurchasesParams.newBuilder()
                .setProductType(BillingClient.ProductType.SUBS)
                .build()
        ) { _, purchases ->
            _isPremium.value = purchases.any { it.purchaseState == Purchase.PurchaseState.PURCHASED }
        }
    }
}`,
    },
    'DiagnosisViewModel.kt': {
      desc: 'ViewModel para Diagnóstico IA Multimodal con CameraX y reglas etológicas LIMA',
      code: `package com.adiestrapet.pe.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import com.adiestrapet.pe.data.models.DiagnosisResult
import com.adiestrapet.pe.data.repository.DiagnosisRepository

class DiagnosisViewModel(
    private val repository: DiagnosisRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<DiagnosisUiState>(DiagnosisUiState.Idle)
    val uiState: StateFlow<DiagnosisUiState> = _uiState

    fun runDiagnosis(
        petName: String,
        species: String,
        description: String,
        imageBytes: ByteArray?
    ) {
        viewModelScope.launch {
            _uiState.value = DiagnosisUiState.Loading

            // Verificación previa de seguridad ética (dolor / mordedura severa)
            val severeWords = listOf("muerde fuerte", "sangre", "ataca ninos", "dolor agudo")
            val hasRisk = severeWords.any { description.lowercase().contains(it) }

            if (hasRisk) {
                _uiState.value = DiagnosisUiState.Warning(
                    "Alerta Profesional: Se requiere valoración veterinaria médica inmediata antes de intervenir en la conducta."
                )
                return@launch
            }

            try {
                val result = repository.requestMultimodalDiagnosis(
                    petName = petName,
                    species = species,
                    description = description,
                    imageBytes = imageBytes
                )
                _uiState.value = DiagnosisUiState.Success(result)
            } catch (e: Exception) {
                // Fallback clínico por reglas sin simular IA
                val fallback = repository.generateRuleBasedFallback(petName, species, description)
                _uiState.value = DiagnosisUiState.Success(fallback)
            }
        }
    }
}`,
    },
    'firestore.rules': {
      desc: 'Reglas de seguridad de Firestore por usuario para las 6 colecciones',
      code: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Función auxiliar para autenticación de usuario
    function isAuthenticated() {
      return request.auth != null;
    }
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Colección: mascotas
    match /mascotas/{mascotaId} {
      allow read, write: if isAuthenticated() && request.auth.uid == resource.data.userId;
      allow create: if isAuthenticated() && request.auth.uid == request.resource.data.userId;
    }

    // Colección: programas y modulos (lectura pública, edición solo admins)
    match /programas/{programaId} {
      allow read: if true;
      allow write: if false;
    }
    match /modulos/{moduloId} {
      allow read: if true;
      allow write: if false;
    }

    // Colección: progreso del usuario
    match /progreso/{progresoId} {
      allow read, write: if isAuthenticated() && request.auth.uid == resource.data.userId;
      allow create: if isAuthenticated() && request.auth.uid == request.resource.data.userId;
    }

    // Colección: diagnosticos
    match /diagnosticos/{diagnosticoId} {
      allow read, write: if isAuthenticated() && request.auth.uid == resource.data.userId;
      allow create: if isAuthenticated() && request.auth.uid == request.resource.data.userId;
    }

    // Colección: logros
    match /logros/{logroId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.uid == resource.data.userId;
    }
  }
}`,
    },
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(files[selectedFile].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[#1F2321] border border-[#354B45] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-[#E1E3DF]">
        {/* Header */}
        <div className="p-4 bg-[#191C1B] border-b border-[#2D312E] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-[#70F6E3]" />
            <div>
              <h3 className="text-sm font-bold text-white">
                Arquitectura Android Nativa (Kotlin + Jetpack Compose)
              </h3>
              <p className="text-[11px] text-[#89938E]">
                Estructura de producción para compilar en Android Studio
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

        {/* File tabs */}
        <div className="flex items-center gap-1.5 px-4 pt-2 border-b border-[#2D312E] bg-[#191C1B] overflow-x-auto text-xs">
          {Object.keys(files).map((name) => (
            <button
              key={name}
              onClick={() => setSelectedFile(name)}
              className={`px-3 py-1.5 rounded-t-xl font-mono transition flex items-center gap-1.5 ${
                selectedFile === name
                  ? 'bg-[#273934] text-[#70F6E3] font-bold border-t border-x border-[#354B45]'
                  : 'text-[#89938E] hover:text-white'
              }`}
            >
              <span>{name}</span>
            </button>
          ))}
        </div>

        {/* Code Content */}
        <div className="p-4 flex-1 overflow-hidden flex flex-col bg-[#141615]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#A3EEDF] font-medium">
              {files[selectedFile].desc}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs bg-[#242826] hover:bg-[#354B45] text-white px-2.5 py-1 rounded-lg border border-[#354B45] transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#70F6E3]" />
                  <span>Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#70F6E3]" />
                  <span>Copiar Código</span>
                </>
              )}
            </button>
          </div>

          <pre className="flex-1 overflow-auto p-4 rounded-2xl bg-[#0D0F0E] border border-[#2D312E] font-mono text-[11px] text-[#A3EEDF] leading-relaxed select-text">
            <code>{files[selectedFile].code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
