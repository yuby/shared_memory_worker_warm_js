// Logger module to override console methods and display logs in the UI

// Store original console methods
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

/**
 * Initialize the logger with a reference to the log container element
 * @param {HTMLElement} logContainerElement - The DOM element to append log entries to
 */
export function initLogger(logContainerElement) {
  const logContainer = logContainerElement;

  // Override console.log
  console.log = function(...args) {
    originalConsoleLog.apply(console, args);
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.textContent = args.map(arg => {
      if (typeof arg === 'object') return JSON.stringify(arg);
      return arg;
    }).join(' ');
    logContainer?.appendChild(logEntry);
    if (logContainer) logContainer.scrollTop = logContainer.scrollHeight;
  };

  // Override console.error
  console.error = function(...args) {
    originalConsoleError.apply(console, args);
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.style.color = 'red';
    logEntry.textContent = 'ERROR: ' + args.map(arg => {
      if (typeof arg === 'object') return JSON.stringify(arg);
      return arg;
    }).join(' ');
    logContainer?.appendChild(logEntry);
    if (logContainer) logContainer.scrollTop = logContainer.scrollHeight;
  };
}

/**
 * Reset console methods to their original implementations
 */
export function resetLogger() {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
}
