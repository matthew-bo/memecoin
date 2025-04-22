// Polyfills for Solana and web3 libraries
import { Buffer } from 'buffer';
import 'process/browser';

// Make Buffer available globally
window.Buffer = Buffer;

// Ensure process is available with all required properties
if (!window.process) {
  window.process = {
    env: { NODE_ENV: process.env.NODE_ENV || 'development' },
    browser: true,
    version: '',
    versions: {},
    nextTick: function(fn) {
      setTimeout(fn, 0);
    }
  };
} else {
  window.process.env = window.process.env || {};
  window.process.env.NODE_ENV = window.process.env.NODE_ENV || process.env.NODE_ENV || 'development';
  window.process.browser = true;
  window.process.nextTick = window.process.nextTick || function(fn) {
    setTimeout(fn, 0);
  };
}

// TextEncoder/TextDecoder polyfill for older browsers
if (typeof window.TextEncoder === 'undefined') {
  window.TextEncoder = function TextEncoder() {};
  window.TextEncoder.prototype.encode = function encode(str) {
    const utf8 = unescape(encodeURIComponent(str));
    const result = new Uint8Array(utf8.length);
    for (let i = 0; i < utf8.length; i++) {
      result[i] = utf8.charCodeAt(i);
    }
    return result;
  };
}

if (typeof window.TextDecoder === 'undefined') {
  window.TextDecoder = function TextDecoder() {};
  window.TextDecoder.prototype.decode = function decode(bytes) {
    const escaped = [];
    for (let i = 0; i < bytes.length; i++) {
      escaped.push('%' + ('0' + bytes[i].toString(16)).slice(-2));
    }
    return decodeURIComponent(escaped.join(''));
  };
} 