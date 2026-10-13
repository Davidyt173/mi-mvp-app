#!/usr/bin/env bash
# ==============================================================================
# Script de compilación de AAB (Android App Bundle) para Google Play Store
# Genera el paquete oficial firmado para subir a Google Play Console
# ==============================================================================
set -e

echo "📦 ============================================================"
echo "   ADIESTRAPET - GENERADOR DE AAB PARA GOOGLE PLAY STORE"
echo "============================================================"

# 1. Compilación Web
echo "🐶 [1/4] Compilando frontend optimizado..."
npm run build

# 2. Sincronización Capacitor
echo "📲 [2/4] Sincronizando assets nativos..."
npx cap sync android

# 3. Verificación de Llave Keystore (Firma de Producción)
echo "🔐 [3/4] Verificando configuración de firma de Google Play..."

if [ -z "$KEYSTORE_PATH" ]; then
    echo "⚠️  NOTA: Las variables de entorno de firma no están definidas."
    echo "   Para firmar automáticamente durante la compilación, exporta:"
    echo "   export KEYSTORE_PATH=/ruta/a/tu/adiestrapet-release.keystore"
    echo "   export KEYSTORE_PASSWORD='tuPasswordSeguro'"
    echo "   export KEY_ALIAS='adiestrapet_key'"
    echo "   export KEY_PASSWORD='tuPasswordSeguro'"
    echo ""
    echo "   O si prefieres firmar después con jarsigner/apksigner."
fi

# 4. Compilación del AAB con Gradle
echo "🔨 [4/4] Ejecutando Gradle bundleRelease..."
cd android

if [ -n "$KEYSTORE_PATH" ]; then
    ./gradlew bundleRelease
else
    # Genera el AAB release sin firmar o firmado según config
    ./gradlew bundleRelease || ./gradlew bundle
fi

echo ""
echo "🎉 ¡Compilación finalizada!"
echo "📍 Ubicación del paquete AAB para Google Play Console:"
echo "   android/app/build/outputs/bundle/release/app-release.aab"
echo ""
echo "🚀 PASOS FINALES PARA SUBIR A GOOGLE PLAY:"
echo "   1. Entra a https://play.google.com/console"
echo "   2. Selecciona tu app AdiestraPet -> 'Producción' (o 'Prueba cerrada')"
echo "   3. Haz clic en 'Crear nueva versión' y arrastra el archivo 'app-release.aab'."
echo "   4. Agrega las notas de la versión (ej. 'Versión 1.0.0 inicial con diagnóstico IA y Guía Canina')."
echo "   5. ¡Listo para revisión de Google!"
