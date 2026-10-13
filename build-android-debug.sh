#!/usr/bin/env bash
# ==============================================================================
# Script de compilación de APK de prueba (Debug) para AdiestraPet
# Permite instalar y probar la app directamente en un celular Android físico
# ==============================================================================
set -e

echo "🐶 [1/3] Compilando assets web de AdiestraPet..."
npm run build

echo "📲 [2/3] Sincronizando con el proyecto Android (Capacitor)..."
npx cap sync android

echo "🔨 [3/3] Compilando APK Debug con Gradle..."
cd android
./gradlew assembleDebug

echo ""
echo "✅ ¡APK de prueba generado con éxito!"
echo "📍 Ubicación del APK:"
echo "   android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "📱 CÓMO INSTALAR EN TU CELULAR:"
echo "   Opción A: Por cable USB con depuración activada:"
echo "      adb install android/app/build/outputs/apk/debug/app-debug.apk"
echo "   Opción B: Envía el archivo 'app-debug.apk' a tu teléfono por WhatsApp, Telegram o Google Drive,"
echo "      ábrelo en tu celular y pulsa 'Instalar'."
