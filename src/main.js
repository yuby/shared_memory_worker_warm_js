// Main application code for shared memory WebAssembly with Web Workers
// import init, { greet } from './wasm/pkg/wasm.js';
import { initLogger } from './logger.js';
import './style.css';

// Initialize the logger when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // 먼저 로거를 초기화합니다
  const logContainer = document.getElementById('log-container');
  if (logContainer) {
    initLogger(logContainer);
    console.log('로거가 초기화되었습니다.');
  } else {
    console.error('로그 컨테이너를 찾을 수 없습니다!');
  }
  
  // 그 다음 애플리케이션을 초기화합니다
  initializeApp().catch(err => console.error('초기화 실패:', err));
});

async function initializeApp() {
  // Initialize WebAssembly module
  // await init();
  console.log('WebAssembly 모듈이 초기화되었습니다');
  
  // Call a function from the Wasm module
  // greet('웹어셈블리');
  
  // Create a SharedArrayBuffer for communication between workers
  const bufferSize = 1024;
  const sharedBuffer = new SharedArrayBuffer(bufferSize);
  
  // Create a view of the shared buffer
  const sharedArray = new Uint8Array(sharedBuffer);
  
  // Initialize the buffer with some data
  for (let i = 0; i < bufferSize; i++) {
    sharedArray[i] = i % 256;
  }
  
  console.log('SharedArrayBuffer가 초기화되었습니다. 크기:', bufferSize);
  console.log('초기 데이터 (처음 10바이트):', Array.from(sharedArray.slice(0, 10)));
  
  // Initialize the memory display
  initializeMemoryDisplay(sharedBuffer);
  
  // Initialize the workers with the shared buffer
  initializeWorkers(sharedBuffer);
}

function initializeMemoryDisplay(sharedBuffer) {
  const memoryDisplay = document.getElementById('memory-display');
  if (!memoryDisplay) return;
  
  // Create a view of the shared buffer
  const sharedArray = new Uint8Array(sharedBuffer);
  
  // Display the first 64 bytes of the buffer
  const displaySize = 64;
  const halfSize = displaySize / 2;
  
  for (let i = 0; i < displaySize; i++) {
    const cell = document.createElement('div');
    cell.className = 'memory-cell';
    cell.id = `memory-cell-${i}`;
    cell.textContent = sharedArray[i];
    
    // Add class to indicate which worker will process this cell
    if (i < halfSize) {
      cell.classList.add('worker1-range');
    } else {
      cell.classList.add('worker2-range');
    }
    
    memoryDisplay.appendChild(cell);
  }
}

function updateMemoryDisplay(sharedBuffer) {
  const sharedArray = new Uint8Array(sharedBuffer);
  const displaySize = 64;
  
  for (let i = 0; i < displaySize; i++) {
    const cell = document.getElementById(`memory-cell-${i}`);
    if (cell) {
      cell.textContent = sharedArray[i];
    }
  }
}

function initializeWorkers(sharedBuffer) {
  const worker1Status = document.getElementById('worker1-status');
  const worker2Status = document.getElementById('worker2-status');
  
  const worker1 = new Worker(new URL('./worker1.js', import.meta.url), { type: 'module' });
  const worker2 = new Worker(new URL('./worker2.js', import.meta.url), { type: 'module' });
  
  worker1.onmessage = function(event) {
    const { type, result, message } = event.data;
    
    switch (type) {
      case 'ready':
        console.log('워커 1이 준비되었습니다');
        if (worker1Status) worker1Status.textContent = 'Ready';
        
        worker1.postMessage({ 
          type: 'init', 
          buffer: sharedBuffer,
          range: { start: 0, end: sharedBuffer.byteLength / 2 }
        });
        
        if (worker1Status) worker1Status.textContent = 'Processing...';
        break;
        
      case 'processed':
        console.log('워커 1 결과:', result);
        if (worker1Status) worker1Status.textContent = 'Completed';
        
        const view1 = new Uint8Array(sharedBuffer, 0, 10);
        console.log('워커 1에서 업데이트된 데이터 (처음 10바이트):', Array.from(view1));
        
        updateMemoryDisplay(sharedBuffer);
        break;
        
      case 'error':
        console.error('워커 1 오류:', message);
        if (worker1Status) worker1Status.textContent = 'Error: ' + message;
        break;
    }
  };
  
  worker2.onmessage = function(event) {
    const { type, result, message } = event.data;
    
    switch (type) {
      case 'ready':
        console.log('워커 2가 준비되었습니다');
        if (worker2Status) worker2Status.textContent = 'Ready';
        
        worker2.postMessage({ 
          type: 'init', 
          buffer: sharedBuffer,
          range: { start: sharedBuffer.byteLength / 2, end: sharedBuffer.byteLength }
        });
        
        if (worker2Status) worker2Status.textContent = 'Processing...';
        break;
        
      case 'processed':
        console.log('워커 2 결과:', result);
        if (worker2Status) worker2Status.textContent = 'Completed';
        
        const view2 = new Uint8Array(sharedBuffer, sharedBuffer.byteLength / 2, 10);
        console.log('워커 2에서 업데이트된 데이터 (처음 10바이트):', Array.from(view2));
        
        updateMemoryDisplay(sharedBuffer);
        break;
        
      case 'error':
        console.error('워커 2 오류:', message);
        if (worker2Status) worker2Status.textContent = 'Error: ' + message;
        break;
    }
  };
  
  worker1.onerror = (error) => {
    console.error('워커 1 오류:', error);
    if (worker1Status) worker1Status.textContent = 'Error: ' + error.message;
  };
  
  worker2.onerror = (error) => {
    console.error('워커 2 오류:', error);
    if (worker2Status) worker2Status.textContent = 'Error: ' + error.message;
  };
}

