
/**
 * Generador de códigos de barras EAN-13 válidos y optimizados
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

// Generar un código EAN-13 único y válido
function generateEAN13(productId) {
  // Usar prefijo 789 (Venezuela) + timestamp parcial + productId
  const prefix = "789";
  const timestamp = Date.now().toString().slice(-3); // Últimos 3 dígitos del timestamp
  const paddedId = productId.toString().padStart(6, '0').slice(-6); // 6 dígitos para el ID
  
  // Crear código de 12 dígitos: 789 + 3 timestamp + 6 productId
  const code12 = prefix + timestamp + paddedId;
  const checkDigit = calculateEAN13CheckDigit(code12);
  
  const finalCode = code12 + checkDigit;
  console.log(`🔢 Código EAN-13 generado: ${finalCode} para producto ID: ${productId}`);
  return finalCode;
}

// Generar código alternativo si ya existe
function generateAlternativeEAN13(baseId, attempt = 1) {
  const modifiedId = baseId + (attempt * 1000); // Agregar offset significativo
  return generateEAN13(modifiedId);
}

// Validar formato EAN-13
function isValidEAN13(code) {
  if (!code || code.length !== 13) return false;
  if (!/^\d{13}$/.test(code)) return false;
  
  const checkDigit = parseInt(code[12]);
  const calculatedCheckDigit = calculateEAN13CheckDigit(code.slice(0, 12));
  
  return checkDigit === calculatedCheckDigit;
}

module.exports = {
  generateEAN13,
  generateAlternativeEAN13,
  calculateEAN13CheckDigit,
  isValidEAN13
};
