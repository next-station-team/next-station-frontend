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
  app/            화면 (onboarding, route, status, materials/new, session, arrival, plan, 홈)
  components/     공용 UI, session/ 아래에 모드별 화면
  data/stations   소요산~서울역 역 순서와 역간 소요 시간 (거리 기반 추정값)
  lib/
    trip.ts       남은 시간·현재 역 추정, 보정, 알림 시각 계산
    content.ts    남은 시간별 콘텐츠 선택 규칙 (경계값은 여기서만 조정)
    db.ts         IndexedDB 저장 (세션, 자료, 블록, 이어 하기 위치)
    api.ts        서버 API 호출 계약
    push.ts       Web Push 구독
    tts.ts        문장 단위 음성 읽기
public/sw.js      오프라인 캐시, 푸시 수신
```

## 백엔드 연동

`next.config.ts`의 rewrites가 `/api/*` 요청을 `API_BASE_URL`로 넘기므로 브라우저에서는 CORS 설정이 필요 없다.
`.env.local`(로컬)과 Vercel 환경변수에 아래 값을 넣는다. (`.env.example` 참고)

| 변수 | 설명 |
| --- | --- |
| `API_BASE_URL` | 백엔드 주소 (서버 전용, 끝에 `/` 없이) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | VAPID 공개키. 비워 두면 `GET /api/push/vapid-public-key`로 받는다 |

사용하는 API는 백엔드 레포 `docs/f00-f04-api.md` 기준이다: 푸시 구독, 테스트 푸시, 알림 예약(PUT)·취소(DELETE).
알림 시각은 서버가 계산하므로 프론트는 도착 예정 시각(`arrivalAt`)만 보낸다.
AI 콘텐츠 생성(`POST /api/generate`)은 백엔드 명세에 아직 없어서 임시 경로를 쓴다.

## 아직 없는 것

- AI 콘텐츠 생성 API 연동 (백엔드 명세 확정 후 `lib/api.ts`의 경로와 응답 형식을 맞춘다)
- 역간 소요 시간 실측 보정, P1 기능 (즐겨찾기 구간, GPS 보정)
