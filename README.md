# Zigong Frontend

자공(Zigong) 서비스의 프론트엔드 애플리케이션입니다.
Angular 21 기반으로 구성되어 있으며, 대시보드/시뮬레이터 화면에서 백엔드 API 데이터를 시각화하고 사용자 소비 흐름을 확인할 수 있습니다.

## 1. 기술 스택

- Angular 21
- TypeScript
- Angular Material / CDK
- Chart.js + ng2-charts
- RxJS

## 2. 실행 환경

- Node.js 20 이상 권장
- npm 11 이상

버전 확인:

```bash
node -v
npm -v
```

## 3. 설치 및 실행

프로젝트 루트가 아니라 `frontend` 폴더에서 실행합니다.

```bash
cd frontend
npm install
npm run start
```

기본 실행 주소:

- `http://localhost:4200`

## 4. 주요 스크립트

```bash
# 개발 서버
npm run start

# 프로덕션 빌드
npm run build

# 개발 빌드 watch
npm run watch

# 단위 테스트
npm run test
```

## 5. 폴더 구조

```text
frontend/
	src/
		app/
			components/
				glass-card/
			pages/
				dashboard/
				simulator/
			services/
				api.ts
```

## 6. 백엔드 연동

프론트엔드는 `src/app/services/api.ts`에서 백엔드 API를 호출합니다.
로컬 개발 시 백엔드는 기본적으로 `http://localhost:8000`에서 실행되는 것을 기준으로 합니다.

백엔드 API 예시:

- `GET /api/user/{user_id}`
- `GET /api/transactions/{user_id}`
- `GET /api/user/{user_id}/analytics`
- `GET /api/user/{user_id}/anomalies`

## 7. 배포 빌드

```bash
cd frontend
npm run build
```

빌드 결과물은 `frontend/dist/`에 생성됩니다.

## 8. 개발 가이드

- 공통 UI 컴포넌트는 `components/`에 작성
- 페이지 단위 화면은 `pages/`에 작성
- API 호출/응답 매핑은 `services/api.ts`로 일원화

## 9. 트러블슈팅

- 포트 충돌 시:
	`npm run start -- --port 4300`
- 의존성 꼬임 시:
	`rm -rf node_modules package-lock.json && npm install`

## 10. Git 커밋 컨벤션

아래 타입을 기준으로 커밋합니다.

- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 관련
- `style`: 스타일 변경
- `refactor`: 코드 리팩토링
- `test`: 테스트 관련 코드
- `build`: 빌드 관련 파일 수정
- `ci`: CI 설정 파일 수정
- `perf`: 성능 개선
- `chore`: 그 외 자잘한 수정
