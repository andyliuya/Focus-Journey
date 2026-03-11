// ============================================================
// 專注旅行計時器 - 核心應用程式
// ============================================================

// === 路線資料 ===
const ROUTES = [
    {
        name: '台灣西部走廊',
        desc: '台北 → 新竹 → 台中 → 台南 → 高雄',
        totalKm: 350,
        stops: [
            { name: '台北市', lat: 25.033, lng: 121.565, km: 0 },
            { name: '桃園市', lat: 24.994, lng: 121.301, km: 40 },
            { name: '新竹市', lat: 24.804, lng: 120.969, km: 80 },
            { name: '苗栗市', lat: 24.560, lng: 120.822, km: 120 },
            { name: '台中市', lat: 24.148, lng: 120.674, km: 170 },
            { name: '彰化市', lat: 24.081, lng: 120.539, km: 195 },
            { name: '嘉義市', lat: 23.480, lng: 120.449, km: 250 },
            { name: '台南市', lat: 22.999, lng: 120.227, km: 300 },
            { name: '高雄市', lat: 22.627, lng: 120.301, km: 350 }
        ]
    },
    {
        name: '台灣東部海岸',
        desc: '宜蘭 → 花蓮 → 台東 → 屏東',
        totalKm: 280,
        stops: [
            { name: '宜蘭市', lat: 24.757, lng: 121.753, km: 0 },
            { name: '蘇澳鎮', lat: 24.596, lng: 121.844, km: 30 },
            { name: '花蓮市', lat: 23.992, lng: 121.601, km: 100 },
            { name: '玉里鎮', lat: 23.337, lng: 121.313, km: 160 },
            { name: '台東市', lat: 22.757, lng: 121.144, km: 220 },
            { name: '屏東市', lat: 22.682, lng: 120.484, km: 280 }
        ]
    },
    {
        name: '台灣環島',
        desc: '台北出發，環島一圈回到台北',
        totalKm: 920,
        stops: [
            { name: '台北市', lat: 25.033, lng: 121.565, km: 0 },
            { name: '基隆市', lat: 25.129, lng: 121.739, km: 30 },
            { name: '宜蘭市', lat: 24.757, lng: 121.753, km: 90 },
            { name: '花蓮市', lat: 23.992, lng: 121.601, km: 200 },
            { name: '台東市', lat: 22.757, lng: 121.144, km: 370 },
            { name: '屏東市', lat: 22.682, lng: 120.484, km: 450 },
            { name: '高雄市', lat: 22.627, lng: 120.301, km: 490 },
            { name: '台南市', lat: 22.999, lng: 120.227, km: 540 },
            { name: '嘉義市', lat: 23.480, lng: 120.449, km: 610 },
            { name: '台中市', lat: 24.148, lng: 120.674, km: 700 },
            { name: '新竹市', lat: 24.804, lng: 120.969, km: 790 },
            { name: '桃園市', lat: 24.994, lng: 121.301, km: 850 },
            { name: '台北市（終點）', lat: 25.033, lng: 121.565, km: 920 }
        ]
    }
];

// === BGM 清單（免費公開白噪音）===
const BGM_LIST = [
    { name: '咖啡廳', icon: '☕', url: 'https://cdn.pixabay.com/audio/2024/11/04/audio_af66fe1852.mp3' },
    { name: '夏日蟬鳴', icon: '🌿', url: 'https://cdn.pixabay.com/audio/2022/08/31/audio_419263a714.mp3' },
    { name: '溫柔鋼琴', icon: '🎹', url: 'https://cdn.pixabay.com/audio/2024/09/10/audio_6e1bda5a5a.mp3' },
    { name: '輕快節奏', icon: '🎶', url: 'https://cdn.pixabay.com/audio/2023/07/19/audio_e552f8fadc.mp3' },
    { name: '寧靜氛圍', icon: '🌙', url: 'https://cdn.pixabay.com/audio/2024/02/07/audio_98661e74b4.mp3' },
    { name: '清晨鳥鳴', icon: '🐦', url: 'https://cdn.pixabay.com/audio/2024/06/11/audio_0c2c1a0dc4.mp3' },
    { name: '專注節拍', icon: '🎯', url: 'https://cdn.pixabay.com/audio/2023/10/26/audio_3c536a3506.mp3' }
];

// === 自訂頭像與設定 ===
const USER_AVATAR = '🚶'; // 可輸入 Emoji (如 🚗,🏃) 或圖片網址 (如 https://.../img.jpg)
const SPEED_KMH = 60;

// === 狀態 ===
let state = {
    route: null,
    mapLoaded: false,
    pendingRoute: null,
    pendingRoute: null,
    isTracking: true,          // 是否鎖定跟隨人物
    isRecentering: false,      // 是否正在執行拉近動畫
    isResuming: false,         // 是否正在還原進度
    timerMode: 'countup',      // 'countup' | 'pomodoro'
    timerRunning: false,
    timerPaused: false,
    elapsedSeconds: 0,
    distanceTraveled: 0,
    // 番茄鐘
    pomoWork: 25, pomoBreak: 5, pomoLong: 15,
    pomoCount: 0,
    pomoPhase: 'work',         // 'work' | 'break'
    pomoRemaining: 0,
    // Todo
    todos: JSON.parse(localStorage.getItem('focus-todos') || '[]'),
    todosCompleted: 0,
    // BGM
    bgmIndex: 0, bgmPlaying: false,
    // 活動偵測
    activityStart: null,
    lastActivityTime: Date.now(),
    activityThreshold: 60,
    activityAlerted: false,
    // 閒置偵測
    idleTimeout: null,
    idleThreshold: 180000,     // 3 分鐘無操作
    wasIdle: false
};

let timerInterval = null;
let activityWarningInterval = null;
let lastRenderTime = 0;
let animationFrameId = null;
let currentSettings = { bearing: 0, pitch: 65 }; // 用於平滑相機數值
let mapDragIdleTimer = null; // 閒置自動拉回計時器
let lastSaveTime = 0; // 進度儲存節流
let map, routeLine, characterMarker;
let audio = new Audio();

// ============================================================
// 初始化
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    initBGM();
    initTodo();
    initTimerControls();
    initActivityDetection();
    initModals();
    checkSavedProgress();
});

// === 地圖 ===
function initMap() {
    map = new maplibregl.Map({
        container: 'map',
        style: {
            version: 8,
            glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
            sources: {
                'voyager': {
                    'type': 'raster',
                    'tiles': [
                        'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
                        'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
                        'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'
                    ],
                    'tileSize': 256,
                    'attribution': '&copy; OpenStreetMap &copy; CARTO'
                }
            },
            layers: [
                {
                    'id': 'voyager-tiles',
                    'type': 'raster',
                    'source': 'voyager',
                    'minzoom': 0,
                    'maxzoom': 22
                }
            ]
        },
        center: [121, 23.7], // [lng, lat]
        zoom: 7,
        pitch: 0,
        bearing: 0
    });

    map.on('load', () => {
        state.mapLoaded = true;

        map.addSource('route-source', { 'type': 'geojson', 'data': { 'type': 'Feature', 'geometry': { 'type': 'LineString', 'coordinates': [] } } });
        map.addSource('walked-source', { 'type': 'geojson', 'data': { 'type': 'Feature', 'geometry': { 'type': 'LineString', 'coordinates': [] } } });
        map.addSource('stations-source', { 'type': 'geojson', 'data': { 'type': 'FeatureCollection', 'features': [] } });

        map.addLayer({
            'id': 'route-line', 'type': 'line', 'source': 'route-source',
            'layout': { 'line-join': 'round', 'line-cap': 'round' },
            'paint': { 'line-color': '#9ca3af', 'line-width': 4, 'line-dasharray': [2, 2] }
        });
        map.addLayer({
            'id': 'walked-line', 'type': 'line', 'source': 'walked-source',
            'layout': { 'line-join': 'round', 'line-cap': 'round' },
            'paint': { 'line-color': '#2563eb', 'line-width': 8 }
        });
        map.addLayer({
            'id': 'stations-layer', 'type': 'circle', 'source': 'stations-source',
            'paint': { 'circle-radius': 6, 'circle-color': '#3b82f6', 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 }
        });
        map.addLayer({
            'id': 'stations-label-layer', 'type': 'symbol', 'source': 'stations-source',
            'layout': {
                'text-field': ['get', 'name'],
                'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
                'text-radial-offset': 0.8,
                'text-justify': 'auto',
                'text-size': 12
            },
            'paint': { 'text-color': '#1e293b', 'text-halo-color': '#ffffff', 'text-halo-width': 2 }
        });

        if (state.pendingRoute) {
            drawRoute(state.pendingRoute);
            state.pendingRoute = null;
        }

        // 拖曳地圖或滾輪縮放時，解除視角鎖定追蹤
        const disableTracking = () => {
            if (state.timerRunning && (state.isTracking || state.isRecentering)) {
                state.isTracking = false;
                state.isRecentering = false;
                document.getElementById('btn-recenter').style.display = 'flex';
                map.stop(); // 停止先前的動畫
            }

            // 如果在計時狀態且已解除鎖定，重新計算 10 秒後自動拉回
            if (state.timerRunning && !state.isTracking && !state.isRecentering) {
                clearTimeout(mapDragIdleTimer);
                mapDragIdleTimer = setTimeout(() => {
                    doRecenter();
                }, 10000);
            }
        };
        map.on('mousedown', disableTracking);
        map.on('touchstart', disableTracking);
        map.on('wheel', disableTracking);
        map.on('dragstart', disableTracking);

        // 點擊定位按鈕，滑順恢復追蹤
        document.getElementById('btn-recenter').addEventListener('click', doRecenter);
    });
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

async function drawRoute(route) {
    if (!state.mapLoaded) {
        state.pendingRoute = route;
        return;
    }

    // 取得真實 OSRM 公路軌跡
    const coordsStr = route.stops.map(s => `${s.lng},${s.lat}`).join(';');
    try {
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`;
        const res = await fetch(osrmUrl);
        const data = await res.json();

        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
            const osrmCoords = data.routes[0].geometry.coordinates; // [[lng, lat], ...]
            let cumDist = 0;
            route.osrmStops = [{ lng: osrmCoords[0][0], lat: osrmCoords[0][1], km: 0 }];

            for (let i = 1; i < osrmCoords.length; i++) {
                const dist = getDistanceFromLatLonInKm(osrmCoords[i - 1][1], osrmCoords[i - 1][0], osrmCoords[i][1], osrmCoords[i][0]);
                cumDist += dist;
                route.osrmStops.push({ lng: osrmCoords[i][0], lat: osrmCoords[i][1], km: cumDist });
            }
            route.totalKm = cumDist;
            route.osrmCoords = osrmCoords;

            // 更新原始站點的精確公里數 (透過 legs)
            route.stops[0].km = 0;
            for (let i = 0; i < data.routes[0].legs.length; i++) {
                route.stops[i + 1].km = route.stops[i].km + (data.routes[0].legs[i].distance / 1000);
            }
        } else {
            throw new Error('OSRM No route found');
        }
    } catch (e) {
        console.error("OSRM fetch failed, fallback to straight lines:", e);
        let cumDist = 0;
        route.osrmStops = [{ lng: route.stops[0].lng, lat: route.stops[0].lat, km: 0 }];
        route.osrmCoords = [[route.stops[0].lng, route.stops[0].lat]];

        for (let i = 1; i < route.stops.length; i++) {
            const dist = getDistanceFromLatLonInKm(route.stops[i - 1].lat, route.stops[i - 1].lng, route.stops[i].lat, route.stops[i].lng);
            cumDist += dist;
            route.osrmStops.push({ lng: route.stops[i].lng, lat: route.stops[i].lat, km: cumDist });
            route.osrmCoords.push([route.stops[i].lng, route.stops[i].lat]);
        }
        route.totalKm = cumDist;
    }

    map.getSource('route-source').setData({ 'type': 'Feature', 'geometry': { 'type': 'LineString', 'coordinates': route.osrmCoords } });
    map.getSource('walked-source').setData({ 'type': 'Feature', 'geometry': { 'type': 'LineString', 'coordinates': [] } });

    const stations = route.stops.map(s => ({
        'type': 'Feature', 'geometry': { 'type': 'Point', 'coordinates': [s.lng, s.lat] }, 'properties': { 'name': s.name }
    }));
    map.getSource('stations-source').setData({ 'type': 'FeatureCollection', 'features': stations });

    if (characterMarker) characterMarker.remove();

    // 判斷是否為網址來決定要用 img 還是純文字/Emoji
    const isUrl = USER_AVATAR.startsWith('http') || USER_AVATAR.startsWith('data:image');
    const avatarHtml = isUrl ? `<img src="${USER_AVATAR}" alt="Avatar">` : USER_AVATAR;

    const el = document.createElement('div'); // HTML 結構
    el.innerHTML = `
        <div class="char-wrapper">
            <div class="char-bubble">準備出發</div>
            <div class="char-avatar">
                ${USER_AVATAR.startsWith('http') ? `<img src="${USER_AVATAR}" alt="avatar">` : USER_AVATAR}
            </div>
            <div class="char-pointer"></div>
        </div>
    `;

    // 同步更新給中心鎖定層，但一開始絕對隱藏
    const centerChar = document.getElementById('center-character');
    if (centerChar) {
        centerChar.innerHTML = el.innerHTML;
        centerChar.style.setProperty('display', 'none', 'important');
    }

    characterMarker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat(route.osrmCoords[0]).addTo(map);

    const bounds = route.osrmCoords.reduce((b, coord) => b.extend(coord), new maplibregl.LngLatBounds(route.osrmCoords[0], route.osrmCoords[0]));
    map.fitBounds(bounds, { padding: 80, pitch: 0, bearing: 0, animate: false });

    // 設定初始平滑變數，如果是接續旅程，則直接飛向中斷點
    setTimeout(() => {
        let startBearing = 0;
        if (state.isResuming) {
            const pos = getPositionOnRoute(state.distanceTraveled);
            if (pos && pos.nextStop) {
                startBearing = calculateBearing(pos.lat, pos.lng, pos.nextStop.lat, pos.nextStop.lng);
            }
            currentSettings.bearing = startBearing;
            currentSettings.pitch = 65;
            map.jumpTo({ center: pos ? [pos.lng, pos.lat] : route.osrmCoords[0], zoom: 16.5, pitch: 65, bearing: startBearing });
            updateWalkedPath(pos);
            updateDashboard();
            state.isResuming = false;
        } else {
            if (route.osrmCoords.length > 1) startBearing = calculateBearing(route.osrmCoords[0][1], route.osrmCoords[0][0], route.osrmCoords[1][1], route.osrmCoords[1][0]);
            currentSettings.bearing = startBearing;
            currentSettings.pitch = 65;
            map.easeTo({ center: route.osrmCoords[0], zoom: 16.5, pitch: 65, bearing: startBearing, duration: 2500 });
        }
    }, 800);

    state.isTracking = true;
    document.getElementById('btn-recenter').style.display = 'none';
    updateDashboard();
}

function getPositionOnRoute(distKm) {
    const route = state.route;
    if (!route || !route.osrmStops) return null;
    const stops = route.osrmStops;
    const clampedKm = Math.min(distKm, route.totalKm);

    for (let i = 0; i < stops.length - 1; i++) {
        if (clampedKm >= stops[i].km && clampedKm <= stops[i + 1].km) {
            const segLen = stops[i + 1].km - stops[i].km;
            const ratio = segLen > 0 ? (clampedKm - stops[i].km) / segLen : 0;
            return {
                lat: stops[i].lat + (stops[i + 1].lat - stops[i].lat) * ratio,
                lng: stops[i].lng + (stops[i + 1].lng - stops[i].lng) * ratio,
                nextStop: stops[i + 1]
            };
        }
    }
    const last = stops[stops.length - 1];
    return { lat: last.lat, lng: last.lng, nextStop: null };
}

function getStationInfoFromDistance(distKm) {
    const route = state.route;
    if (!route) return null;
    let currentStation = route.stops[0];
    let nextStation = null;
    let remainToNext = 0;
    for (let i = 0; i < route.stops.length; i++) {
        if (distKm < route.stops[i].km) {
            nextStation = route.stops[i];
            currentStation = route.stops[i - 1] || route.stops[0];
            remainToNext = nextStation.km - distKm;
            break;
        }
    }
    return { currentStation, nextStation, remainToNext };
}

function calculateBearing(lat1, lng1, lat2, lng2) {
    const toRad = deg => deg * Math.PI / 180;
    const toDeg = rad => rad * 180 / Math.PI;
    const dLng = toRad(lng2 - lng1);
    const y = Math.sin(dLng) * Math.cos(toRad(lat2));
    const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
        Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
    const brng = toDeg(Math.atan2(y, x));
    return (brng + 360) % 360;
}

// 執行超平滑「恢復視角」拉近動畫
function doRecenter() {
    if (state.isTracking || state.isRecentering) return;

    document.getElementById('btn-recenter').style.display = 'none';
    clearTimeout(mapDragIdleTimer);

    const pos = getPositionOnRoute(state.distanceTraveled);
    if (!pos) {
        state.isTracking = true;
        return;
    }

    state.isRecentering = true;

    // 預先準備好目標角度
    let targetBearing = currentSettings.bearing;
    if (pos.nextStop) {
        targetBearing = calculateBearing(pos.lat, pos.lng, pos.nextStop.lat, pos.nextStop.lng);
    }
    currentSettings.bearing = targetBearing; // 讓鏡頭直接對齊目標方向

    // 啟動 MapLibre 內建的「飛行」視覺特效
    map.flyTo({
        center: [pos.lng, pos.lat],
        zoom: 16.5,
        pitch: currentSettings.pitch,
        bearing: currentSettings.bearing,
        speed: 1.2,      // 飛行速度
        curve: 1.42,     // 飛行曲線 (越高越高拋)
        essential: true
    });

    // 監聽動畫結束，無縫接軌回 60fps 中央鎖定模式
    map.once('moveend', () => {
        if (state.isRecentering) {
            state.isRecentering = false;
            state.isTracking = true;
        }
    });
}

// 輔助函數：計算平滑最短差值角度
function lerpBearing(current, target, factor) {
    let diff = ((target - current + 180) % 360) - 180;
    diff = diff < -180 ? diff + 360 : diff;
    return current + diff * factor;
}

// === 每秒或狀態改變時才呼叫的靜態 UI 更新 ===
function updateWalkedPath(pos) {
    if (!pos || !state.mapLoaded) return;
    const route = state.route;
    const walked = [];
    if (route.osrmStops) {
        for (const s of route.osrmStops) {
            if (s.km <= state.distanceTraveled) walked.push([s.lng, s.lat]);
            else break;
        }
    }
    walked.push([pos.lng, pos.lat]);
    map.getSource('walked-source').setData({ 'type': 'Feature', 'geometry': { 'type': 'LineString', 'coordinates': walked } });
}

function updateCharacterBubble() {
    const bubbles = document.querySelectorAll('.char-bubble');
    if (!bubbles.length) return;
    let text = '準備出發';
    if (!state.timerRunning) text = '準備出發';
    else if (state.timerPaused) text = '暫停中...';
    else if (state.timerMode === 'pomodoro' && state.pomoPhase === 'break') text = '☕ 休息中...';
    else text = '🚶 專注中...';

    bubbles.forEach(b => b.textContent = text);
}

// === 60fps 高頻呼叫的地圖更新 ===
function updateMapPosition(dt) {
    const pos = getPositionOnRoute(state.distanceTraveled);
    if (!pos || !characterMarker || !state.mapLoaded) return;

    // 背景 Marker 位置依然需要更新 (以備解鎖時使用)
    characterMarker.setLngLat([pos.lng, pos.lat]);

    const centerChar = document.getElementById('center-character');

    if (state.isRecentering) {
        // 在「滑順拉近」飛行期間：
        // 放任 flyTo 動畫自己執行，我們只需負責把真實 Marker 改為顯示，並隱藏居中 Marker
        characterMarker.getElement().style.setProperty('display', 'flex', 'important');
        if (centerChar) centerChar.style.setProperty('display', 'none', 'important');

    } else if (state.timerRunning && !state.timerPaused && state.isTracking) {
        let targetBearing = currentSettings.bearing;
        if (pos.nextStop) {
            targetBearing = calculateBearing(pos.lat, pos.lng, pos.nextStop.lat, pos.nextStop.lng);
        }

        // 柔和地將目標角度過渡 (每幀逼近 5%)
        currentSettings.bearing = lerpBearing(currentSettings.bearing, targetBearing, 0.05);

        // 使用 jumpTo 確保 60fps 中不會互相衝突卡頓
        map.jumpTo({ center: [pos.lng, pos.lat], zoom: 16.5, pitch: currentSettings.pitch, bearing: currentSettings.bearing });

        // 切換顯示：隱藏真實 Marker，顯示完美居中的虛擬 Marker
        characterMarker.getElement().style.setProperty('display', 'none', 'important');
        if (centerChar) centerChar.style.setProperty('display', 'flex', 'important');

    } else {
        // 暫停、或解除追蹤：隱藏居中 Marker，顯示真實 Marker，完全放開地圖鎖定
        characterMarker.getElement().style.setProperty('display', 'flex', 'important');
        if (centerChar) centerChar.style.setProperty('display', 'none', 'important');
    }
}

// === 60 fps 渲染迴圈 ===
function renderLoop(time) {
    animationFrameId = requestAnimationFrame(renderLoop);

    if (state.timerRunning && state.route) {
        if (!state.timerPaused) {
            // 利用真實流逝時間計算精密距離，保持每一幀順暢
            const dt = (time - lastRenderTime) / 1000;
            const kmPerSecond = SPEED_KMH / 3600;

            // 如果距離太久遠（例如切換分頁幾分鐘後回來），最大單次允許步進距離為 20 秒
            const safeDt = Math.min(dt, 20);

            state.distanceTraveled += kmPerSecond * safeDt;
            if (state.distanceTraveled > state.route.totalKm) {
                state.distanceTraveled = state.route.totalKm;
            }
        }

        // 確保即使暫停，也會執行以更新人物的隱藏與顯示狀態
        updateMapPosition();

        // 限流自動存檔 (每 10 秒)
        if (time - lastSaveTime > 10000) {
            saveProgress();
            lastSaveTime = time;
        }
    }
    lastRenderTime = time;
}

function getStationInfoFromDistance(distKm) {
    const route = state.route;
    if (!route) return null;
    let currentStation = route.stops[0];
    let nextStation = null;
    let remainToNext = 0;
    for (let i = 0; i < route.stops.length; i++) {
        if (distKm < route.stops[i].km) {
            nextStation = route.stops[i];
            currentStation = route.stops[i - 1] || route.stops[0];
            remainToNext = nextStation.km - distKm;
            break;
        }
    }
    return { currentStation, nextStation, remainToNext };
}

// === 儀表板 ===
function updateDashboard() {
    const route = state.route;
    if (!route) return;
    const stat = getStationInfoFromDistance(state.distanceTraveled);

    if (stat) {
        document.getElementById('current-location').textContent = stat.currentStation.name;
        if (stat.nextStation) {
            document.getElementById('next-stop').textContent = stat.nextStation.name;
            const distBadge = document.getElementById('next-distance');
            distBadge.style.display = 'inline-block';
            distBadge.textContent = `剩 ${stat.remainToNext.toFixed(1)} km`;
        } else {
            document.getElementById('next-stop').textContent = '已到終點！🎉';
            document.getElementById('next-distance').style.display = 'none';
        }
    }

    document.getElementById('distance-traveled').textContent = state.distanceTraveled.toFixed(2) + ' km';
    document.getElementById('distance-remaining').textContent =
        Math.max(0, route.totalKm - state.distanceTraveled).toFixed(1) + ' km';
    document.getElementById('total-distance').textContent = route.totalKm.toFixed(1) + ' km';
}

// === 計時器 ===
function initTimerControls() {
    document.querySelectorAll('.timer-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            if (state.timerRunning) return;
            document.querySelectorAll('.timer-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            state.timerMode = tab.dataset.mode;
            const isPomo = state.timerMode === 'pomodoro';
            document.getElementById('pomodoro-settings').style.display = isPomo ? 'block' : 'none';
            document.getElementById('pomodoro-counter').style.display = isPomo ? 'block' : 'none';
            resetTimerDisplay();
        });
    });

    document.getElementById('btn-start').addEventListener('click', startTimer);
    document.getElementById('btn-pause').addEventListener('click', togglePause);
    document.getElementById('btn-end').addEventListener('click', endTimer);
}

function startTimer() {
    if (!state.route) { showRouteModal(); return; }
    state.timerRunning = true;
    state.timerPaused = false;
    state.elapsedSeconds = 0;
    state.distanceTraveled = 0;
    state.todosCompleted = 0;
    state.activityStart = Date.now();
    state.activityAlerted = false;

    if (state.timerMode === 'pomodoro') {
        state.pomoWork = parseInt(document.getElementById('pomo-work').value) || 25;
        state.pomoBreak = parseInt(document.getElementById('pomo-break').value) || 5;
        state.pomoLong = parseInt(document.getElementById('pomo-long').value) || 15;
        state.pomoCount = 0;
        state.pomoPhase = 'work';
        state.pomoRemaining = state.pomoWork * 60;
    }

    document.getElementById('btn-start').style.display = 'none';
    document.getElementById('btn-pause').style.display = 'block';
    document.getElementById('btn-end').style.display = 'block';

    // 啟動 60fps 平滑渲染動畫
    lastRenderTime = performance.now();
    if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(renderLoop);
    }

    // 由於我們改用 jumpTo 追蹤，這裡可以直接呼叫 updateMapPosition() 讓它跳到主角身上
    state.isTracking = true;
    document.getElementById('btn-recenter').style.display = 'none';

    updateCharacterBubble();

    timerInterval = setInterval(timerTick, 1000);
}

function timerTick() {
    if (state.timerPaused) return;
    state.elapsedSeconds++;

    if (state.timerMode === 'pomodoro') {
        state.pomoRemaining--;
        if (state.pomoRemaining <= 0) {
            switchPomoPhase();
        }
        updatePomodoroDisplay();
    } else {
        updateCountupDisplay();
    }

    // 儀表板1秒更新1次即可，不須耗費效能
    updateDashboard();

    const pos = getPositionOnRoute(state.distanceTraveled);
    updateWalkedPath(pos);
}

function switchPomoPhase() {
    if (state.pomoPhase === 'work') {
        state.pomoCount++;
        document.getElementById('pomo-count').textContent = state.pomoCount;
        // 播放提示音
        playNotification();
        if (state.pomoCount % 4 === 0) {
            state.pomoPhase = 'break';
            state.pomoRemaining = state.pomoLong * 60;
            document.getElementById('timer-label').textContent = '☕ 長休息時間';
        } else {
            state.pomoPhase = 'break';
            state.pomoRemaining = state.pomoBreak * 60;
            document.getElementById('timer-label').textContent = '☕ 休息時間';
        }
    } else {
        state.pomoPhase = 'work';
        state.pomoRemaining = state.pomoWork * 60;
        document.getElementById('timer-label').textContent = '🍅 專注時間';
        playNotification();
    }
}

function playNotification() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 800;
        gain.gain.value = 0.15;
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.stop(ctx.currentTime + 0.5);
    } catch (e) { }
}

function updateCountupDisplay() {
    document.getElementById('timer-display').textContent = formatTime(state.elapsedSeconds);
    document.getElementById('timer-label').textContent = 'FOCUS TIME';
}

function updatePomodoroDisplay() {
    document.getElementById('timer-display').textContent = formatTime(state.pomoRemaining);
    const phaseText = state.pomoPhase === 'work' ? '🍅 專注時間' : '☕ 休息時間';
    document.getElementById('timer-label').textContent = phaseText;
}

function togglePause() {
    state.timerPaused = !state.timerPaused;
    document.getElementById('btn-pause').textContent = state.timerPaused ? '繼續' : '一時停止';
    saveProgress();
    if (!state.timerPaused) {
        // 解除暫停時，為了防止 time 劇烈跳躍造成主角暴衝，重設時間紀錄
        lastRenderTime = performance.now();
    }
    updateCharacterBubble();
}

function endTimer() {
    clearInterval(timerInterval);
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    state.timerRunning = false;
    state.timerPaused = false;

    // 最終更新
    updateMapPosition();
    updateDashboard();

    // 顯示結果
    document.getElementById('result-time').textContent = formatTime(state.elapsedSeconds);
    document.getElementById('result-distance').textContent = state.distanceTraveled.toFixed(2) + ' km';
    document.getElementById('result-pomos').textContent = state.pomoCount;
    document.getElementById('result-todos').textContent = state.todosCompleted;
    showModal('complete-modal');

    // 儲存已完成的歷史紀錄
    if (state.distanceTraveled > 0) {
        const history = JSON.parse(localStorage.getItem('focus-history') || '[]');
        history.unshift({
            id: Date.now(),
            date: new Date().toLocaleDateString(),
            routeName: state.route.name,
            distanceTraveled: parseFloat(state.distanceTraveled.toFixed(2)),
            elapsedSeconds: state.elapsedSeconds
        });
        localStorage.setItem('focus-history', JSON.stringify(history));
    }

    // 重置按鈕
    document.getElementById('btn-start').style.display = 'block';
    document.getElementById('btn-start').textContent = '再次出發';
    document.getElementById('btn-pause').style.display = 'none';
    document.getElementById('btn-end').style.display = 'none';
    resetTimerDisplay();
}

function resetTimerDisplay() {
    document.getElementById('timer-display').textContent = '00:00:00';
    document.getElementById('timer-label').textContent = 'FOCUS TIME';
}

function formatTime(totalSec) {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// === BGM ===
function initBGM() {
    const list = document.getElementById('bgm-list');
    BGM_LIST.forEach((bgm, i) => {
        const div = document.createElement('div');
        div.className = 'bgm-item' + (i === 0 ? ' active' : '');
        div.innerHTML = `<span class="num">${i + 1}</span> ${bgm.icon} ${bgm.name}`;
        div.addEventListener('click', () => selectBGM(i));
        list.appendChild(div);
    });

    audio.volume = 0.5;
    audio.addEventListener('timeupdate', updateBGMProgress);
    audio.addEventListener('ended', () => selectBGM((state.bgmIndex + 1) % BGM_LIST.length, true));
    audio.addEventListener('error', () => {
        const nowPlaying = document.getElementById('bgm-now-playing');
        nowPlaying.textContent = '⚠️ 載入失敗，跳下一首...';
        state.bgmPlaying = false;
        document.getElementById('bgm-play').textContent = '▶';
        // 自動跳下一首（給一點延遲避免連鎖錯誤）
        setTimeout(() => {
            const next = (state.bgmIndex + 1) % BGM_LIST.length;
            if (next !== state.bgmIndex) selectBGM(next, true);
        }, 1500);
    });

    document.getElementById('bgm-play').addEventListener('click', toggleBGM);
    document.getElementById('bgm-prev').addEventListener('click', () =>
        selectBGM((state.bgmIndex - 1 + BGM_LIST.length) % BGM_LIST.length, state.bgmPlaying));
    document.getElementById('bgm-next').addEventListener('click', () =>
        selectBGM((state.bgmIndex + 1) % BGM_LIST.length, state.bgmPlaying));
    document.getElementById('volume-slider').addEventListener('input', e => {
        audio.volume = e.target.value / 100;
    });
}

function selectBGM(index, autoPlay = false) {
    state.bgmIndex = index;
    const bgm = BGM_LIST[index];
    document.getElementById('bgm-now-playing').textContent = bgm.icon + ' ' + bgm.name;
    document.querySelectorAll('.bgm-item').forEach((el, i) =>
        el.classList.toggle('active', i === index));
    audio.src = bgm.url;
    audio.load();
    if (autoPlay || state.bgmPlaying) {
        audio.play().catch(() => {
            document.getElementById('bgm-now-playing').textContent = '⚠️ 無法播放此音樂';
            state.bgmPlaying = false;
            document.getElementById('bgm-play').textContent = '▶';
        });
        state.bgmPlaying = true;
        document.getElementById('bgm-play').textContent = '⏸';
    }
}

function toggleBGM() {
    if (!audio.src || audio.src === window.location.href) {
        selectBGM(0, true);
        return;
    }
    if (state.bgmPlaying) {
        audio.pause();
        state.bgmPlaying = false;
        document.getElementById('bgm-play').textContent = '▶';
    } else {
        audio.play().catch(() => { });
        state.bgmPlaying = true;
        document.getElementById('bgm-play').textContent = '⏸';
    }
}

function updateBGMProgress() {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    document.getElementById('bgm-progress-bar').style.width = pct + '%';
    document.getElementById('bgm-current-time').textContent = formatMin(audio.currentTime);
    document.getElementById('bgm-total-time').textContent = formatMin(audio.duration);
}

function formatMin(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
}

// === Todo ===
function initTodo() {
    renderTodos();
    document.getElementById('todo-add-btn').addEventListener('click', addTodo);
    document.getElementById('todo-input').addEventListener('keydown', e => {
        if (e.key === 'Enter') addTodo();
    });
}

function addTodo() {
    const input = document.getElementById('todo-input');
    const text = input.value.trim();
    if (!text) return;
    state.todos.push({ text, done: false, id: Date.now() });
    input.value = '';
    saveTodos();
    renderTodos();
}

function renderTodos() {
    const ul = document.getElementById('todo-list');
    ul.innerHTML = '';
    if (state.todos.length === 0) {
        ul.innerHTML = '<li style="color:var(--text-light);justify-content:center;border:none">目前沒有任務</li>';
        return;
    }
    state.todos.forEach((todo, i) => {
        const li = document.createElement('li');
        li.className = todo.done ? 'done' : '';
        li.innerHTML = `
      <input type="checkbox" ${todo.done ? 'checked' : ''}>
      <span>${todo.text}</span>
      <button title="刪除">✕</button>`;
        li.querySelector('input').addEventListener('change', () => {
            state.todos[i].done = !state.todos[i].done;
            if (state.todos[i].done) state.todosCompleted++;
            saveTodos(); renderTodos();
        });
        li.querySelector('button').addEventListener('click', () => {
            state.todos.splice(i, 1);
            saveTodos(); renderTodos();
        });
        ul.appendChild(li);
    });
}

function saveTodos() {
    localStorage.setItem('focus-todos', JSON.stringify(state.todos));
}

// === 活動偵測（鍵盤/滑鼠持續使用提醒）===
function initActivityDetection() {
    const events = ['mousemove', 'keydown', 'mousedown', 'click', 'wheel', 'touchstart'];
    events.forEach(evt => {
        document.addEventListener(evt, onUserActivity);
    });

    // 監聽活動持續時間設定的變更
    document.getElementById('activity-threshold').addEventListener('change', (e) => {
        state.activityThreshold = parseInt(e.target.value) || 60;
        state.activityAlerted = false;
    });

    // 定期檢查是否久坐/連續活動超過閾值
    setInterval(checkActivity, 10000);

    // 閒置偵測
    setInterval(checkIdle, 10000);
}

function onUserActivity() {
    const now = Date.now();
    // 如果之前閒置超過閾值，重置活動起始
    if (now - state.lastActivityTime > 120000) {
        state.activityStart = now;
        state.activityAlerted = false;
    }
    state.lastActivityTime = now;

    // 閒置恢復
    if (state.wasIdle && state.timerRunning) {
        state.wasIdle = false;
        showModal('idle-modal');
    }

    // 重置閒置計時
    clearTimeout(state.idleTimeout);
    state.idleTimeout = setTimeout(() => {
        if (state.timerRunning && !state.timerPaused) {
            state.wasIdle = true;
            state.timerPaused = true;
            document.getElementById('btn-pause').textContent = '繼續';
        }
    }, state.idleThreshold);
}

function checkActivity() {
    if (!state.activityStart) return;
    const minutes = Math.floor((Date.now() - state.activityStart) / 60000);
    document.getElementById('activity-time').textContent = minutes;

    // 只有在最近 2 分鐘內有操作才算持續活動
    const recentlyActive = (Date.now() - state.lastActivityTime) < 120000;
    if (recentlyActive && minutes >= state.activityThreshold && !state.activityAlerted) {
        state.activityAlerted = true;
        document.getElementById('alert-message').textContent =
            `您已經連續專注坐在螢幕前超過 ${state.activityThreshold} 分鐘囉！為了健康，請暫時起身伸展一下筋骨、喝杯水吧！�‍♂️☕`;
        playNotification();
        showModal('alert-modal');
    }
}

function checkIdle() {
    if (!state.timerRunning || state.timerPaused) return;
    const idleTime = Date.now() - state.lastActivityTime;
    if (idleTime > state.idleThreshold) {
        state.wasIdle = true;
        state.timerPaused = true;
        document.getElementById('btn-pause').textContent = '繼續';
    }
}

// === 彈窗 ===
function initModals() {
    document.getElementById('complete-close').addEventListener('click', () => hideModal('complete-modal'));
    document.getElementById('alert-close').addEventListener('click', () => {
        hideModal('alert-modal');
        // 重置活動計時
        state.activityStart = Date.now();
        state.activityAlerted = false;
        document.getElementById('activity-time').textContent = '0';
    });
    document.getElementById('idle-continue').addEventListener('click', () => {
        hideModal('idle-modal');
        state.timerPaused = false;
        document.getElementById('btn-pause').textContent = '一時停止';
    });

    // 歷史紀錄相關綁定
    document.getElementById('btn-history').addEventListener('click', () => {
        renderHistoryDashboard();
        showModal('history-modal');
    });
    document.getElementById('history-close').addEventListener('click', () => hideModal('history-modal'));

    document.getElementById('route-confirm').addEventListener('click', confirmRoute);
}

function showModal(id) {
    document.getElementById(id).classList.add('show');
}
function hideModal(id) {
    document.getElementById(id).classList.remove('show');
}

// === 路線選擇 ===
function showRouteModal() {
    const picker = document.getElementById('route-picker');
    picker.innerHTML = '';
    ROUTES.forEach((route, i) => {
        const div = document.createElement('div');
        div.className = 'route-option' + (i === 0 ? ' selected' : '');
        div.innerHTML = `<strong>${route.name}</strong><br><span class="km">${route.desc} — 約 ${route.totalKm} km</span>`;
        div.addEventListener('click', () => {
            picker.querySelectorAll('.route-option').forEach(el => el.classList.remove('selected'));
            div.classList.add('selected');
            div.dataset.index = i;
        });
        div.dataset.index = i;
        picker.appendChild(div);
    });
    showModal('route-modal');
}

function confirmRoute() {
    const selected = document.querySelector('.route-option.selected');
    const idx = selected ? parseInt(selected.dataset.index) : 0;
    state.route = ROUTES[idx];
    drawRoute(state.route);
    hideModal('route-modal');
}

// === 進度存檔與讀取 ===
function saveProgress() {
    if (!state.timerRunning || !state.route) return;
    const data = {
        routeName: state.route.name,
        distanceTraveled: state.distanceTraveled,
        elapsedSeconds: state.elapsedSeconds,
        timerMode: state.timerMode,
        pomoWork: state.pomoWork,
        pomoBreak: state.pomoBreak,
        pomoLong: state.pomoLong,
        pomoCount: state.pomoCount,
        pomoPhase: state.pomoPhase,
        pomoRemaining: state.pomoRemaining
    };
    localStorage.setItem('focus-journey-state', JSON.stringify(data));
}

function checkSavedProgress() {
    const saved = localStorage.getItem('focus-journey-state');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            document.getElementById('resume-route-name').textContent = data.routeName;
            document.getElementById('resume-distance').textContent = data.distanceTraveled.toFixed(2);
            document.getElementById('resume-time').textContent = formatTime(data.elapsedSeconds);

            document.getElementById('resume-discard').onclick = () => {
                localStorage.removeItem('focus-journey-state');
                hideModal('resume-modal');
                showRouteModal();
            };
            document.getElementById('resume-confirm').onclick = () => {
                hideModal('resume-modal');
                resumeJourney(data);
            };
            showModal('resume-modal');
            return;
        } catch (e) {
            console.error('Failed to parse saved progress', e);
        }
    }
    showRouteModal();
}

function resumeJourney(data) {
    const routeIndex = ROUTES.findIndex(r => r.name === data.routeName);
    state.route = routeIndex >= 0 ? ROUTES[routeIndex] : ROUTES[0];

    state.distanceTraveled = data.distanceTraveled || 0;
    state.elapsedSeconds = data.elapsedSeconds || 0;
    state.timerMode = data.timerMode || 'countup';
    state.pomoWork = data.pomoWork || 25;
    state.pomoBreak = data.pomoBreak || 5;
    state.pomoLong = data.pomoLong || 15;
    state.pomoCount = data.pomoCount || 0;
    state.pomoPhase = data.pomoPhase || 'work';
    state.pomoRemaining = data.pomoRemaining || 0;

    state.isResuming = true;

    // 恢復 UI 到暫停狀態
    document.getElementById('btn-start').style.display = 'none';
    document.getElementById('btn-pause').style.display = 'block';
    document.getElementById('btn-pause').textContent = '繼續';
    document.getElementById('btn-end').style.display = 'block';

    // 切換頁籤
    document.querySelectorAll('.timer-tab').forEach(t => t.classList.remove('active'));
    const targetTab = document.querySelector(`.timer-tab[data-mode="${state.timerMode}"]`);
    if (targetTab) targetTab.classList.add('active');

    const isPomo = state.timerMode === 'pomodoro';
    document.getElementById('pomodoro-settings').style.display = isPomo ? 'block' : 'none';
    document.getElementById('pomodoro-counter').style.display = isPomo ? 'block' : 'none';

    if (isPomo) {
        updatePomodoroDisplay();
        document.getElementById('pomo-count').textContent = state.pomoCount;
    } else {
        document.getElementById('timer-display').textContent = formatTime(state.elapsedSeconds);
    }

    state.timerRunning = true;
    state.timerPaused = true;
    state.activityStart = Date.now();
    state.activityAlerted = false;

    // 呼叫 drawRoute
    // 因為 drawsRoute 會觸發背景非同步拉取 OSRM 資料，資料拉完內部會因 isResuming 直接飛入精準位置
    drawRoute(state.route);

    lastRenderTime = performance.now();
    if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(renderLoop);
    }
    if (!timerInterval) {
        timerInterval = setInterval(timerTick, 1000);
    }
}

// === 歷史紀錄與成就匯出 ===
function renderHistoryDashboard() {
    const history = JSON.parse(localStorage.getItem('focus-history') || '[]');
    const totalDays = new Set(history.map(h => h.date)).size;
    const totalKm = history.reduce((sum, h) => sum + h.distanceTraveled, 0);
    const totalSeconds = history.reduce((sum, h) => sum + h.elapsedSeconds, 0);

    document.getElementById('hist-total-days').textContent = totalDays;
    document.getElementById('hist-total-km').textContent = totalKm.toFixed(1);

    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    document.getElementById('hist-total-time').textContent = `${h}h ${m}m`;

    const list = document.getElementById('history-list');
    list.innerHTML = '';

    if (history.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:#94a3b8; font-size:14px; padding:20px 0;">還沒有任何紀錄喔！快去開始你的第一趟專注旅行吧 🎒</p>';
        return;
    }

    history.forEach(h => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
          <div class="history-info">
            <div class="history-route">${h.routeName}</div>
            <div class="history-detail">${h.date} • 距離: ${h.distanceTraveled} km • 時間: ${formatTime(h.elapsedSeconds)}</div>
          </div>
          <button class="history-export-btn" onclick="exportAchievement(${h.id})">📸 匯出</button>
        `;
        list.appendChild(div);
    });
}

async function exportAchievement(id) {
    const history = JSON.parse(localStorage.getItem('focus-history') || '[]');
    const record = history.find(h => h.id === id);
    if (!record) return;

    // 將紀錄填入專門用來產生影像的成就卡 DOM
    document.getElementById('ac-route').textContent = record.routeName;
    document.getElementById('ac-dist').textContent = record.distanceTraveled + ' km';
    document.getElementById('ac-time').textContent = formatTime(record.elapsedSeconds);

    const card = document.getElementById('achievement-card');
    const container = document.getElementById('capture-container');

    // 將卡片暫時移到畫面上層並解除隱藏以供 html2canvas 擷取 (依然在視野外)
    container.style.top = '0px';
    container.style.left = '0px';
    container.style.zIndex = '-9999';

    // 將匯出按鈕的樣式改為 Loading 狀態
    const btnBox = [...document.querySelectorAll('.history-export-btn')].find(b => b.getAttribute('onclick').includes(id));
    if (btnBox) {
        btnBox.textContent = '⏳ 處理中';
        btnBox.style.pointerEvents = 'none';
        btnBox.style.opacity = '0.7';
    }

    try {
        const canvas = await html2canvas(card, {
            scale: window.devicePixelRatio || 2, // 使用裝置像素比獲取高畫質
            useCORS: true,
            backgroundColor: null
        });

        // file:// 環境下 download 屬性完全失效，改為彈窗顯示給使用者右鍵儲存
        const imgDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        showExportModal(imgDataUrl, record.date, record.distanceTraveled);
    } catch (err) {
        console.error('輸出成就圖片失敗', err);
        alert('產生圖片失敗，請確保瀏覽器支援此功能！');
    } finally {
        container.style.top = '-9999px';
        container.style.left = '-9999px';
        if (btnBox) {
            btnBox.textContent = '📸 匯出';
            btnBox.style.pointerEvents = 'auto';
            btnBox.style.opacity = '1';
        }
    }
}
