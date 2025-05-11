let sharedBuffer = null;
let sharedView = null;
let workRange = { start: 0, end: 0 };

self.onmessage = function(event) {
  const { type, buffer, range } = event.data;
  
  switch (type) {
    case 'init':
      sharedBuffer = buffer;
      workRange = range;
      
      sharedView = new Uint8Array(sharedBuffer, workRange.start, workRange.end - workRange.start);
      
      console.log('워커 1이 공유 버퍼로 초기화되었습니다');
      console.log('워커 1 범위:', workRange.start, '에서', workRange.end, '까지');
      console.log('초기 데이터 (처음 10바이트):', Array.from(sharedView.slice(0, 10)));
      
      processData();
      break;
      
    default:
      self.postMessage({ type: 'error', message: '알 수 없는 명령어입니다' });
  }
};

function processData() {
  if (!sharedView) {
    self.postMessage({ type: 'error', message: '공유 버퍼가 초기화되지 않았습니다' });
    return;
  }
  
  for (let i = 0; i < sharedView.length; i++) {
    Atomics.add(sharedView, i, 1);
    
    if (i % 100 === 0) {
      for (let j = 0; j < 1000; j++) {
      }
    }
  }
  
  self.postMessage({ 
    type: 'processed',
    result: '워커 1에서 데이터 처리 완료 - 각 바이트 값 증가'
  });
}

self.postMessage({ type: 'ready' });
