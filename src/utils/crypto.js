const crypto = require('crypto');

/**
 * Converte Buffer para string Base64URL segura para navegadores.
 * @param {Buffer} buffer 
 * @returns {string}
 */
function bufferToBase64URL(buffer) {
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Converte string Base64URL para Buffer.
 * @param {string} base64url 
 * @returns {Buffer}
 */
function base64URLToBuffer(base64url) {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64');
}

/**
 * Limpa buffers e variáveis contendo dados sensíveis na memória.
 * @param {Buffer} buffer 
 */
function wipeMemoryBuffer(buffer) {
  if (Buffer.isBuffer(buffer)) {
    buffer.fill(0);
  }
}

module.exports = {
  bufferToBase64URL,
  base64URLToBuffer,
  wipeMemoryBuffer
};