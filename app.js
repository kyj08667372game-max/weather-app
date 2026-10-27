/**
 * SkyCast - 실시간 날씨 웹 애플리케이션
 * API: Open-Meteo API (무료, API Key 불필요, 글로벌 지원)
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // DOM Elements
  // ==========================================
  const searchForm = document.getElementById('weather-search-form');
  const searchInput = document.getElementById('search-input');
  const btnClearSearch = document.getElementById('btn-clear-search');
  const btnSearch = document.getElementById('btn-search');
  const btnCurrentLocation = document.getElementById('btn-current-location');
  const liveTimeEl = document.getElementById('live-time');

  // Recommendation & Recent Chips
  const quickChips = document.querySelectorAll('.quick-chips .chip');
  const recentSearchesContainer = document.getElementById('recent-searches-container');
  const recentChips = document.getElementById('recent-chips');
  const btnClearRecent = document.getElementById('btn-clear-recent');

  // Views / States
  const stateLoading = document.getElementById('state-loading');
  const stateMessage = document.getElementById('state-message');
  const messageIcon = document.getElementById('message-icon');
  const messageTitle = document.getElementById('message-title');
  const messageDesc = document.getElementById('message-desc');
  const btnMessageAction = document.getElementById('btn-message-action');
  const stateWeather = document.getElementById('state-weather');

  // Weather Card Elements
  const currentLocationName = document.getElementById('current-location-name');
  const currentCountryBadge = document.getElementById('current-country-badge');
  const currentCoordsText = document.getElementById('current-coords-text');
  const currentUpdateTime = document.getElementById('current-update-time');
  const weatherEmoji = document.getElementById('weather-emoji');
  const currentTemp = document.getElementById('current-temp');
  const todayMinTemp = document.getElementById('today-min-temp');
  const todayMaxTemp = document.getElementById('today-max-temp');
  const weatherConditionTitle = document.getElementById('weather-condition-title');
  const weatherConditionDesc = document.getElementById('weather-condition-desc');
  const currentFeelsLike = document.getElementById('current-feels-like');

  // Metric Elements
  const metricHumidity = document.getElementById('metric-humidity');
  const humidityBar = document.getElementById('humidity-bar');
  const humidityStatus = document.getElementById('humidity-status');

  const metricWind = document.getElementById('metric-wind');
  const windBar = document.getElementById('wind-bar');
  const windStatus = document.getElementById('wind-status');

  const metricPrecipitation = document.getElementById('metric-precipitation');
  const rainBar = document.getElementById('rain-bar');
  const rainStatus = document.getElementById('rain-status');

  const metricPressure = document.getElementById('metric-pressure');
  const pressureBar = document.getElementById('pressure-bar');
  const pressureStatus = document.getElementById('pressure-status');

  // Weekly Forecast List
  const weeklyForecastList = document.getElementById('weekly-forecast-list');

  // Recent searches cache
  const RECENT_KEY = 'skycast_recent_cities';
  let recentSearches = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');

  // ==========================================
  // WMO Weather Interpretation Codes
  // https://open-meteo.com/en/docs
  // ==========================================
  const WMO_CODE_MAP = {
    0: {
      title: '맑음',
      dayEmoji: '☀️',
      nightEmoji: '🌙',
      desc: '구름 한 점 없는 화창하고 맑은 하늘입니다.',
      themeDay: 'theme-clear-day',
      themeNight: 'theme-clear-night'
    },
    1: {
      title: '대체로 맑음',
      dayEmoji: '🌤️',
      nightEmoji: '🌤️',
      desc: '대체로 맑고 가벼운 구름이 지나가는 날씨입니다.',
      themeDay: 'theme-clear-day',
      themeNight: 'theme-clear-night'
    },
    2: {
      title: '구름 조금',
      dayEmoji: '⛅',
      nightEmoji: '☁️',
      desc: '구름이 햇살과 어우러져 야외 활동하기 좋은 날씨입니다.',
      themeDay: 'theme-cloudy',
      themeNight: 'theme-clear-night'
    },
    3: {
      title: '흐림',
      dayEmoji: '☁️',
      nightEmoji: '☁️',
      desc: '하늘 전체에 구름이 가득하여 다소 흐린 날씨입니다.',
      themeDay: 'theme-cloudy',
      themeNight: 'theme-cloudy'
    },
    45: {
      title: '안개',
      dayEmoji: '🌫️',
      nightEmoji: '🌫️',
      desc: '가시거리가 짧은 짙은 안개가 끼어 있으니 운전에 유의하세요.',
      themeDay: 'theme-cloudy',
      themeNight: 'theme-cloudy'
    },
    48: {
      title: '빙결 안개',
      dayEmoji: '🌫️',
      nightEmoji: '🌫️',
      desc: '서리를 동반한 차가운 안개가 형성되어 있습니다.',
      themeDay: 'theme-snowy',
      themeNight: 'theme-snowy'
    },
    51: {
      title: '약한 이슬비',
      dayEmoji: '🌦️',
      nightEmoji: '🌧️',
      desc: '작은 빗방울이 약하게 흩날리는 이슬비가 내립니다.',
      themeDay: 'theme-rainy',
      themeNight: 'theme-rainy'
    },
    53: {
      title: '이슬비',
      dayEmoji: '🌦️',
      nightEmoji: '🌧️',
      desc: '촉촉한 이슬비가 지속적으로 내리고 있습니다.',
      themeDay: 'theme-rainy',
      themeNight: 'theme-rainy'
    },
    55: {
      title: '강한 이슬비',
      dayEmoji: '🌧️',
      nightEmoji: '🌧️',
      desc: '굵은 빗방울의 이슬비가 내리니 작은 우산을 챙기세요.',
      themeDay: 'theme-rainy',
      themeNight: 'theme-rainy'
    },
    56: {
      title: '어는 이슬비',
      dayEmoji: '🌨️',
      nightEmoji: '🌨️',
      desc: '얼어붙는 차가운 비가 내리니 빙판길에 주의하세요.',
      themeDay: 'theme-snowy',
      themeNight: 'theme-snowy'
    },
    57: {
      title: '강한 어는 이슬비',
      dayEmoji: '🌨️',
      nightEmoji: '🌨️',
      desc: '지면에 닿아 어는 강한 비가 내리고 있습니다.',
      themeDay: 'theme-snowy',
      themeNight: 'theme-snowy'
    },
    61: {
      title: '약한 비',
      dayEmoji: '🌦️',
      nightEmoji: '🌧️',
      desc: '부슬부슬 가벼운 비가 내리고 있습니다. 우산을 준비하세요.',
      themeDay: 'theme-rainy',
      themeNight: 'theme-rainy'
    },
    63: {
      title: '비',
      dayEmoji: '🌧️',
      nightEmoji: '🌧️',
      desc: '비가 내리고 있습니다. 외출 시 우산이 필요합니다.',
      themeDay: 'theme-rainy',
      themeNight: 'theme-rainy'
    },
    65: {
      title: '강한 비',
      dayEmoji: '🌧️',
      nightEmoji: '🌧️',
      desc: '세찬 빗줄기가 쏟아지고 있으니 안전에 유의하세요.',
      themeDay: 'theme-rainy',
      themeNight: 'theme-rainy'
    },
    66: {
      title: '진눈깨비',
      dayEmoji: '🌨️',
      nightEmoji: '🌨️',
      desc: '비와 눈이 섞여 내리는 궂은 날씨입니다.',
      themeDay: 'theme-snowy',
      themeNight: 'theme-snowy'
    },
    67: {
      title: '강한 진눈깨비',
      dayEmoji: '🌨️',
      nightEmoji: '🌨️',
      desc: '차가운 비와 눈이 거세게 휘몰아칩니다.',
      themeDay: 'theme-snowy',
      themeNight: 'theme-snowy'
    },
    71: {
      title: '약한 눈',
      dayEmoji: '❄️',
      nightEmoji: '❄️',
      desc: '포근한 하얀 눈이 소복소복 내리고 있습니다.',
      themeDay: 'theme-snowy',
      themeNight: 'theme-snowy'
    },
    73: {
      title: '눈',
      dayEmoji: '❄️',
      nightEmoji: '❄️',
      desc: '눈이 내리고 있어 길이 미끄러울 수 있으니 주의하세요.',
      themeDay: 'theme-snowy',
      themeNight: 'theme-snowy'
    },
    75: {
      title: '강한 눈',
      dayEmoji: '❄️',
      nightEmoji: '❄️',
      desc: '많은 양의 눈이 쏟아져 대설에 주의가 필요합니다.',
      themeDay: 'theme-snowy',
      themeNight: 'theme-snowy'
    },
    77: {
      title: '싸락눈',
      dayEmoji: '🌨️',
      nightEmoji: '🌨️',
      desc: '작은 얼음 알갱이 형태의 싸락눈이 내립니다.',
      themeDay: 'theme-snowy',
      themeNight: 'theme-snowy'
    },
    80: {
      title: '약한 소나기',
      dayEmoji: '🌦️',
      nightEmoji: '🌧️',
      desc: '짧은 시간 동안 지나가는 소나기가 내릴 수 있습니다.',
      themeDay: 'theme-rainy',
      themeNight: 'theme-rainy'
    },
    81: {
      title: '소나기',
      dayEmoji: '🌧️',
      nightEmoji: '🌧️',
      desc: '갑작스러운 소나기가 내리고 있으니 비를 피하세요.',
      themeDay: 'theme-rainy',
      themeNight: 'theme-rainy'
    },
    82: {
      title: '강한 소나기',
      dayEmoji: '🌧️',
      nightEmoji: '🌧️',
      desc: '매우 거센 폭우성 소나기가 쏟아지고 있습니다.',
      themeDay: 'theme-rainy',
      themeNight: 'theme-rainy'
    },
    85: {
      title: '소낙눈',
      dayEmoji: '🌨️',
      nightEmoji: '🌨️',
      desc: '갑자기 거세게 쏟아지는 소낙눈이 내립니다.',
      themeDay: 'theme-snowy',
      themeNight: 'theme-snowy'
    },
    86: {
      title: '강한 소낙눈',
      dayEmoji: '🌨️',
      nightEmoji: '🌨️',
      desc: '시야를 가릴 만큼 세찬 눈보라성 소낙눈입니다.',
      themeDay: 'theme-snowy',
      themeNight: 'theme-snowy'
    },
    95: {
      title: '뇌우',
      dayEmoji: '⛈️',
      nightEmoji: '⛈️',
      desc: '천둥과 번개를 동반한 거친 비구름이 발달했습니다.',
      themeDay: 'theme-thunder',
      themeNight: 'theme-thunder'
    },
    96: {
      title: '우박 동반 뇌우',
      dayEmoji: '⛈️',
      nightEmoji: '⛈️',
      desc: '천둥 번개와 함께 작은 우박이 떨어질 수 있습니다.',
      themeDay: 'theme-thunder',
      themeNight: 'theme-thunder'
    },
    99: {
      title: '강한 우박 뇌우',
      dayEmoji: '⛈️',
      nightEmoji: '⛈️',
      desc: '강한 우박과 돌풍을 동반한 매우 위험한 뇌우입니다.',
      themeDay: 'theme-thunder',
      themeNight: 'theme-thunder'
    }
  };

  /**
   * WMO 코드 정보 조회 헬퍼
   */
  function getWeatherMeta(code, isDay = 1) {
    const meta = WMO_CODE_MAP[code] || {
      title: '대체로 맑음',
      dayEmoji: '🌤️',
      nightEmoji: '🌤️',
      desc: '온화하고 평온한 기상 상태입니다.',
      themeDay: 'theme-clear-day',
      themeNight: 'theme-clear-night'
    };
    return {
      title: meta.title,
      emoji: isDay ? meta.dayEmoji : meta.nightEmoji,
      desc: meta.desc,
      themeClass: isDay ? meta.themeDay : meta.themeNight
    };
  }

  // ==========================================
  // Live Clock Updater
  // ==========================================
  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    if (liveTimeEl) {
      liveTimeEl.textContent = `${hours}:${minutes}:${seconds}`;
    }
  }
  updateClock();
  setInterval(updateClock, 1000);

  // ==========================================
  // UI State Switchers
  // ==========================================
  function showLoading() {
    stateLoading.classList.remove('hidden');
    stateMessage.classList.add('hidden');
    stateWeather.classList.add('hidden');
  }

  function showMessage(icon, title, desc, showAction = false, actionText = '다시 시도하기', actionCallback = null) {
    stateLoading.classList.add('hidden');
    stateWeather.classList.add('hidden');
    stateMessage.classList.remove('hidden');

    messageIcon.textContent = icon;
    messageTitle.textContent = title;
    messageDesc.textContent = desc;

    if (showAction && actionCallback) {
      btnMessageAction.textContent = actionText;
      btnMessageAction.classList.remove('hidden');
      btnMessageAction.onclick = actionCallback;
    } else {
      btnMessageAction.classList.add('hidden');
    }
  }

  function showWeather() {
    stateLoading.classList.add('hidden');
    stateMessage.classList.add('hidden');
    stateWeather.classList.remove('hidden');
  }

  // ==========================================
  // Weather Theme Updater
  // ==========================================
  function updateTheme(themeClass) {
    document.body.className = '';
    document.body.classList.add(themeClass);
  }

  // ==========================================
  // Built-in Korean & Major World Cities Coordinates Map
  // (Instant, 100% reliable, zero network failure for Korean queries)
  // ==========================================
  const PRESET_CITIES = {
    // 대한민국 특별시 및 광역시
    '서울': { lat: 37.5665, lon: 126.9780, name: '서울특별시', country: '대한민국' },
    '서울특별시': { lat: 37.5665, lon: 126.9780, name: '서울특별시', country: '대한민국' },
    '부산': { lat: 35.1796, lon: 129.0756, name: '부산광역시', country: '대한민국' },
    '부산광역시': { lat: 35.1796, lon: 129.0756, name: '부산광역시', country: '대한민국' },
    '인천': { lat: 37.4563, lon: 126.7052, name: '인천광역시', country: '대한민국' },
    '인천광역시': { lat: 37.4563, lon: 126.7052, name: '인천광역시', country: '대한민국' },
    '대구': { lat: 35.8714, lon: 128.6014, name: '대구광역시', country: '대한민국' },
    '대구광역시': { lat: 35.8714, lon: 128.6014, name: '대구광역시', country: '대한민국' },
    '대전': { lat: 36.3504, lon: 127.3845, name: '대전광역시', country: '대한민국' },
    '대전광역시': { lat: 36.3504, lon: 127.3845, name: '대전광역시', country: '대한민국' },
    '광주': { lat: 35.1595, lon: 126.8526, name: '광주광역시', country: '대한민국' },
    '광주광역시': { lat: 35.1595, lon: 126.8526, name: '광주광역시', country: '대한민국' },
    '울산': { lat: 35.5384, lon: 129.3114, name: '울산광역시', country: '대한민국' },
    '울산광역시': { lat: 35.5384, lon: 129.3114, name: '울산광역시', country: '대한민국' },
    '세종': { lat: 36.4800, lon: 127.2890, name: '세종특별자치시', country: '대한민국' },
    '세종시': { lat: 36.4800, lon: 127.2890, name: '세종특별자치시', country: '대한민국' },
    '세종특별자치시': { lat: 36.4800, lon: 127.2890, name: '세종특별자치시', country: '대한민국' },

    // 제주
    '제주': { lat: 33.4996, lon: 126.5312, name: '제주특별자치도', country: '대한민국' },
    '제주도': { lat: 33.4996, lon: 126.5312, name: '제주특별자치도', country: '대한민국' },
    '제주시': { lat: 33.4996, lon: 126.5312, name: '제주시', country: '대한민국' },
    '서귀포': { lat: 33.2541, lon: 126.5601, name: '서귀포시', country: '대한민국' },
    '서귀포시': { lat: 33.2541, lon: 126.5601, name: '서귀포시', country: '대한민국' },

    // 경기도
    '수원': { lat: 37.2636, lon: 127.0286, name: '수원시', country: '대한민국' },
    '수원시': { lat: 37.2636, lon: 127.0286, name: '수원시', country: '대한민국' },
    '성남': { lat: 37.4200, lon: 127.1265, name: '성남시', country: '대한민국' },
    '성남시': { lat: 37.4200, lon: 127.1265, name: '성남시', country: '대한민국' },
    '분당': { lat: 37.3827, lon: 127.1189, name: '성남시 분당구', country: '대한민국' },
    '판교': { lat: 37.3947, lon: 127.1112, name: '성남시 판교', country: '대한민국' },
    '고양': { lat: 37.6584, lon: 126.8320, name: '고양시', country: '대한민국' },
    '고양시': { lat: 37.6584, lon: 126.8320, name: '고양시', country: '대한민국' },
    '일산': { lat: 37.6584, lon: 126.7700, name: '고양시 일산', country: '대한민국' },
    '용인': { lat: 37.2411, lon: 127.1776, name: '용인시', country: '대한민국' },
    '용인시': { lat: 37.2411, lon: 127.1776, name: '용인시', country: '대한민국' },
    '부천': { lat: 37.5034, lon: 126.7660, name: '부천시', country: '대한민국' },
    '부천시': { lat: 37.5034, lon: 126.7660, name: '부천시', country: '대한민국' },
    '안산': { lat: 37.3219, lon: 126.8309, name: '안산시', country: '대한민국' },
    '안산시': { lat: 37.3219, lon: 126.8309, name: '안산시', country: '대한민국' },
    '안양': { lat: 37.3943, lon: 126.9568, name: '안양시', country: '대한민국' },
    '안양시': { lat: 37.3943, lon: 126.9568, name: '안양시', country: '대한민국' },
    '평택': { lat: 36.9921, lon: 127.1129, name: '평택시', country: '대한민국' },
    '평택시': { lat: 36.9921, lon: 127.1129, name: '평택시', country: '대한민국' },
    '화성': { lat: 37.1995, lon: 126.8315, name: '화성시', country: '대한민국' },
    '화성시': { lat: 37.1995, lon: 126.8315, name: '화성시', country: '대한민국' },
    '동탄': { lat: 37.2002, lon: 127.0744, name: '화성시 동탄', country: '대한민국' },
    '시흥': { lat: 37.3802, lon: 126.8029, name: '시흥시', country: '대한민국' },
    '시흥시': { lat: 37.3802, lon: 126.8029, name: '시흥시', country: '대한민국' },
    '파주': { lat: 37.7599, lon: 126.7799, name: '파주시', country: '대한민국' },
    '파주시': { lat: 37.7599, lon: 126.7799, name: '파주시', country: '대한민국' },
    '김포': { lat: 37.6153, lon: 126.7155, name: '김포시', country: '대한민국' },
    '김포시': { lat: 37.6153, lon: 126.7155, name: '김포시', country: '대한민국' },
    '의정부': { lat: 37.7381, lon: 127.0337, name: '의정부시', country: '대한민국' },
    '의정부시': { lat: 37.7381, lon: 127.0337, name: '의정부시', country: '대한민국' },
    '남양주': { lat: 37.6360, lon: 127.2165, name: '남양주시', country: '대한민국' },
    '남양주시': { lat: 37.6360, lon: 127.2165, name: '남양주시', country: '대한민국' },
    '하남': { lat: 37.5393, lon: 127.2148, name: '하남시', country: '대한민국' },
    '하남시': { lat: 37.5393, lon: 127.2148, name: '하남시', country: '대한민국' },
    '광명': { lat: 37.4786, lon: 126.8647, name: '광명시', country: '대한민국' },
    '광명시': { lat: 37.4786, lon: 126.8647, name: '광명시', country: '대한민국' },

    // 강원도
    '춘천': { lat: 37.8813, lon: 127.7298, name: '춘천시', country: '대한민국' },
    '춘천시': { lat: 37.8813, lon: 127.7298, name: '춘천시', country: '대한민국' },
    '원주': { lat: 37.3422, lon: 127.9202, name: '원주시', country: '대한민국' },
    '원주시': { lat: 37.3422, lon: 127.9202, name: '원주시', country: '대한민국' },
    '강릉': { lat: 37.7519, lon: 128.8761, name: '강릉시', country: '대한민국' },
    '강릉시': { lat: 37.7519, lon: 128.8761, name: '강릉시', country: '대한민국' },
    '속초': { lat: 38.2070, lon: 128.5918, name: '속초시', country: '대한민국' },
    '속초시': { lat: 38.2070, lon: 128.5918, name: '속초시', country: '대한민국' },
    '동해': { lat: 37.5244, lon: 129.1143, name: '동해시', country: '대한민국' },
    '동해시': { lat: 37.5244, lon: 129.1143, name: '동해시', country: '대한민국' },

    // 충청도
    '청주': { lat: 36.6424, lon: 127.4890, name: '청주시', country: '대한민국' },
    '청주시': { lat: 36.6424, lon: 127.4890, name: '청주시', country: '대한민국' },
    '충주': { lat: 36.9910, lon: 127.9259, name: '충주시', country: '대한민국' },
    '충주시': { lat: 36.9910, lon: 127.9259, name: '충주시', country: '대한민국' },
    '천안': { lat: 36.8151, lon: 127.1139, name: '천안시', country: '대한민국' },
    '천안시': { lat: 36.8151, lon: 127.1139, name: '천안시', country: '대한민국' },
    '아산': { lat: 36.7898, lon: 127.0018, name: '아산시', country: '대한민국' },
    '아산시': { lat: 36.7898, lon: 127.0018, name: '아산시', country: '대한민국' },
    '서산': { lat: 36.7845, lon: 126.4503, name: '서산시', country: '대한민국' },
    '서산시': { lat: 36.7845, lon: 126.4503, name: '서산시', country: '대한민국' },

    // 전라도
    '전주': { lat: 35.8242, lon: 127.1480, name: '전주시', country: '대한민국' },
    '전주시': { lat: 35.8242, lon: 127.1480, name: '전주시', country: '대한민국' },
    '군산': { lat: 35.9676, lon: 126.7366, name: '군산시', country: '대한민국' },
    '군산시': { lat: 35.9676, lon: 126.7366, name: '군산시', country: '대한민국' },
    '익산': { lat: 35.9483, lon: 126.9576, name: '익산시', country: '대한민국' },
    '익산시': { lat: 35.9483, lon: 126.9576, name: '익산시', country: '대한민국' },
    '목포': { lat: 34.8118, lon: 126.3922, name: '목포시', country: '대한민국' },
    '목포시': { lat: 34.8118, lon: 126.3922, name: '목포시', country: '대한민국' },
    '여수': { lat: 34.7604, lon: 127.6622, name: '여수시', country: '대한민국' },
    '여수시': { lat: 34.7604, lon: 127.6622, name: '여수시', country: '대한민국' },
    '순천': { lat: 34.9506, lon: 127.4872, name: '순천시', country: '대한민국' },
    '순천시': { lat: 34.9506, lon: 127.4872, name: '순천시', country: '대한민국' },

    // 경상도
    '포항': { lat: 36.0190, lon: 129.3435, name: '포항시', country: '대한민국' },
    '포항시': { lat: 36.0190, lon: 129.3435, name: '포항시', country: '대한민국' },
    '경주': { lat: 35.8562, lon: 129.2247, name: '경주시', country: '대한민국' },
    '경주시': { lat: 35.8562, lon: 129.2247, name: '경주시', country: '대한민국' },
    '구미': { lat: 36.1195, lon: 128.3446, name: '구미시', country: '대한민국' },
    '구미시': { lat: 36.1195, lon: 128.3446, name: '구미시', country: '대한민국' },
    '안동': { lat: 36.5684, lon: 128.7294, name: '안동시', country: '대한민국' },
    '안동시': { lat: 36.5684, lon: 128.7294, name: '안동시', country: '대한민국' },
    '창원': { lat: 35.2281, lon: 128.6811, name: '창원시', country: '대한민국' },
    '창원시': { lat: 35.2281, lon: 128.6811, name: '창원시', country: '대한민국' },
    '김해': { lat: 35.2285, lon: 128.8894, name: '김해시', country: '대한민국' },
    '김해시': { lat: 35.2285, lon: 128.8894, name: '김해시', country: '대한민국' },
    '진주': { lat: 35.1802, lon: 128.1076, name: '진주시', country: '대한민국' },
    '진주시': { lat: 35.1802, lon: 128.1076, name: '진주시', country: '대한민국' },
    '양산': { lat: 35.3350, lon: 129.0373, name: '양산시', country: '대한민국' },
    '양산시': { lat: 35.3350, lon: 129.0373, name: '양산시', country: '대한민국' },
    '거제': { lat: 34.8806, lon: 128.6211, name: '거제시', country: '대한민국' },
    '거제시': { lat: 34.8806, lon: 128.6211, name: '거제시', country: '대한민국' },
    '울릉도': { lat: 37.4844, lon: 130.9057, name: '울릉도', country: '대한민국' },
    '독도': { lat: 37.2407, lon: 131.8696, name: '독도', country: '대한민국' },

    // 서울 주요 자치구
    '강남': { lat: 37.5172, lon: 127.0473, name: '서울 강남구', country: '대한민국' },
    '강남구': { lat: 37.5172, lon: 127.0473, name: '서울 강남구', country: '대한민국' },
    '서초': { lat: 37.4837, lon: 127.0324, name: '서울 서초구', country: '대한민국' },
    '서초구': { lat: 37.4837, lon: 127.0324, name: '서울 서초구', country: '대한민국' },
    '송파': { lat: 37.5145, lon: 127.1066, name: '서울 송파구', country: '대한민국' },
    '송파구': { lat: 37.5145, lon: 127.1066, name: '서울 송파구', country: '대한민국' },
    '마포': { lat: 37.5663, lon: 126.9016, name: '서울 마포구', country: '대한민국' },
    '마포구': { lat: 37.5663, lon: 126.9016, name: '서울 마포구', country: '대한민국' },
    '영등포': { lat: 37.5264, lon: 126.8962, name: '서울 영등포구', country: '대한민국' },
    '영등포구': { lat: 37.5264, lon: 126.8962, name: '서울 영등포구', country: '대한민국' },
    '종로': { lat: 37.5730, lon: 126.9794, name: '서울 종로구', country: '대한민국' },
    '종로구': { lat: 37.5730, lon: 126.9794, name: '서울 종로구', country: '대한민국' },

    // 주요 해외 도시 (한글 입력 지원)
    '도쿄': { lat: 35.6762, lon: 139.6503, name: '도쿄 (Tokyo)', country: '일본' },
    '오사카': { lat: 34.6937, lon: 135.5023, name: '오사카 (Osaka)', country: '일본' },
    '후쿠오카': { lat: 33.5904, lon: 130.4017, name: '후쿠오카 (Fukuoka)', country: '일본' },
    '삿포로': { lat: 43.0618, lon: 141.3545, name: '삿포로 (Sapporo)', country: '일본' },
    '뉴욕': { lat: 40.7128, lon: -74.0060, name: '뉴욕 (New York)', country: '미국' },
    '로스앤젤레스': { lat: 34.0522, lon: -118.2437, name: '로스앤젤레스 (LA)', country: '미국' },
    '파리': { lat: 48.8566, lon: 2.3522, name: '파리 (Paris)', country: '프랑스' },
    '런던': { lat: 51.5074, lon: -0.1278, name: '런던 (London)', country: '영국' },
    '로마': { lat: 41.9028, lon: 12.4964, name: '로마 (Rome)', country: '이탈리아' },
    '베를린': { lat: 52.5200, lon: 13.4050, name: '베를린 (Berlin)', country: '독일' },
    '시드니': { lat: -33.8688, lon: 151.2093, name: '시드니 (Sydney)', country: '호주' },
    '베이징': { lat: 39.9042, lon: 116.4074, name: '베이징 (Beijing)', country: '중국' },
    '상하이': { lat: 31.2304, lon: 121.4737, name: '상하이 (Shanghai)', country: '중국' },
    '방콕': { lat: 13.7563, lon: 100.5018, name: '방콕 (Bangkok)', country: '태국' },
    '싱가포르': { lat: 1.3521, lon: 103.8198, name: '싱가포르 (Singapore)', country: '싱가포르' },
    '타이베이': { lat: 25.0330, lon: 121.5654, name: '타이베이 (Taipei)', country: '대만' },
    '하노이': { lat: 21.0285, lon: 105.8542, name: '하노이 (Hanoi)', country: '베트남' },
    '다낭': { lat: 16.0544, lon: 108.2022, name: '다낭 (Da Nang)', country: '베트남' }
  };

  /**
   * 위치 검색 지오코딩 리졸버
   * 1단계: 내장 도시 딕셔너리 (즉시 응답)
   * 2단계: OpenStreetMap Nominatim 공개 API (동/구/상세 한글 주소 검색)
   * 3단계: Open-Meteo Geocoding API (영문 도시명 및 글로벌 검색)
   */
  async function resolveLocation(query) {
    const trimmed = query.trim();

    // 1단계: 내장 도시 맵 확인
    const normalizedKey = trimmed.replace(/\s+/g, '');
    if (PRESET_CITIES[normalizedKey]) {
      return PRESET_CITIES[normalizedKey];
    }

    // 부분 일치 검사 (예: '서울시' -> '서울')
    for (const [key, val] of Object.entries(PRESET_CITIES)) {
      if (key === normalizedKey || normalizedKey.startsWith(key) || key.startsWith(normalizedKey)) {
        return val;
      }
    }

    // 2단계: OpenStreetMap Nominatim API (한글 위치 지원)
    try {
      const osmUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=json&accept-language=ko&limit=1`;
      const osmRes = await fetch(osmUrl, {
        headers: { 'Accept': 'application/json' }
      });
      if (osmRes.ok) {
        const osmData = await osmRes.json();
        if (osmData && osmData.length > 0) {
          const item = osmData[0];
          const rawName = item.name || item.display_name.split(',')[0];
          return {
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            name: rawName || trimmed,
            country: item.display_name.includes('대한민국') ? '대한민국' : '해외'
          };
        }
      }
    } catch (e) {
      console.warn('Nominatim 검색 스킵:', e);
    }

    // 3단계: Open-Meteo Geocoding API (영문 도시명 등)
    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=1&language=ko&format=json`;
      const geoRes = await fetch(geoUrl);
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.results && geoData.results.length > 0) {
          const loc = geoData.results[0];
          return {
            lat: loc.latitude,
            lon: loc.longitude,
            name: loc.name || trimmed,
            country: loc.country || '글로벌'
          };
        }
      }
    } catch (e) {
      console.warn('Open-Meteo 지오코딩 실패:', e);
    }

    return null;
  }

  // ==========================================
  // Location Search & Weather Fetch
  // ==========================================
  async function searchLocation(query) {
    const trimmed = query.trim();
    if (!trimmed) {
      showMessage('🔎', '검색어를 입력해주세요', '도시나 지역명을 한글 또는 영문으로 입력해주세요. (예: 서울, 제주, 부산, Tokyo, Paris)');
      return;
    }

    showLoading();

    try {
      const location = await resolveLocation(trimmed);

      if (!location) {
        // 지역명 오타 또는 미존재 지역 안내
        showMessage(
          '📍',
          `'${trimmed}' 지역을 찾을 수 없습니다`,
          '입력하신 지역명에 오타가 있는지 확인해주세요. (예: "서을" ➔ "서울")\n철자를 다시 확인하시거나 주요 도시명(서울, 부산, 제주, 대전, 대구, 강릉, 도쿄, 뉴욕 등)으로 검색해보세요.',
          true,
          '다시 입력하기',
          () => {
            searchInput.focus();
            searchInput.select();
          }
        );
        return;
      }

      // Save to recent searches
      saveRecentSearch(location.name || trimmed);

      // Fetch Weather Data with coordinates
      await fetchWeatherData(location.lat, location.lon, location.name, location.country);

    } catch (error) {
      console.error('날씨 데이터 조회 오류:', error);
      showMessage(
        '⚠️',
        '날씨 정보를 가져오지 못했습니다',
        '네트워크 연결 상태를 확인하시거나 잠시 후 다시 시도해주세요. (원인: ' + (error.message || '알 수 없는 오류') + ')',
        true,
        '새로고침 및 재시도',
        () => searchLocation(trimmed)
      );
    }
  }

  /**
   * 위도/경도 기반 날씨 데이터 조회 및 렌더링
   * (최소 350ms 로딩 유지하여 '날씨 정보를 불러오는 중...' 안내 문구 노출 보장)
   */
  async function fetchWeatherData(lat, lon, locationName, countryName) {
    try {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,surface_pressure&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
      
      const [res] = await Promise.all([
        fetch(weatherUrl),
        new Promise(resolve => setTimeout(resolve, 350)) // '날씨 정보를 불러오는 중...' 가독성 보장
      ]);

      if (!res.ok) {
        throw new Error('기상청 서버 응답 실패');
      }

      const data = await res.json();
      renderWeather(data, locationName, countryName, lat, lon);
      showWeather();

    } catch (err) {
      console.error('기상 데이터 파싱 오류:', err);
      showMessage(
        '🌧️',
        '날씨 정보를 불러오는 중 오류 발생',
        '해당 지역의 기상 예보 데이터를 가져오지 못했습니다. 잠시 후 다시 검색해주세요.',
        true,
        '재시도',
        () => fetchWeatherData(lat, lon, locationName, countryName)
      );
    }
  }

  // ==========================================
  // Render Weather Information
  // ==========================================
  function renderWeather(data, locationName, countryName, lat, lon) {
    const current = data.current;
    const daily = data.daily;
    const isDay = current.is_day !== undefined ? current.is_day : 1;
    const weatherMeta = getWeatherMeta(current.weather_code, isDay);

    // Apply dynamic background theme (현재 날씨에 따라 배경 분위기 즉각 변경)
    updateTheme(weatherMeta.themeClass);

    // Location & Time
    currentLocationName.textContent = locationName;
    currentCountryBadge.textContent = countryName;
    currentCoordsText.textContent = `위도 ${lat.toFixed(2)}° · 경도 ${lon.toFixed(2)}°`;

    // Updated Time (Local Time Format)
    const updateDate = current.time ? new Date(current.time) : new Date();
    currentUpdateTime.textContent = `${updateDate.getHours()}시 ${String(updateDate.getMinutes()).padStart(2, '0')}분 발표`;

    // Temperature & Weather Icon
    weatherEmoji.textContent = weatherMeta.emoji;
    currentTemp.textContent = Math.round(current.temperature_2m);
    currentFeelsLike.textContent = `${current.apparent_temperature.toFixed(1)}°C`;
    weatherConditionTitle.textContent = weatherMeta.title;
    weatherConditionDesc.textContent = weatherMeta.desc;

    // Today Highest & Lowest Temperature (오늘의 최고기온, 최저기온)
    if (daily && daily.temperature_2m_min && daily.temperature_2m_max) {
      todayMinTemp.textContent = `${Math.round(daily.temperature_2m_min[0])}°C`;
      todayMaxTemp.textContent = `${Math.round(daily.temperature_2m_max[0])}°C`;
    }

    // Detailed Metrics
    // 1. Humidity
    const humidity = current.relative_humidity_2m;
    metricHumidity.textContent = Math.round(humidity);
    humidityBar.style.width = `${Math.min(100, Math.max(0, humidity))}%`;
    if (humidity < 30) {
      humidityStatus.textContent = '건조함 · 수분 보충 필요';
    } else if (humidity <= 60) {
      humidityStatus.textContent = '쾌적하고 이상적인 습도';
    } else {
      humidityStatus.textContent = '다소 습함 · 통풍 권장';
    }

    // 2. Wind
    const wind = current.wind_speed_10m;
    metricWind.textContent = wind.toFixed(1);
    const windPercent = Math.min(100, (wind / 50) * 100);
    windBar.style.width = `${windPercent}%`;
    if (wind < 5) {
      windStatus.textContent = '고요함 · 바람 거의 없음';
    } else if (wind < 20) {
      windStatus.textContent = '산들바람 · 상쾌한 공기';
    } else if (wind < 40) {
      windStatus.textContent = '다소 강한 바람에 주의';
    } else {
      windStatus.textContent = '매우 강한 돌풍 주의';
    }

    // 3. Precipitation
    const rain = current.precipitation;
    metricPrecipitation.textContent = rain.toFixed(1);
    const rainPercent = Math.min(100, (rain / 20) * 100);
    rainBar.style.width = `${rainPercent}%`;
    if (rain === 0) {
      rainStatus.textContent = '현재 강수 없음';
    } else if (rain < 3) {
      rainStatus.textContent = '약한 비 또는 물방울';
    } else if (rain < 15) {
      rainStatus.textContent = '보통 비 내리는 중';
    } else {
      rainStatus.textContent = '많은 양의 비 주의';
    }

    // 4. Pressure
    const pressure = current.surface_pressure;
    metricPressure.textContent = Math.round(pressure);
    // Standard atmospheric pressure is ~1013 hPa (range roughly 980 to 1040)
    const pressurePercent = Math.min(100, Math.max(10, ((pressure - 970) / 70) * 100));
    pressureBar.style.width = `${pressurePercent}%`;
    if (pressure > 1015) {
      pressureStatus.textContent = '안정적인 고기압권';
    } else if (pressure >= 1005) {
      pressureStatus.textContent = '표준 대기압 유지';
    } else {
      pressureStatus.textContent = '저기압권 · 흐림 가능성';
    }

    // Render Weekly Forecast
    renderWeeklyForecast(daily);
  }

  /**
   * 7일간 주간 예보 렌더링
   */
  function renderWeeklyForecast(daily) {
    if (!daily || !daily.time) return;

    weeklyForecastList.innerHTML = '';
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

    daily.time.forEach((dateStr, idx) => {
      const date = new Date(dateStr);
      const isToday = idx === 0;
      const dayName = isToday ? '오늘' : `${dayNames[date.getDay()]}요일`;
      const dateLabel = `${date.getMonth() + 1}.${date.getDate()}`;
      const code = daily.weather_code[idx];
      const maxT = Math.round(daily.temperature_2m_max[idx]);
      const minT = Math.round(daily.temperature_2m_min[idx]);
      const meta = getWeatherMeta(code, 1);

      const card = document.createElement('div');
      card.className = `forecast-day-card ${isToday ? 'today' : ''}`;
      card.innerHTML = `
        <span class="forecast-day-name">${dayName}</span>
        <span class="forecast-date">${dateLabel}</span>
        <span class="forecast-emoji" title="${meta.title}">${meta.emoji}</span>
        <span class="forecast-condition">${meta.title}</span>
        <div class="forecast-temp-range">
          <span class="forecast-min" title="최저 기온">${minT}°</span>
          <span style="opacity:0.3">/</span>
          <span class="forecast-max" title="최고 기온">${maxT}°</span>
        </div>
      `;
      weeklyForecastList.appendChild(card);
    });
  }

  // ==========================================
  // Recent Searches Management
  // ==========================================
  function saveRecentSearch(cityName) {
    if (!cityName) return;
    recentSearches = recentSearches.filter(item => item.toLowerCase() !== cityName.toLowerCase());
    recentSearches.unshift(cityName);
    if (recentSearches.length > 6) {
      recentSearches = recentSearches.slice(0, 6);
    }
    localStorage.setItem(RECENT_KEY, JSON.stringify(recentSearches));
    renderRecentSearches();
  }

  function renderRecentSearches() {
    if (recentSearches.length === 0) {
      recentSearchesContainer.classList.add('hidden');
      return;
    }

    recentSearchesContainer.classList.remove('hidden');
    recentChips.innerHTML = '';

    recentSearches.forEach(city => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.textContent = city;
      chip.addEventListener('click', () => {
        searchInput.value = city;
        toggleClearButton();
        searchLocation(city);
      });
      recentChips.appendChild(chip);
    });
  }

  btnClearRecent.addEventListener('click', () => {
    recentSearches = [];
    localStorage.removeItem(RECENT_KEY);
    renderRecentSearches();
  });

  // ==========================================
  // Current Location Geolocation
  // ==========================================
  btnCurrentLocation.addEventListener('click', () => {
    if (!navigator.geolocation) {
      showMessage('📍', '위치 서비스를 지원하지 않습니다', '브라우저에서 위치 정보 접근을 지원하지 않습니다. 검색창을 이용해주세요.');
      return;
    }

    showLoading();

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          // Reverse geocoding with Open-Meteo or fallback display
          let placeName = '내 현재 위치';
          try {
            const revRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=ko`);
            if (revRes.ok) {
              const revData = await revRes.json();
              placeName = revData.locality || revData.city || revData.principalSubdivision || '내 현재 위치';
            }
          } catch {
            // fallback gracefully
          }
          await fetchWeatherData(latitude, longitude, placeName, '현위치');
        } catch (err) {
          console.error(err);
          showMessage('⚠️', '현재 위치 날씨 조회 실패', '기상 정보를 받아오지 못했습니다. 잠시 후 다시 시도해주세요.');
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        let msg = '위치 권한이 허용되지 않았습니다.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = '브라우저 위치 정보 권한이 차단되었습니다. 주소창에서 위치 접근 권한을 허용해주시거나 직접 도시를 검색해주세요.';
        }
        showMessage('📍', '내 위치를 확인할 수 없습니다', msg, true, '서울 날씨 보기', () => {
          searchLocation('서울');
        });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  });

  // ==========================================
  // Search Input Events & Quick Chips
  // ==========================================
  function toggleClearButton() {
    if (searchInput.value.trim().length > 0) {
      btnClearSearch.classList.remove('hidden');
    } else {
      btnClearSearch.classList.add('hidden');
    }
  }

  searchInput.addEventListener('input', toggleClearButton);

  btnClearSearch.addEventListener('click', () => {
    searchInput.value = '';
    toggleClearButton();
    searchInput.focus();
  });

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    searchLocation(searchInput.value);
  });

  quickChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const city = chip.getAttribute('data-city');
      searchInput.value = city;
      toggleClearButton();

      // Highlight active chip
      quickChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      searchLocation(city);
    });
  });

  // ==========================================
  // Initialization
  // ==========================================
  renderRecentSearches();
  
  // Default search on load: 서울 (Seoul)
  searchLocation('서울');
});
