
/**
 * Generador de códigos de barras EAN-13 válidos
 */

// Función para calcular el dígito de verificación EAN-13
function calculateEAN13CheckDigit(code12) {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(code12[i]);
    if (i % 2 === 0) {
      sum += digit;
    } else {
      sum += digit * 3;
    }
  }
  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}

// Generar un código EAN-13 único
function generateEAN13(productId) {
  // Usar un prefijo personalizado para la tienda (789) + productId + padding
  const prefix = "789";
  const paddedId = productId.toString().padStart(8, '0');
  const code12 = prefix + paddedId.slice(-9); // Tomar los últimos 9 dígitos para hacer 12 total
  const checkDigit = calculateEAN13CheckDigit(code12);
  return code12 + checkDigit;
}

// Generar código alternativo si ya existe
function generateAlternativeEAN13(baseId, attempt = 1) {
  const modifiedId = baseId + attempt;
  return generateEAN13(modifiedId);
}

module.exports = {
  generateEAN13,
  generateAlternativeEAN13,
  calculateEAN13CheckDigit
};
