// src/index.js
import CSVValidator from './CSVValidator.js';

// Export for Node.js and ES6 import
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = CSVValidator;
} else if (typeof define === 'function' && define.amd) {
    // AMD support
    define([], () => CSVValidator);
} else {
    // Browser globals
    window.CSVValidator = CSVValidator; // Make it globally available
}
