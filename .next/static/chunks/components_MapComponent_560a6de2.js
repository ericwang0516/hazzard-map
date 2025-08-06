(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/components/MapComponent.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>MapComponent
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$mapData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/data/mapData.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function MapComponent(param) {
    let { hazards = [] } = param;
    _s();
    const mapRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const mapInstanceRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [mapLoaded, setMapLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // 初始化地圖
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MapComponent.useEffect": ()=>{
            const loadMap = {
                "MapComponent.useEffect.loadMap": async ()=>{
                    try {
                        const L = await __turbopack_context__.r("[project]/node_modules/leaflet/dist/leaflet-src.js [app-client] (ecmascript, async loader)")(__turbopack_context__.i);
                        // 修復 Leaflet 圖示問題
                        delete L.default.Icon.Default.prototype._getIconUrl;
                        L.default.Icon.Default.mergeOptions({
                            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
                        });
                        if (!mapRef.current || mapInstanceRef.current) return;
                        console.log('初始化地圖...');
                        console.log('地圖容器尺寸:', mapRef.current.offsetWidth, 'x', mapRef.current.offsetHeight);
                        // 等待容器有正確的尺寸
                        let retryCount = 0;
                        const maxRetries = 50; // 最多等待5秒
                        const waitForContainer = {
                            "MapComponent.useEffect.loadMap.waitForContainer": ()=>{
                                if (mapRef.current.offsetWidth > 0 && mapRef.current.offsetHeight > 0) {
                                    console.log('容器尺寸正確，開始初始化地圖');
                                    console.log('最終容器尺寸:', mapRef.current.offsetWidth, 'x', mapRef.current.offsetHeight);
                                    try {
                                        // 使用資料庫中的地圖配置
                                        const map = L.default.map(mapRef.current).setView(__TURBOPACK__imported__module__$5b$project$5d2f$data$2f$mapData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mapConfig"].center, __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$mapData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mapConfig"].zoom);
                                        if (!map) {
                                            throw new Error('地圖初始化失敗');
                                        }
                                        mapInstanceRef.current = map;
                                        console.log('地圖對象創建成功:', map);
                                        // 添加地圖圖層
                                        const tileLayer = L.default.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                                            attribution: '© CartoDB, © OpenStreetMap contributors',
                                            subdomains: 'abcd',
                                            maxZoom: __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$mapData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mapConfig"].maxZoom
                                        });
                                        if (tileLayer) {
                                            tileLayer.addTo(map);
                                            console.log('地圖圖層添加成功');
                                        }
                                        // 使用資料庫中的校園邊界
                                        const rectangle = L.default.rectangle(__TURBOPACK__imported__module__$5b$project$5d2f$data$2f$mapData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["campusBounds"].bounds, __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$mapData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["campusBounds"].style);
                                        if (rectangle) {
                                            rectangle.addTo(map).bindPopup(__TURBOPACK__imported__module__$5b$project$5d2f$data$2f$mapData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["campusBounds"].name);
                                            console.log('校園邊界添加成功');
                                        }
                                        // 使用資料庫中的建築物標記
                                        __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$mapData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildings"].forEach({
                                            "MapComponent.useEffect.loadMap.waitForContainer": (building, index)=>{
                                                const marker = L.default.marker([
                                                    building.lat,
                                                    building.lng
                                                ]);
                                                if (marker) {
                                                    const popupContent = '\n                    <div style="text-align: center;">\n                      <h4 style="margin: 0 0 8px 0; color: #333;">'.concat(building.name, '</h4>\n                      <p style="margin: 4px 0; color: #666;">').concat(building.description, '</p>\n                      <p style="margin: 4px 0; color: #888; font-size: 0.9rem;">類型: ').concat(building.type === 'academic' ? '學術建築' : '設施建築', "</p>\n                    </div>\n                  ");
                                                    marker.addTo(map).bindPopup(popupContent);
                                                    console.log("建築物標記 ".concat(index + 1, " 添加成功:"), building.name);
                                                }
                                            }
                                        }["MapComponent.useEffect.loadMap.waitForContainer"]);
                                        setMapLoaded(true);
                                        console.log('地圖初始化完成');
                                        // 強制重新計算地圖大小
                                        setTimeout({
                                            "MapComponent.useEffect.loadMap.waitForContainer": ()=>{
                                                if (map && map.invalidateSize) {
                                                    map.invalidateSize();
                                                    console.log('地圖大小已重新計算');
                                                }
                                            }
                                        }["MapComponent.useEffect.loadMap.waitForContainer"], 100);
                                    } catch (mapError) {
                                        console.error('地圖初始化錯誤:', mapError);
                                        setError(mapError.message);
                                    }
                                } else {
                                    retryCount++;
                                    console.log("容器尺寸為0，等待... (".concat(retryCount, "/").concat(maxRetries, ")"), mapRef.current.offsetWidth, 'x', mapRef.current.offsetHeight);
                                    if (retryCount >= maxRetries) {
                                        console.error('等待容器尺寸超時，強制初始化地圖');
                                        // 強制設置容器尺寸
                                        mapRef.current.style.width = '100%';
                                        mapRef.current.style.height = '300px';
                                        try {
                                            // 使用資料庫中的地圖配置
                                            const map = L.default.map(mapRef.current).setView(__TURBOPACK__imported__module__$5b$project$5d2f$data$2f$mapData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mapConfig"].center, __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$mapData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mapConfig"].zoom);
                                            if (!map) {
                                                throw new Error('強制初始化地圖失敗');
                                            }
                                            mapInstanceRef.current = map;
                                            console.log('強制初始化地圖對象創建成功:', map);
                                            // 添加地圖圖層
                                            const tileLayer = L.default.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                                                attribution: '© CartoDB, © OpenStreetMap contributors',
                                                subdomains: 'abcd',
                                                maxZoom: __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$mapData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mapConfig"].maxZoom
                                            });
                                            if (tileLayer) {
                                                tileLayer.addTo(map);
                                                console.log('強制初始化地圖圖層添加成功');
                                            }
                                            // 使用資料庫中的校園邊界
                                            const rectangle = L.default.rectangle(__TURBOPACK__imported__module__$5b$project$5d2f$data$2f$mapData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["campusBounds"].bounds, __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$mapData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["campusBounds"].style);
                                            if (rectangle) {
                                                rectangle.addTo(map).bindPopup(__TURBOPACK__imported__module__$5b$project$5d2f$data$2f$mapData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["campusBounds"].name);
                                                console.log('強制初始化校園邊界添加成功');
                                            }
                                            // 使用資料庫中的建築物標記
                                            __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$mapData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildings"].forEach({
                                                "MapComponent.useEffect.loadMap.waitForContainer": (building, index)=>{
                                                    const marker = L.default.marker([
                                                        building.lat,
                                                        building.lng
                                                    ]);
                                                    if (marker) {
                                                        const popupContent = '\n                      <div style="text-align: center;">\n                        <h4 style="margin: 0 0 8px 0; color: #333;">'.concat(building.name, '</h4>\n                        <p style="margin: 4px 0; color: #666;">').concat(building.description, '</p>\n                        <p style="margin: 4px 0; color: #888; font-size: 0.9rem;">類型: ').concat(building.type === 'academic' ? '學術建築' : '設施建築', "</p>\n                      </div>\n                    ");
                                                        marker.addTo(map).bindPopup(popupContent);
                                                        console.log("強制初始化建築物標記 ".concat(index + 1, " 添加成功:"), building.name);
                                                    }
                                                }
                                            }["MapComponent.useEffect.loadMap.waitForContainer"]);
                                            setMapLoaded(true);
                                            console.log('地圖強制初始化完成');
                                            // 強制重新計算地圖大小
                                            setTimeout({
                                                "MapComponent.useEffect.loadMap.waitForContainer": ()=>{
                                                    if (map && map.invalidateSize) {
                                                        map.invalidateSize();
                                                        console.log('地圖大小已重新計算');
                                                    }
                                                }
                                            }["MapComponent.useEffect.loadMap.waitForContainer"], 100);
                                        } catch (forceMapError) {
                                            console.error('強制初始化地圖錯誤:', forceMapError);
                                            setError(forceMapError.message);
                                        }
                                    } else {
                                        setTimeout(waitForContainer, 100);
                                    }
                                }
                            }
                        }["MapComponent.useEffect.loadMap.waitForContainer"];
                        waitForContainer();
                    } catch (err) {
                        console.error('地圖載入錯誤:', err);
                        setError(err.message);
                    }
                }
            }["MapComponent.useEffect.loadMap"];
            loadMap();
            return ({
                "MapComponent.useEffect": ()=>{
                    if (mapInstanceRef.current) {
                        mapInstanceRef.current.remove();
                        mapInstanceRef.current = null;
                    }
                }
            })["MapComponent.useEffect"];
        }
    }["MapComponent.useEffect"], []);
    // 監聽視窗大小變化
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MapComponent.useEffect": ()=>{
            const handleResize = {
                "MapComponent.useEffect.handleResize": ()=>{
                    if (mapInstanceRef.current && mapInstanceRef.current.invalidateSize) {
                        setTimeout({
                            "MapComponent.useEffect.handleResize": ()=>{
                                if (mapInstanceRef.current && mapInstanceRef.current.invalidateSize) {
                                    mapInstanceRef.current.invalidateSize();
                                    console.log('視窗大小變化，地圖已更新');
                                }
                            }
                        }["MapComponent.useEffect.handleResize"], 100);
                    }
                }
            }["MapComponent.useEffect.handleResize"];
            window.addEventListener('resize', handleResize);
            return ({
                "MapComponent.useEffect": ()=>window.removeEventListener('resize', handleResize)
            })["MapComponent.useEffect"];
        }
    }["MapComponent.useEffect"], [
        mapLoaded
    ]);
    // 更新危險區域標記
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MapComponent.useEffect": ()=>{
            if (!mapInstanceRef.current || !mapLoaded) return;
            const updateHazards = {
                "MapComponent.useEffect.updateHazards": async ()=>{
                    try {
                        const L = await __turbopack_context__.r("[project]/node_modules/leaflet/dist/leaflet-src.js [app-client] (ecmascript, async loader)")(__turbopack_context__.i);
                        // 檢查地圖實例是否有效
                        if (!mapInstanceRef.current || !mapInstanceRef.current.eachLayer) {
                            console.log('地圖實例無效，跳過更新危險區域');
                            return;
                        }
                        // 清除現有危險標記
                        mapInstanceRef.current.eachLayer({
                            "MapComponent.useEffect.updateHazards": (layer)=>{
                                if (layer._hazardMarker) {
                                    mapInstanceRef.current.removeLayer(layer);
                                }
                            }
                        }["MapComponent.useEffect.updateHazards"]);
                        // 使用資料庫中的危險區域資料
                        const hazardsToShow = hazards.length > 0 ? hazards : __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$mapData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hazardData"];
                        hazardsToShow.forEach({
                            "MapComponent.useEffect.updateHazards": (hazard)=>{
                                const hazardType = __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$mapData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hazardTypes"][hazard.type];
                                const hazardLevel = __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$mapData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hazardLevels"][hazard.level];
                                // 創建危險標記
                                const icon = L.default.divIcon({
                                    className: 'hazard-marker',
                                    html: '<div style="\n              width: '.concat(hazardLevel.size, "px; \n              height: ").concat(hazardLevel.size, "px; \n              background-color: ").concat(hazardType.color, '; \n              border: 2px solid white; \n              border-radius: 50%; \n              box-shadow: 0 2px 4px rgba(0,0,0,0.3);\n            "></div>'),
                                    iconSize: [
                                        hazardLevel.size,
                                        hazardLevel.size
                                    ],
                                    iconAnchor: [
                                        hazardLevel.size / 2,
                                        hazardLevel.size / 2
                                    ]
                                });
                                const marker = L.default.marker([
                                    hazard.lat,
                                    hazard.lng
                                ], {
                                    icon
                                }).addTo(mapInstanceRef.current);
                                marker._hazardMarker = true;
                                // 創建雷達動畫圓圈
                                const radarCircle = L.default.circle([
                                    hazard.lat,
                                    hazard.lng
                                ], {
                                    radius: hazardLevel.radarRadius,
                                    color: hazardType.color,
                                    fillColor: hazardType.color,
                                    fillOpacity: 0.08,
                                    weight: 1.5,
                                    opacity: 0.4
                                }).addTo(mapInstanceRef.current);
                                radarCircle._hazardMarker = true;
                                // 創建向外擴散的小圈
                                const expandingCircle = L.default.circle([
                                    hazard.lat,
                                    hazard.lng
                                ], {
                                    radius: 3,
                                    color: hazardType.color,
                                    fillColor: hazardType.color,
                                    fillOpacity: 0.4,
                                    weight: 2,
                                    opacity: 1
                                }).addTo(mapInstanceRef.current);
                                expandingCircle._hazardMarker = true;
                                // 添加向外擴散動畫效果
                                let animationStep = 0;
                                const animateRadar = {
                                    "MapComponent.useEffect.updateHazards.animateRadar": ()=>{
                                        // 計算擴散圈的位置和大小
                                        const progress = animationStep % 80 / 80; // 0 到 1 的循環，80幀一個週期
                                        const currentRadius = 3 + (hazardLevel.radarRadius - 3) * progress;
                                        // 使用緩動函數讓動畫更自然
                                        const easeOut = 1 - Math.pow(1 - progress, 3);
                                        const currentOpacity = 1 * (1 - easeOut);
                                        const currentFillOpacity = 0.4 * (1 - easeOut);
                                        expandingCircle.setRadius(currentRadius);
                                        expandingCircle.setStyle({
                                            opacity: currentOpacity,
                                            fillOpacity: currentFillOpacity
                                        });
                                        animationStep++;
                                        requestAnimationFrame(animateRadar);
                                    }
                                }["MapComponent.useEffect.updateHazards.animateRadar"];
                                animateRadar();
                                const popupContent = '\n            <div style="text-align: center;">\n              <h4 style="margin: 0 0 8px 0; color: #333;">'.concat(hazard.name, '</h4>\n              <p style="margin: 4px 0; color: #666;">類型: ').concat(hazardType.name, '</p>\n              <p style="margin: 4px 0; color: #666;">等級: ').concat(hazardLevel.name, '</p>\n              <p style="margin: 4px 0; color: #666;">建築: ').concat(hazard.building || '未指定', '</p>\n              <p style="margin: 4px 0; color: #888; font-size: 0.9rem;">').concat(hazard.description || '', '</p>\n              <p style="margin: 4px 0; color: #666;">影響範圍: ').concat(hazardLevel.radarRadius, "公尺</p>\n            </div>\n          ");
                                marker.bindPopup(popupContent);
                            }
                        }["MapComponent.useEffect.updateHazards"]);
                    } catch (err) {
                        console.error('更新危險區域錯誤:', err);
                    }
                }
            }["MapComponent.useEffect.updateHazards"];
            updateHazards();
        }
    }["MapComponent.useEffect"], [
        hazards,
        mapLoaded
    ]);
    if (error) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "map-error",
            children: [
                "地圖載入失敗: ",
                error
            ]
        }, void 0, true, {
            fileName: "[project]/components/MapComponent.js",
            lineNumber: 341,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: mapRef,
        className: "map-container",
        style: {
            width: '100%',
            height: '100%',
            minHeight: '100px',
            minWidth: '300px'
        },
        children: !mapLoaded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "map-loading",
            children: "載入地圖中..."
        }, void 0, false, {
            fileName: "[project]/components/MapComponent.js",
            lineNumber: 359,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/MapComponent.js",
        lineNumber: 348,
        columnNumber: 5
    }, this);
}
_s(MapComponent, "Olly06rgYUIFtQMGNy+dMY0wX4Q=");
_c = MapComponent;
var _c;
__turbopack_context__.k.register(_c, "MapComponent");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/MapComponent.js [app-client] (ecmascript, next/dynamic entry)": ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/components/MapComponent.js [app-client] (ecmascript)"));
}),
}]);

//# sourceMappingURL=components_MapComponent_560a6de2.js.map