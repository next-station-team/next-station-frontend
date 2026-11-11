# next-station-frontend

1호선톤 「다음역」 프론트엔드. 통학 남은 시간에 맞춰 학습 콘텐츠를 보여 주고, 하차 전에 알림으로 마무리를 돕는 Next.js PWA.

## 실행

```bash
npm install
npm run dev
```

`.env.local`에 `NEXT_PUBLIC_VAPID_PUBLIC_KEY`를 넣으면 푸시 구독이 동작한다. (`.env.example` 참고)
서비스 워커는 프로덕션 빌드(`npm run build && npm start`)에서만 등록된다.

## 구조

```
src/
  app/            화면 (onboarding, route, status, materials/new, session, 홈)
  components/     공용 UI, session/ 아래에 모드별 화면
  data/stations   역 순서와 역간 소요 시간 (임시값)
  lib/
    trip.ts       남은 시간·현재 역 추정, 보정, 알림 시각 계산
    content.ts    남은 시간별 콘텐츠 선택 규칙 (경계값은 여기서만 조정)
    db.ts         IndexedDB 저장 (세션, 자료, 블록, 이어 하기 위치)
    api.ts        서버 API 호출 계약
    push.ts       Web Push 구독
    tts.ts        문장 단위 음성 읽기
public/sw.js      오프라인 캐시, 푸시 수신
```

## 서버에 기대하는 API

| 엔드포인트 | 요청 | 설명 |
| --- | --- | --- |
| `POST /api/push/subscribe` | `{ deviceId, subscription }` | 푸시 구독 등록 |
| `POST /api/alarms` | `{ deviceId, sessionId, alarms: [{ kind, at }] }` | 기존 예약을 지우고 재등록 (`at`은 ms) |
| `POST /api/generate` | `{ text }` | `{ title, blocks[] }` 반환. 블록은 `summary`/`quiz`/`word` + `seconds` |

## 아직 없는 것

- Figma에서 비어 있던 화면: 세션 마무리(하차 준비), 남은 시간 기반 콘텐츠 화면
- 서버 API 구현 (위 계약만 정의)
- 역 데이터 실측 보정, P1 기능 (즐겨찾기 구간, GPS 보정)
