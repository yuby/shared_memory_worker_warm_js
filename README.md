# SharedArrayBuffer를 활용한 데이터 공유


## 헤더에 추가될 정보
- 'Cross-Origin-Embedder-Policy': 'require-corp',
- 'Cross-Origin-Opener-Policy': 'same-origin'

vite.config.js에 추가
>> 모든 http요청에 해당 헤더가 추가되는데 일단 사이드 이펙트가 예상됨. 여러 우회 방법및 wasm기반 테스트가 필요할듯

```
// vite.config.js
export default {
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  }
}
```

## TODO
- iframe을 통한 격리
- wasm을 통한 데이터 공유 : SharedArrayBuffer 없이 동일한 wasm인스턴스를 기반으로 병렬처리

