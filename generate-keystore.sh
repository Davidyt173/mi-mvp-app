#!/usr/bin/env bash
# ==============================================================================
# Generador de Llave Privada (Keystore) para AdiestraPet
# IMPORTANTE: Ejecuta este script para generar la llave con la que firmarás tu app.
# NUNCA subas el archivo .keystore a repositorios públicos.
# ==============================================================================
set -e

KEYSTORE_NAME="adiestrapet-release.keystore"
ALIAS_NAME="adiestrapet_key"

echo "🔐 Generando almacén de claves (Keystore) de producción para Google Play..."
echo "Te pedirá una contraseña segura y datos de identificación."

keytool -genkey -v \
  -keystore "$KEYSTORE_NAME" \
  -alias "$ALIAS_NAME" \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storetype JKS

echo ""
echo "✅ ¡Keystore generado exitosamente como '$KEYSTORE_NAME'!"
echo "Guarda una copia de seguridad de este archivo en un lugar seguro (ej. 1Password o Google Drive privado)."
echo "Si pierdes esta llave, no podrás actualizar tu app en Google Play Store."
