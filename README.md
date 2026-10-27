# 🌤️ SkyCast - 실시간 글로벌 날씨 예보 웹 애플리케이션

전 세계 도시 및 지역의 실시간 날씨 데이터와 주간 예보를 무료로 조회할 수 있는 반응형 웹 애플리케이션입니다.

---

## ✨ 주요 기능

1. **무료 공개 날씨 API 연동 (API 키 불필요)**
   - [Open-Meteo API](https://open-meteo.com/)를 활용하여 API 키 없이 실시간 날씨 및 7일간의 주간 예보 조회
   - 국내 주요 도시/자치구 즉시 좌표 매핑 및 [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org/) 연동으로 한글 지명 완벽 지원

2. **현재 날씨에 따른 동적 배경 테마**
   - 맑은 낮(☀️), 맑은 밤(🌙), 흐림(☁️), 비(🌧️), 눈(❄️), 천둥번개(⛈️) 등 기상 상태에 따라 전체 배경 그라데이션 및 조명 분위기 자동 전환

3. **기상 지표 및 예보**
   - 현재 기온 및 체감온도
   - **오늘의 최고기온 / 최저기온** 뱃지
   - 습도(%), 풍속(km/h), 강수량(mm), 대기압(hPa) 시각적 게이지 및 적정 상태 안내 문구
   - 7일간의 주간 날씨 예보 카드

4. **사용자 경험 & 예외 처리**
   - 정보 로딩 중 **"날씨 정보를 불러오는 중..."** 스피너 및 인디케이터 표시
   - 지역명 오타 및 존재하지 않는 지역 입력 시 친절한 안내 메시지 및 재시도 버튼 제공
   - 추천 도시 원클릭 칩(서울, 부산, 제주 등) 및 최근 검색어 기록(localStorage)
   - 브라우저 위치 권한을 통한 '내 위치 날씨(GPS)' 조회

5. **100% 반응형 디자인**
   - 모바일, 태블릿, 데스크톱 등 모든 디바이스에 최적화된 글래스모피즘(Glassmorphism) UI

---

## 🛠️ 기술 스택

- **HTML5**: 웹 표준 시맨틱 마크업
- **CSS3**: Vanilla CSS, Flexbox/Grid, Glassmorphism, CSS Variables
- **JavaScript (ES6+)**: Vanilla JS, Fetch API, Geolocation API, LocalStorage
- **API**: Open-Meteo Weather API & Geocoding API, OpenStreetMap Nominatim

---

## 🚀 실행 방법

별도의 서버 설치 없이 브라우저에서 `index.html`을 열어 바로 실행할 수 있습니다.
```bash
# 저장소 복제
git clone https://github.com/kyj08667372game-max/weather-app.git

# 폴더 이동 후 index.html 실행
cd weather-app
start index.html
```
