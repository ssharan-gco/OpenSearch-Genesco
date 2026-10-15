"use strict";
(globalThis["sampleMap_bundle_jsonpfunction"] = globalThis["sampleMap_bundle_jsonpfunction"] || []).push([[1], {
"./public/application.tsx"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  renderApp: () => (renderApp)
});
/* import */ var react_jsx_dev_runtime__rspack_import_0 = __webpack_require__("../../node_modules/react/jsx-dev-runtime.js");
/* import */ var react__rspack_import_1 = __webpack_require__("react");
/* import */ var react__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(react__rspack_import_1);
/* import */ var react_dom_client__rspack_import_2 = __webpack_require__("../../node_modules/react-dom/client.js");
/* import */ var _lib_envConfig__rspack_import_3 = __webpack_require__("./public/lib/envConfig.ts");
/* import */ var _components_GenscoApp__rspack_import_4 = __webpack_require__("./public/components/GenscoApp.tsx");
var _this = undefined;





var renderApp = function renderApp(param, param1, param2) {
    var notifications = param.notifications, http = param.http, navigation = param1.navigation, appBasePath = param2.appBasePath, element = param2.element;
    var _ref;
    (0,_lib_envConfig__rspack_import_3.setOsdBasePath)(http.basePath.get());
    // OSD's `.app-wrapper` min-height assumes a one-row header; relax it while mounted
    // so the stacked new-topnav header rows don't add a stray scrollbar.
    var appWrapper = element.closest('.app-wrapper');
    var prevMinHeight = (_ref = appWrapper === null || appWrapper === void 0 ? void 0 : appWrapper.style.minHeight) !== null && _ref !== void 0 ? _ref : '';
    if (appWrapper) appWrapper.style.minHeight = '0';
    var root = (0,react_dom_client__rspack_import_2.createRoot)(element);
    root.render(/*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)(_components_GenscoApp__rspack_import_4.GenscoApp, {
        basename: appBasePath,
        notifications: notifications,
        http: http,
        navigation: navigation
    }, void 0, false, {
        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\application.tsx",
        lineNumber: 23,
        columnNumber: 5
    }, _this));
    return function() {
        root.unmount();
        if (appWrapper) appWrapper.style.minHeight = prevMinHeight;
    };
};


},
"./public/components/FilterPanel.tsx"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  FilterPanel: () => (FilterPanel)
});
/* import */ var react_jsx_dev_runtime__rspack_import_0 = __webpack_require__("../../node_modules/react/jsx-dev-runtime.js");
/* import */ var react__rspack_import_1 = __webpack_require__("react");
/* import */ var react__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(react__rspack_import_1);
var _this = undefined;


// To add a status: extend SiteStatus (lib/types), STATUS_COLORS (lib/constants),
// sample health / deriveStatus (services and lib), and add a row here.
var FILTERS = [
    {
        label: 'App Services Up',
        value: 'Up',
        color: '#27ae60',
        def: 'Site is reporting and all services are healthy.'
    },
    {
        label: 'Attention Required',
        value: 'Warning',
        color: '#e0a030',
        def: 'A service is stopped or CPU / memory is above threshold.'
    },
    {
        label: 'App Services Down',
        value: 'Down',
        color: '#e74c3c',
        def: 'Site host is down (gensco_site_up == 0).'
    },
    {
        label: 'Registers Down',
        value: 'Registers Down',
        color: '#ec4899',
        def: 'One or more registers are down while the store service is available.'
    },
    {
        label: 'EOD / Maintenance',
        value: 'EOD / Maintenance',
        color: '#a855f7',
        def: 'Store is in end-of-day processing or scheduled maintenance.'
    }
];
var FilterPanel = function FilterPanel(param) {
    var statusFilter = param.statusFilter, counts = param.counts, onChange = param.onChange;
    var total = Object.values(counts).reduce(function(sum, n) {
        return sum + n;
    }, 0);
    return /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
        id: "filter-panel",
        children: [
            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                id: "filter-title",
                children: [
                    "Filter by Status",
                    /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("span", {
                        className: "f-total-cnt",
                        children: [
                            total,
                            " sites"
                        ]
                    }, void 0, true, {
                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\FilterPanel.tsx",
                        lineNumber: 33,
                        columnNumber: 9
                    }, _this)
                ]
            }, void 0, true, {
                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\FilterPanel.tsx",
                lineNumber: 31,
                columnNumber: 7
            }, _this),
            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                id: "filter-buttons",
                children: FILTERS.map(function(f) {
                    var active = statusFilter === f.value;
                    return /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                        className: "filter-pill",
                        "data-tooltip": f.def,
                        style: active ? {
                            background: f.color,
                            borderColor: f.color
                        } : {
                            background: 'transparent',
                            borderColor: 'var(--border)'
                        },
                        onClick: function onClick() {
                            return onChange(active ? 'All' : f.value);
                        },
                        children: [
                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                                className: "f-dot",
                                style: {
                                    background: f.color
                                }
                            }, void 0, false, {
                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\FilterPanel.tsx",
                                lineNumber: 50,
                                columnNumber: 15
                            }, _this),
                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("span", {
                                className: "f-lbl",
                                style: {
                                    color: active ? '#fff' : undefined
                                },
                                children: f.label
                            }, void 0, false, {
                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\FilterPanel.tsx",
                                lineNumber: 51,
                                columnNumber: 15
                            }, _this),
                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("span", {
                                className: "f-cnt",
                                style: {
                                    color: active ? 'rgba(255,255,255,0.9)' : undefined
                                },
                                children: counts[f.value] || 0
                            }, void 0, false, {
                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\FilterPanel.tsx",
                                lineNumber: 54,
                                columnNumber: 15
                            }, _this)
                        ]
                    }, f.value, true, {
                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\FilterPanel.tsx",
                        lineNumber: 39,
                        columnNumber: 13
                    }, _this);
                })
            }, void 0, false, {
                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\FilterPanel.tsx",
                lineNumber: 35,
                columnNumber: 7
            }, _this)
        ]
    }, void 0, true, {
        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\FilterPanel.tsx",
        lineNumber: 30,
        columnNumber: 5
    }, _this);
};


},
"./public/components/GenscoApp.tsx"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  GenscoApp: () => (GenscoApp)
});
/* import */ var _swc_helpers_async_to_generator__rspack_import_14 = __webpack_require__("../../node_modules/@swc/helpers/esm/_async_to_generator.js");
/* import */ var _swc_helpers_sliced_to_array__rspack_import_13 = __webpack_require__("../../node_modules/@swc/helpers/esm/_sliced_to_array.js");
/* import */ var _swc_helpers_ts_generator__rspack_import_15 = __webpack_require__("../../node_modules/@swc/helpers/esm/_ts_generator.js");
/* import */ var react_jsx_dev_runtime__rspack_import_0 = __webpack_require__("../../node_modules/react/jsx-dev-runtime.js");
/* import */ var react__rspack_import_1 = __webpack_require__("react");
/* import */ var react__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(react__rspack_import_1);
/* import */ var react_dom__rspack_import_2 = __webpack_require__("react-dom");
/* import */ var react_dom__rspack_import_2_default = /*#__PURE__*/__webpack_require__.n(react_dom__rspack_import_2);
/* import */ var _osd_i18n_react__rspack_import_3 = __webpack_require__("@osd/i18n/react");
/* import */ var _osd_i18n_react__rspack_import_3_default = /*#__PURE__*/__webpack_require__.n(_osd_i18n_react__rspack_import_3);
/* import */ var _elastic_eui__rspack_import_4 = __webpack_require__("@elastic/eui");
/* import */ var _elastic_eui__rspack_import_4_default = /*#__PURE__*/__webpack_require__.n(_elastic_eui__rspack_import_4);
/* import */ var react_router_dom__rspack_import_5 = __webpack_require__("react-router-dom");
/* import */ var react_router_dom__rspack_import_5_default = /*#__PURE__*/__webpack_require__.n(react_router_dom__rspack_import_5);
/* import */ var _common__rspack_import_6 = __webpack_require__("./common/index.ts");
/* import */ var _services_searchClient__rspack_import_7 = __webpack_require__("./public/services/searchClient.ts");
/* import */ var _services_siteService__rspack_import_8 = __webpack_require__("./public/services/siteService.ts");
/* import */ var _hooks_useGenscoMap__rspack_import_9 = __webpack_require__("./public/hooks/useGenscoMap.ts");
/* import */ var _SearchBar__rspack_import_10 = __webpack_require__("./public/components/SearchBar.tsx");
/* import */ var _FilterPanel__rspack_import_11 = __webpack_require__("./public/components/FilterPanel.tsx");
/* import */ var _detail_DetailPanel__rspack_import_12 = __webpack_require__("./public/components/detail/DetailPanel.tsx");



var _this = undefined;













var COMMONLY_USED_RANGES = [
    {
        start: 'now-15m',
        end: 'now',
        label: 'Last 15 minutes'
    },
    {
        start: 'now-1h',
        end: 'now',
        label: 'Last 1 hour'
    },
    {
        start: 'now-6h',
        end: 'now',
        label: 'Last 6 hours'
    },
    {
        start: 'now-24h',
        end: 'now',
        label: 'Last 24 hours'
    },
    {
        start: 'now-7d',
        end: 'now',
        label: 'Last 7 days'
    }
];
/** Portals the date picker + theme toggle into the OSD primary header row. */ var HeaderControls = function HeaderControls(param) {
    var loading = param.loading, timeStart = param.timeStart, timeEnd = param.timeEnd, theme = param.theme, onTimeChange = param.onTimeChange, onRefresh = param.onRefresh, onThemeToggle = param.onThemeToggle;
    var _useState = (0,_swc_helpers_sliced_to_array__rspack_import_13._)((0,react__rspack_import_1.useState)(null), 2), host = _useState[0], setHost = _useState[1];
    (0,react__rspack_import_1.useEffect)(function() {
        var container = null;
        var raf = 0;
        var attach = function attach1() {
            var section = document.querySelector('.primaryHeader .euiHeaderSection--grow.euiHeaderSection--left');
            if (!section) {
                raf = window.requestAnimationFrame(attach);
                return;
            }
            container = document.createElement('div');
            container.className = 'sample-map-header-controls';
            section.appendChild(container);
            setHost(container);
        };
        attach();
        return function() {
            var _container_parentNode;
            if (raf) window.cancelAnimationFrame(raf);
            container === null || container === void 0 ? void 0 : (_container_parentNode = container.parentNode) === null || _container_parentNode === void 0 ? void 0 : _container_parentNode.removeChild(container);
        };
    }, []);
    if (!host) return null;
    return /*#__PURE__*/ (0,react_dom__rspack_import_2.createPortal)(/*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)(react_jsx_dev_runtime__rspack_import_0.Fragment, {
        children: [
            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)(_elastic_eui__rspack_import_4.EuiSuperDatePicker, {
                start: timeStart,
                end: timeEnd,
                onTimeChange: function onTimeChange1(param) {
                    var start = param.start, end = param.end;
                    return onTimeChange(start, end);
                },
                onRefresh: onRefresh,
                isLoading: loading,
                isPaused: true,
                refreshInterval: 0,
                commonlyUsedRanges: COMMONLY_USED_RANGES,
                compressed: true
            }, void 0, false, {
                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\GenscoApp.tsx",
                lineNumber: 67,
                columnNumber: 7
            }, _this),
            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("button", {
                className: "sample-map-theme-btn",
                title: theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode',
                onClick: onThemeToggle,
                style: {
                    background: theme === 'dark' ? '#374151' : '#fbbf24'
                },
                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("span", {
                    style: {
                        transform: theme === 'light' ? 'translateX(16px)' : 'translateX(0)'
                    },
                    children: theme === 'dark' ? '🌙' : '☀️'
                }, void 0, false, {
                    fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\GenscoApp.tsx",
                    lineNumber: 84,
                    columnNumber: 9
                }, _this)
            }, void 0, false, {
                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\GenscoApp.tsx",
                lineNumber: 78,
                columnNumber: 7
            }, _this)
        ]
    }, void 0, true), host);
};
/* ================================================================
   MAIN APPLICATION
   ================================================================ */ var GenscoApp = function GenscoApp(param) {
    var basename = param.basename, notifications = param.notifications, http = param.http, navigation = param.navigation;
    var osSearch = (0,react__rspack_import_1.useRef)((0,_services_searchClient__rspack_import_7.createOsSearch)(http)).current;
    var _useState = (0,_swc_helpers_sliced_to_array__rspack_import_13._)((0,react__rspack_import_1.useState)(false), 2), loading = _useState[0], setLoading = _useState[1];
    var _useState1 = (0,_swc_helpers_sliced_to_array__rspack_import_13._)((0,react__rspack_import_1.useState)([]), 2), allSites = _useState1[0], setAllSites = _useState1[1];
    var _useState2 = (0,_swc_helpers_sliced_to_array__rspack_import_13._)((0,react__rspack_import_1.useState)(false), 2), sampleSites = _useState2[0], setSampleSites = _useState2[1];
    var _useState3 = (0,_swc_helpers_sliced_to_array__rspack_import_13._)((0,react__rspack_import_1.useState)(false), 2), sampleMetrics = _useState3[0], setSampleMetrics = _useState3[1];
    var _useState4 = (0,_swc_helpers_sliced_to_array__rspack_import_13._)((0,react__rspack_import_1.useState)('All'), 2), statusFilter = _useState4[0], setStatusFilter = _useState4[1];
    var _useState5 = (0,_swc_helpers_sliced_to_array__rspack_import_13._)((0,react__rspack_import_1.useState)(''), 2), search = _useState5[0], setSearch = _useState5[1];
    var _useState6 = (0,_swc_helpers_sliced_to_array__rspack_import_13._)((0,react__rspack_import_1.useState)('dark'), 2), theme = _useState6[0], setTheme = _useState6[1];
    var _useState7 = (0,_swc_helpers_sliced_to_array__rspack_import_13._)((0,react__rspack_import_1.useState)('now-6h'), 2), timeStart = _useState7[0], setTimeStart = _useState7[1];
    var _useState8 = (0,_swc_helpers_sliced_to_array__rspack_import_13._)((0,react__rspack_import_1.useState)('now'), 2), timeEnd = _useState8[0], setTimeEnd = _useState8[1];
    var _useState9 = (0,_swc_helpers_sliced_to_array__rspack_import_13._)((0,react__rspack_import_1.useState)(0), 2), refreshTrigger = _useState9[0], setRefreshTrigger = _useState9[1];
    var _useState10 = (0,_swc_helpers_sliced_to_array__rspack_import_13._)((0,react__rspack_import_1.useState)(null), 2), selectedSiteId = _useState10[0], setSelectedSiteId = _useState10[1];
    // Fill exactly the viewport space below the (variable-height) OSD header.
    var rootRef = (0,react__rspack_import_1.useRef)(null);
    var _useState11 = (0,_swc_helpers_sliced_to_array__rspack_import_13._)((0,react__rspack_import_1.useState)('calc(100vh - 48px)'), 2), rootHeight = _useState11[0], setRootHeight = _useState11[1];
    (0,react__rspack_import_1.useEffect)(function() {
        var el = rootRef.current;
        if (!el) return;
        var measure = function measure() {
            return setRootHeight("".concat(Math.max(0, window.innerHeight - el.getBoundingClientRect().top), "px"));
        };
        measure();
        window.addEventListener('resize', measure);
        var ro = el.parentElement ? new ResizeObserver(measure) : null;
        if (ro && el.parentElement) ro.observe(el.parentElement);
        return function() {
            window.removeEventListener('resize', measure);
            ro === null || ro === void 0 ? void 0 : ro.disconnect();
        };
    }, []);
    var filteredSites = (0,react__rspack_import_1.useMemo)(function() {
        var term = search.trim().toLowerCase();
        return allSites.filter(function(s) {
            return (statusFilter === 'All' || s.status === statusFilter) && (term === '' || s.siteId.toLowerCase().includes(term) || s.city.toLowerCase().includes(term));
        });
    }, [
        allSites,
        statusFilter,
        search
    ]);
    var _useGenscoMap = (0,_hooks_useGenscoMap__rspack_import_9.useGenscoMap)({
        allSites: allSites,
        filteredSites: filteredSites,
        search: search,
        onSelectSite: setSelectedSiteId
    }), mapContainerRef = _useGenscoMap.mapContainerRef, counts = _useGenscoMap.counts, mapMoved = _useGenscoMap.mapMoved, resetMapView = _useGenscoMap.resetMapView;
    /* ── MAP DATA ── */ (0,react__rspack_import_1.useEffect)(function() {
        var cancelled = false;
        var load = function load() {
            return (0,_swc_helpers_async_to_generator__rspack_import_14._)(function() {
                var _ref, _ref_, sites, sample, health, _buildSiteRecords, records, sm, e;
                return (0,_swc_helpers_ts_generator__rspack_import_15._)(this, function(_state) {
                    switch(_state.label){
                        case 0:
                            setLoading(true);
                            _state.label = 1;
                        case 1:
                            _state.trys.push([
                                1,
                                3,
                                4,
                                5
                            ]);
                            return [
                                4,
                                Promise.all([
                                    (0,_services_siteService__rspack_import_8.fetchSiteLocations)(osSearch),
                                    (0,_services_siteService__rspack_import_8.fetchAllSiteHealth)()
                                ])
                            ];
                        case 2:
                            _ref = _swc_helpers_sliced_to_array__rspack_import_13._.apply(void 0, [
                                _state.sent(),
                                2
                            ]), _ref_ = _ref[0], sites = _ref_.sites, sample = _ref_.sample, health = _ref[1];
                            if (cancelled) return [
                                2
                            ];
                            _buildSiteRecords = (0,_services_siteService__rspack_import_8.buildSiteRecords)(sites, health), records = _buildSiteRecords.records, sm = _buildSiteRecords.sampleMetrics;
                            setAllSites(records);
                            setSampleSites(sample);
                            setSampleMetrics(sm);
                            return [
                                3,
                                5
                            ];
                        case 3:
                            e = _state.sent();
                            notifications.toasts.addError(e, {
                                title: 'Failed to load Gensco map data'
                            });
                            return [
                                3,
                                5
                            ];
                        case 4:
                            if (!cancelled) setLoading(false);
                            return [
                                7
                            ];
                        case 5:
                            return [
                                2
                            ];
                    }
                });
            })();
        };
        load();
        return function() {
            cancelled = true;
        };
    }, [
        refreshTrigger,
        osSearch,
        notifications
    ]);
    var selectedSite = allSites.find(function(s) {
        return s.siteId === selectedSiteId;
    }) || null;
    var usingSample = sampleSites || sampleMetrics;
    return /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)(react_router_dom__rspack_import_5.BrowserRouter, {
        basename: basename,
        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)(_osd_i18n_react__rspack_import_3.I18nProvider, {
            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                ref: rootRef,
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    height: rootHeight,
                    minHeight: 0,
                    overflow: 'hidden'
                },
                children: [
                    /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)(navigation.ui.TopNavMenu, {
                        appName: _common__rspack_import_6.PLUGIN_ID,
                        showSearchBar: false,
                        useDefaultBehaviors: true
                    }, void 0, false, {
                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\GenscoApp.tsx",
                        lineNumber: 179,
                        columnNumber: 11
                    }, _this),
                    /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)(HeaderControls, {
                        loading: loading,
                        timeStart: timeStart,
                        timeEnd: timeEnd,
                        theme: theme,
                        onTimeChange: function onTimeChange(s, e) {
                            setTimeStart(s);
                            setTimeEnd(e);
                        },
                        onRefresh: function onRefresh() {
                            return setRefreshTrigger(function(n) {
                                return n + 1;
                            });
                        },
                        onThemeToggle: function onThemeToggle() {
                            return setTheme(function(t) {
                                return t === 'dark' ? 'light' : 'dark';
                            });
                        }
                    }, void 0, false, {
                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\GenscoApp.tsx",
                        lineNumber: 181,
                        columnNumber: 11
                    }, _this),
                    /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                        className: "sample-map-container ".concat(theme),
                        style: {
                            flex: 1,
                            position: 'relative'
                        },
                        children: [
                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                                id: "map",
                                ref: mapContainerRef
                            }, void 0, false, {
                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\GenscoApp.tsx",
                                lineNumber: 195,
                                columnNumber: 13
                            }, _this),
                            usingSample && !loading && /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                                className: "float",
                                id: "sample-banner",
                                title: "Seed the indices / VictoriaMetrics to see live data",
                                children: [
                                    "Sample data",
                                    sampleSites ? ' · sites' : '',
                                    sampleMetrics ? ' · metrics' : ''
                                ]
                            }, void 0, true, {
                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\GenscoApp.tsx",
                                lineNumber: 198,
                                columnNumber: 15
                            }, _this),
                            mapMoved && /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("button", {
                                className: "float",
                                id: "reset-view-btn",
                                onClick: resetMapView,
                                title: "Return to initial map position",
                                children: "⌖ Reset View"
                            }, void 0, false, {
                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\GenscoApp.tsx",
                                lineNumber: 205,
                                columnNumber: 15
                            }, _this),
                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)(_SearchBar__rspack_import_10.SearchBar, {
                                value: search,
                                onChange: setSearch
                            }, void 0, false, {
                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\GenscoApp.tsx",
                                lineNumber: 210,
                                columnNumber: 13
                            }, _this),
                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                                className: "float",
                                id: "top-right-stack",
                                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)(_FilterPanel__rspack_import_11.FilterPanel, {
                                    statusFilter: statusFilter,
                                    counts: counts,
                                    onChange: setStatusFilter
                                }, void 0, false, {
                                    fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\GenscoApp.tsx",
                                    lineNumber: 213,
                                    columnNumber: 15
                                }, _this)
                            }, void 0, false, {
                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\GenscoApp.tsx",
                                lineNumber: 212,
                                columnNumber: 13
                            }, _this),
                            loading && /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                                className: "float",
                                id: "loading",
                                children: [
                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                                        className: "spinner"
                                    }, void 0, false, {
                                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\GenscoApp.tsx",
                                        lineNumber: 218,
                                        columnNumber: 17
                                    }, _this),
                                    "Loading Gensco sites…"
                                ]
                            }, void 0, true, {
                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\GenscoApp.tsx",
                                lineNumber: 217,
                                columnNumber: 15
                            }, _this),
                            selectedSite && /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)(_detail_DetailPanel__rspack_import_12.DetailPanel, {
                                site: selectedSite,
                                onRefresh: function onRefresh() {
                                    return setRefreshTrigger(function(n) {
                                        return n + 1;
                                    });
                                },
                                onClose: function onClose() {
                                    return setSelectedSiteId(null);
                                }
                            }, void 0, false, {
                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\GenscoApp.tsx",
                                lineNumber: 224,
                                columnNumber: 15
                            }, _this)
                        ]
                    }, void 0, true, {
                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\GenscoApp.tsx",
                        lineNumber: 194,
                        columnNumber: 11
                    }, _this)
                ]
            }, void 0, true, {
                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\GenscoApp.tsx",
                lineNumber: 175,
                columnNumber: 9
            }, _this)
        }, void 0, false, {
            fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\GenscoApp.tsx",
            lineNumber: 174,
            columnNumber: 7
        }, _this)
    }, void 0, false, {
        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\GenscoApp.tsx",
        lineNumber: 173,
        columnNumber: 5
    }, _this);
};


},
"./public/components/SearchBar.tsx"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  SearchBar: () => (SearchBar)
});
/* import */ var react_jsx_dev_runtime__rspack_import_0 = __webpack_require__("../../node_modules/react/jsx-dev-runtime.js");
/* import */ var react__rspack_import_1 = __webpack_require__("react");
/* import */ var react__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(react__rspack_import_1);
var _this = undefined;


var SearchBar = function SearchBar(param) {
    var value = param.value, onChange = param.onChange;
    return /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
        className: "float ".concat(value !== '' ? 'active' : ''),
        id: "search-bar",
        children: [
            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("span", {
                id: "search-icon",
                children: "\uD83D\uDD0D"
            }, void 0, false, {
                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\SearchBar.tsx",
                lineNumber: 10,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("span", {
                id: "search-label",
                children: value !== '' ? 'Filtering "'.concat(value, '"') : 'All Sites'
            }, void 0, false, {
                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\SearchBar.tsx",
                lineNumber: 11,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                id: "search-input-wrap",
                children: [
                    /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("input", {
                        type: "text",
                        id: "store-search",
                        placeholder: "Site # or city",
                        value: value,
                        onChange: function onChange1(e) {
                            return onChange(e.target.value);
                        }
                    }, void 0, false, {
                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\SearchBar.tsx",
                        lineNumber: 13,
                        columnNumber: 7
                    }, _this),
                    value !== '' && /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("button", {
                        id: "clear-search",
                        onClick: function onClick() {
                            return onChange('');
                        },
                        title: "Clear search",
                        children: "✕"
                    }, void 0, false, {
                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\SearchBar.tsx",
                        lineNumber: 21,
                        columnNumber: 9
                    }, _this)
                ]
            }, void 0, true, {
                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\SearchBar.tsx",
                lineNumber: 12,
                columnNumber: 5
            }, _this)
        ]
    }, void 0, true, {
        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\SearchBar.tsx",
        lineNumber: 9,
        columnNumber: 3
    }, _this);
};


},
"./public/components/detail/DetailPanel.tsx"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  DetailPanel: () => (DetailPanel)
});
/* import */ var _swc_helpers_sliced_to_array__rspack_import_3 = __webpack_require__("../../node_modules/@swc/helpers/esm/_sliced_to_array.js");
/* import */ var react_jsx_dev_runtime__rspack_import_0 = __webpack_require__("../../node_modules/react/jsx-dev-runtime.js");
/* import */ var react__rspack_import_1 = __webpack_require__("react");
/* import */ var react__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(react__rspack_import_1);
/* import */ var _sample_data_store_dashboard_by_store_json__rspack_import_2 = __webpack_require__("./sample-data/store-dashboard-by-store.json");

var _this = undefined;



var STATUS_CLASS = {
    Healthy: 'healthy',
    Degraded: 'degraded',
    Down: 'down',
    Up: 'healthy'
};
var DetailPanel = function DetailPanel(param) {
    var site = param.site, onRefresh = param.onRefresh, onClose = param.onClose;
    var dashboardData = _sample_data_store_dashboard_by_store_json__rspack_import_2[site.siteId];
    var _useState = (0,_swc_helpers_sliced_to_array__rspack_import_3._)((0,react__rspack_import_1.useState)((dashboardData === null || dashboardData === void 0 ? void 0 : dashboardData.lastRefreshed) || new Date().toISOString()), 2), lastRefreshed = _useState[0], setLastRefreshed = _useState[1];
    if (!dashboardData) return null;
    var registers = dashboardData.registers;
    var healthyCount = registers.filter(function(register) {
        return register.status === 'Healthy';
    }).length;
    var degradedCount = registers.filter(function(register) {
        return register.status === 'Degraded';
    }).length;
    var downCount = registers.filter(function(register) {
        return register.status === 'Down';
    }).length;
    var processCount = registers.reduce(function(total, register) {
        return total + register.processes.length;
    }, 0);
    var runningProcessCount = registers.reduce(function(total, register) {
        return total + register.processesUp;
    }, 0);
    var serviceCount = registers.reduce(function(total, register) {
        return total + register.services.length;
    }, 0);
    var runningServiceCount = registers.reduce(function(total, register) {
        return total + register.servicesUp;
    }, 0);
    var location = [
        site.address,
        [
            site.city,
            [
                site.state,
                site.zip
            ].filter(Boolean).join(' ')
        ].filter(Boolean).join(', ')
    ].filter(Boolean).join(' · ');
    var storeTitle = "Store #".concat(site.siteId, " — ").concat(site.city).concat(site.state ? ", ".concat(site.state) : '');
    var refreshDashboard = function refreshDashboard() {
        setLastRefreshed(new Date().toISOString());
        onRefresh();
    };
    return /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)(react_jsx_dev_runtime__rspack_import_0.Fragment, {
        children: [
            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                id: "overlay-bg",
                onClick: onClose
            }, void 0, false, {
                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                lineNumber: 42,
                columnNumber: 7
            }, _this),
            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                id: "detail-panel",
                children: [
                    /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                        className: "dp-header",
                        children: [
                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                                className: "store-dashboard-heading",
                                children: [
                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                                        className: "store-dashboard-eyebrow",
                                        children: "XSTORE POS \xb7 STORE DETAIL VIEW"
                                    }, void 0, false, {
                                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                        lineNumber: 46,
                                        columnNumber: 13
                                    }, _this),
                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                                        className: "dp-title",
                                        children: storeTitle
                                    }, void 0, false, {
                                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                        lineNumber: 47,
                                        columnNumber: 13
                                    }, _this),
                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                                        className: "gm-subtitle",
                                        children: [
                                            location,
                                            " \xb7 ",
                                            registers.length,
                                            " registers \xb7 No back-office server"
                                        ]
                                    }, void 0, true, {
                                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                        lineNumber: 48,
                                        columnNumber: 13
                                    }, _this),
                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                                        className: "store-dashboard-tags",
                                        children: [
                                            downCount > 0 && /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("span", {
                                                className: "store-dashboard-tag tag-down",
                                                children: "Registers Down"
                                            }, void 0, false, {
                                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                lineNumber: 52,
                                                columnNumber: 33
                                            }, _this),
                                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("span", {
                                                className: "store-dashboard-tag",
                                                children: [
                                                    registers.length,
                                                    " registers"
                                                ]
                                            }, void 0, true, {
                                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                lineNumber: 53,
                                                columnNumber: 15
                                            }, _this),
                                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("span", {
                                                className: "store-dashboard-tag tag-healthy",
                                                children: [
                                                    healthyCount,
                                                    " healthy"
                                                ]
                                            }, void 0, true, {
                                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                lineNumber: 54,
                                                columnNumber: 15
                                            }, _this),
                                            downCount > 0 && /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("span", {
                                                className: "store-dashboard-tag tag-down",
                                                children: [
                                                    downCount,
                                                    " down"
                                                ]
                                            }, void 0, true, {
                                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                lineNumber: 55,
                                                columnNumber: 33
                                            }, _this),
                                            degradedCount > 0 && /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("span", {
                                                className: "store-dashboard-tag tag-degraded",
                                                children: [
                                                    degradedCount,
                                                    " degraded"
                                                ]
                                            }, void 0, true, {
                                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                lineNumber: 56,
                                                columnNumber: 37
                                            }, _this),
                                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("span", {
                                                className: "store-dashboard-tag",
                                                children: "Last 24 hours"
                                            }, void 0, false, {
                                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                lineNumber: 57,
                                                columnNumber: 15
                                            }, _this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                        lineNumber: 51,
                                        columnNumber: 13
                                    }, _this)
                                ]
                            }, void 0, true, {
                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                lineNumber: 45,
                                columnNumber: 11
                            }, _this),
                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                                className: "store-dashboard-header-actions",
                                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                                    className: "store-dashboard-refresh",
                                    children: [
                                        /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("span", {
                                            children: "LAST REFRESHED"
                                        }, void 0, false, {
                                            fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                            lineNumber: 62,
                                            columnNumber: 15
                                        }, _this),
                                        /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("strong", {
                                            children: new Date(lastRefreshed).toLocaleString()
                                        }, void 0, false, {
                                            fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                            lineNumber: 63,
                                            columnNumber: 15
                                        }, _this),
                                        /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("span", {
                                            children: "Source: VictoriaMetrics \xb7 store POS"
                                        }, void 0, false, {
                                            fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                            lineNumber: 64,
                                            columnNumber: 15
                                        }, _this),
                                        /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("span", {
                                            className: "store-dashboard-legend",
                                            children: [
                                                /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("i", {
                                                    className: "healthy"
                                                }, void 0, false, {
                                                    fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                    lineNumber: 66,
                                                    columnNumber: 17
                                                }, _this),
                                                " Up / Running ",
                                                /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("i", {
                                                    className: "degraded"
                                                }, void 0, false, {
                                                    fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                    lineNumber: 66,
                                                    columnNumber: 56
                                                }, _this),
                                                " Degraded ",
                                                /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("i", {
                                                    className: "down"
                                                }, void 0, false, {
                                                    fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                    lineNumber: 66,
                                                    columnNumber: 92
                                                }, _this),
                                                " Down",
                                                /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("i", {
                                                    className: "no-data"
                                                }, void 0, false, {
                                                    fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                    lineNumber: 67,
                                                    columnNumber: 17
                                                }, _this),
                                                " No data ",
                                                /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("i", {
                                                    className: "restart"
                                                }, void 0, false, {
                                                    fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                    lineNumber: 67,
                                                    columnNumber: 51
                                                }, _this),
                                                " Restart"
                                            ]
                                        }, void 0, true, {
                                            fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                            lineNumber: 65,
                                            columnNumber: 15
                                        }, _this)
                                    ]
                                }, void 0, true, {
                                    fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                    lineNumber: 61,
                                    columnNumber: 13
                                }, _this)
                            }, void 0, false, {
                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                lineNumber: 60,
                                columnNumber: 11
                            }, _this)
                        ]
                    }, void 0, true, {
                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                        lineNumber: 44,
                        columnNumber: 9
                    }, _this),
                    /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                        className: "store-dashboard-notice",
                        children: [
                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("strong", {
                                children: dashboardData.storeMode
                            }, void 0, false, {
                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                lineNumber: 80,
                                columnNumber: 11
                            }, _this),
                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("span", {
                                children: dashboardData.notice
                            }, void 0, false, {
                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                lineNumber: 81,
                                columnNumber: 11
                            }, _this)
                        ]
                    }, void 0, true, {
                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                        lineNumber: 79,
                        columnNumber: 9
                    }, _this),
                    /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                        className: "dp-cards",
                        children: [
                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)(SummaryCard, {
                                label: "Registers",
                                value: String(registers.length),
                                sub: registers.map(function(r) {
                                    return "R".concat(String(r.id).padStart(2, '0'));
                                }).join(', ')
                            }, void 0, false, {
                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                lineNumber: 85,
                                columnNumber: 11
                            }, _this),
                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)(SummaryCard, {
                                label: "Healthy",
                                value: String(healthyCount),
                                sub: registers.filter(function(r) {
                                    return r.status === 'Healthy';
                                }).map(function(r) {
                                    return "Reg ".concat(r.id);
                                }).join(', ') || 'None',
                                tone: "healthy"
                            }, void 0, false, {
                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                lineNumber: 86,
                                columnNumber: 11
                            }, _this),
                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)(SummaryCard, {
                                label: "Degraded",
                                value: String(degradedCount),
                                sub: registers.filter(function(r) {
                                    return r.status === 'Degraded';
                                }).map(function(r) {
                                    return "Reg ".concat(r.id);
                                }).join(', ') || 'None',
                                tone: "degraded"
                            }, void 0, false, {
                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                lineNumber: 87,
                                columnNumber: 11
                            }, _this),
                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)(SummaryCard, {
                                label: "Down",
                                value: String(downCount),
                                sub: registers.filter(function(r) {
                                    return r.status === 'Down';
                                }).map(function(r) {
                                    return "Reg ".concat(r.id);
                                }).join(', ') || 'None',
                                tone: "down"
                            }, void 0, false, {
                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                lineNumber: 88,
                                columnNumber: 11
                            }, _this),
                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)(SummaryCard, {
                                label: "Processes Up",
                                value: "".concat(runningProcessCount, "/").concat(processCount),
                                sub: "6 tracked per register"
                            }, void 0, false, {
                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                lineNumber: 89,
                                columnNumber: 11
                            }, _this),
                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)(SummaryCard, {
                                label: "Services Up",
                                value: "".concat(runningServiceCount, "/").concat(serviceCount),
                                sub: "4 tracked per register"
                            }, void 0, false, {
                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                lineNumber: 90,
                                columnNumber: 11
                            }, _this),
                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)(SummaryCard, {
                                label: "Store Health (24h)",
                                value: "".concat(dashboardData.storeHealth, "%"),
                                sub: "Weighted uptime",
                                tone: dashboardData.storeHealth >= 90 ? 'healthy' : dashboardData.storeHealth >= 65 ? 'degraded' : 'down'
                            }, void 0, false, {
                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                lineNumber: 91,
                                columnNumber: 11
                            }, _this)
                        ]
                    }, void 0, true, {
                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                        lineNumber: 84,
                        columnNumber: 9
                    }, _this),
                    /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                        className: "dp-body store-dashboard-body",
                        children: [
                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("section", {
                                className: "store-dashboard-section",
                                children: [
                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)(SectionHeading, {
                                        title: "Register Status & System Uptime",
                                        subtitle: "xstore_pos_uptime_seconds \xb7 latest sample"
                                    }, void 0, false, {
                                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                        lineNumber: 96,
                                        columnNumber: 13
                                    }, _this),
                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                                        className: "store-dashboard-table-wrap",
                                        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("table", {
                                            className: "store-dashboard-table",
                                            children: [
                                                /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("thead", {
                                                    children: /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("tr", {
                                                        children: [
                                                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("th", {
                                                                children: "Register"
                                                            }, void 0, false, {
                                                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                lineNumber: 101,
                                                                columnNumber: 21
                                                            }, _this),
                                                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("th", {
                                                                children: "Host"
                                                            }, void 0, false, {
                                                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                lineNumber: 102,
                                                                columnNumber: 21
                                                            }, _this),
                                                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("th", {
                                                                children: "System Uptime"
                                                            }, void 0, false, {
                                                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                lineNumber: 103,
                                                                columnNumber: 21
                                                            }, _this),
                                                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("th", {
                                                                children: "Last Boot"
                                                            }, void 0, false, {
                                                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                lineNumber: 104,
                                                                columnNumber: 21
                                                            }, _this),
                                                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("th", {
                                                                children: "Processes"
                                                            }, void 0, false, {
                                                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                lineNumber: 105,
                                                                columnNumber: 21
                                                            }, _this),
                                                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("th", {
                                                                children: "Services"
                                                            }, void 0, false, {
                                                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                lineNumber: 106,
                                                                columnNumber: 21
                                                            }, _this),
                                                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("th", {
                                                                children: "Last 24h"
                                                            }, void 0, false, {
                                                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                lineNumber: 107,
                                                                columnNumber: 21
                                                            }, _this),
                                                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("th", {
                                                                children: "Latest Status"
                                                            }, void 0, false, {
                                                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                lineNumber: 108,
                                                                columnNumber: 21
                                                            }, _this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                        lineNumber: 100,
                                                        columnNumber: 19
                                                    }, _this)
                                                }, void 0, false, {
                                                    fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                    lineNumber: 99,
                                                    columnNumber: 17
                                                }, _this),
                                                /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("tbody", {
                                                    children: registers.map(function(register) {
                                                        return /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("tr", {
                                                            children: [
                                                                /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("td", {
                                                                    children: [
                                                                        "Register ",
                                                                        register.id
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                    lineNumber: 114,
                                                                    columnNumber: 23
                                                                }, _this),
                                                                /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("td", {
                                                                    children: [
                                                                        register.host,
                                                                        /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                                                                            style: {
                                                                                fontSize: 11,
                                                                                opacity: 0.7
                                                                            },
                                                                            children: register.ip
                                                                        }, void 0, false, {
                                                                            fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                            lineNumber: 115,
                                                                            columnNumber: 42
                                                                        }, _this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                    lineNumber: 115,
                                                                    columnNumber: 23
                                                                }, _this),
                                                                /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("td", {
                                                                    children: /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("strong", {
                                                                        children: register.uptime
                                                                    }, void 0, false, {
                                                                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                        lineNumber: 116,
                                                                        columnNumber: 27
                                                                    }, _this)
                                                                }, void 0, false, {
                                                                    fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                    lineNumber: 116,
                                                                    columnNumber: 23
                                                                }, _this),
                                                                /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("td", {
                                                                    children: register.lastBoot
                                                                }, void 0, false, {
                                                                    fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                    lineNumber: 117,
                                                                    columnNumber: 23
                                                                }, _this),
                                                                /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("td", {
                                                                    className: register.processesUp === 6 ? 'healthy-text' : 'degraded-text',
                                                                    children: [
                                                                        register.processesUp,
                                                                        " / 6"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                    lineNumber: 118,
                                                                    columnNumber: 23
                                                                }, _this),
                                                                /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("td", {
                                                                    className: register.servicesUp === 4 ? 'healthy-text' : 'degraded-text',
                                                                    children: [
                                                                        register.servicesUp,
                                                                        " / 4"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                    lineNumber: 121,
                                                                    columnNumber: 23
                                                                }, _this),
                                                                /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("td", {
                                                                    children: /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)(UptimeBars, {
                                                                        history: register.history,
                                                                        registerId: register.id
                                                                    }, void 0, false, {
                                                                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                        lineNumber: 124,
                                                                        columnNumber: 27
                                                                    }, _this)
                                                                }, void 0, false, {
                                                                    fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                    lineNumber: 124,
                                                                    columnNumber: 23
                                                                }, _this),
                                                                /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("td", {
                                                                    children: /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)(StatusBadge, {
                                                                        status: register.status
                                                                    }, void 0, false, {
                                                                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                        lineNumber: 125,
                                                                        columnNumber: 27
                                                                    }, _this)
                                                                }, void 0, false, {
                                                                    fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                    lineNumber: 125,
                                                                    columnNumber: 23
                                                                }, _this)
                                                            ]
                                                        }, register.id, true, {
                                                            fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                            lineNumber: 113,
                                                            columnNumber: 21
                                                        }, _this);
                                                    })
                                                }, void 0, false, {
                                                    fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                    lineNumber: 111,
                                                    columnNumber: 17
                                                }, _this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                            lineNumber: 98,
                                            columnNumber: 15
                                        }, _this)
                                    }, void 0, false, {
                                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                        lineNumber: 97,
                                        columnNumber: 13
                                    }, _this)
                                ]
                            }, void 0, true, {
                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                lineNumber: 95,
                                columnNumber: 11
                            }, _this),
                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("section", {
                                className: "store-dashboard-section",
                                children: [
                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)(SectionHeading, {
                                        title: "Register Depth View",
                                        subtitle: "Latest process & service state per register, with 24h sparkline"
                                    }, void 0, false, {
                                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                        lineNumber: 134,
                                        columnNumber: 13
                                    }, _this),
                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                                        className: "store-register-grid",
                                        children: registers.map(function(register) {
                                            return /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("article", {
                                                className: "store-register-card",
                                                children: [
                                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("header", {
                                                        className: "store-register-header",
                                                        children: [
                                                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                                                                children: [
                                                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("span", {
                                                                        className: "store-mini-label",
                                                                        children: "REGISTER"
                                                                    }, void 0, false, {
                                                                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                        lineNumber: 140,
                                                                        columnNumber: 23
                                                                    }, _this),
                                                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("h3", {
                                                                        children: [
                                                                            "Reg ",
                                                                            register.id
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                        lineNumber: 141,
                                                                        columnNumber: 23
                                                                    }, _this),
                                                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("small", {
                                                                        children: [
                                                                            register.host,
                                                                            " \xb7 ",
                                                                            register.ip
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                        lineNumber: 142,
                                                                        columnNumber: 23
                                                                    }, _this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                lineNumber: 139,
                                                                columnNumber: 21
                                                            }, _this),
                                                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                                                                className: "store-register-health",
                                                                children: [
                                                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)(StatusBadge, {
                                                                        status: register.status
                                                                    }, void 0, false, {
                                                                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                        lineNumber: 145,
                                                                        columnNumber: 23
                                                                    }, _this),
                                                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("strong", {
                                                                        children: register.uptime
                                                                    }, void 0, false, {
                                                                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                        lineNumber: 146,
                                                                        columnNumber: 23
                                                                    }, _this),
                                                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("small", {
                                                                        children: "SYSTEM UPTIME"
                                                                    }, void 0, false, {
                                                                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                        lineNumber: 147,
                                                                        columnNumber: 23
                                                                    }, _this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                lineNumber: 144,
                                                                columnNumber: 21
                                                            }, _this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                        lineNumber: 138,
                                                        columnNumber: 19
                                                    }, _this),
                                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)(RegisterUtilization, {
                                                        siteId: site.siteId,
                                                        registerId: register.id
                                                    }, void 0, false, {
                                                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                        lineNumber: 151,
                                                        columnNumber: 19
                                                    }, _this),
                                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                                                        className: "store-register-group",
                                                        children: [
                                                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                                                                className: "store-group-heading",
                                                                children: [
                                                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("span", {
                                                                        children: "PROCESSES"
                                                                    }, void 0, false, {
                                                                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                        lineNumber: 155,
                                                                        columnNumber: 23
                                                                    }, _this),
                                                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("strong", {
                                                                        className: register.processesUp === 6 ? 'healthy-text' : 'degraded-text',
                                                                        children: [
                                                                            register.processesUp,
                                                                            " / 6 UP"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                        lineNumber: 156,
                                                                        columnNumber: 23
                                                                    }, _this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                lineNumber: 154,
                                                                columnNumber: 21
                                                            }, _this),
                                                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                                                                className: "store-process-grid",
                                                                children: register.processes.map(function(process) {
                                                                    return /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                                                                        className: "store-health-item ".concat(STATUS_CLASS[process.status] || 'down'),
                                                                        children: [
                                                                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                                                                                children: [
                                                                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("strong", {
                                                                                        children: process.name
                                                                                    }, void 0, false, {
                                                                                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                                        lineNumber: 163,
                                                                                        columnNumber: 32
                                                                                    }, _this),
                                                                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("small", {
                                                                                        children: [
                                                                                            "pid ",
                                                                                            process.pid
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                                        lineNumber: 163,
                                                                                        columnNumber: 63
                                                                                    }, _this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                                lineNumber: 163,
                                                                                columnNumber: 27
                                                                            }, _this),
                                                                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("span", {
                                                                                children: process.status
                                                                            }, void 0, false, {
                                                                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                                lineNumber: 164,
                                                                                columnNumber: 27
                                                                            }, _this),
                                                                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)(UptimeBars, {
                                                                                history: register.history,
                                                                                registerId: register.id,
                                                                                compact: true
                                                                            }, void 0, false, {
                                                                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                                lineNumber: 165,
                                                                                columnNumber: 27
                                                                            }, _this)
                                                                        ]
                                                                    }, process.name, true, {
                                                                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                        lineNumber: 162,
                                                                        columnNumber: 25
                                                                    }, _this);
                                                                })
                                                            }, void 0, false, {
                                                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                lineNumber: 160,
                                                                columnNumber: 21
                                                            }, _this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                        lineNumber: 153,
                                                        columnNumber: 19
                                                    }, _this),
                                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                                                        className: "store-register-group",
                                                        children: [
                                                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                                                                className: "store-group-heading",
                                                                children: [
                                                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("span", {
                                                                        children: "SERVICES"
                                                                    }, void 0, false, {
                                                                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                        lineNumber: 173,
                                                                        columnNumber: 23
                                                                    }, _this),
                                                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("strong", {
                                                                        className: register.servicesUp === 4 ? 'healthy-text' : 'degraded-text',
                                                                        children: [
                                                                            register.servicesUp,
                                                                            " / 4 UP"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                        lineNumber: 174,
                                                                        columnNumber: 23
                                                                    }, _this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                lineNumber: 172,
                                                                columnNumber: 21
                                                            }, _this),
                                                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                                                                className: "store-service-grid",
                                                                children: register.services.map(function(service) {
                                                                    return /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                                                                        className: "store-health-item ".concat(STATUS_CLASS[service.status] || 'down'),
                                                                        children: [
                                                                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("strong", {
                                                                                children: service.name
                                                                            }, void 0, false, {
                                                                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                                lineNumber: 181,
                                                                                columnNumber: 27
                                                                            }, _this),
                                                                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("span", {
                                                                                children: service.status
                                                                            }, void 0, false, {
                                                                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                                lineNumber: 182,
                                                                                columnNumber: 27
                                                                            }, _this),
                                                                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)(UptimeBars, {
                                                                                history: register.history,
                                                                                registerId: register.id,
                                                                                compact: true
                                                                            }, void 0, false, {
                                                                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                                lineNumber: 183,
                                                                                columnNumber: 27
                                                                            }, _this)
                                                                        ]
                                                                    }, service.name, true, {
                                                                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                        lineNumber: 180,
                                                                        columnNumber: 25
                                                                    }, _this);
                                                                })
                                                            }, void 0, false, {
                                                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                                lineNumber: 178,
                                                                columnNumber: 21
                                                            }, _this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                        lineNumber: 171,
                                                        columnNumber: 19
                                                    }, _this),
                                                    register.status !== 'Healthy' && /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                                                        className: "store-register-note ".concat(STATUS_CLASS[register.status]),
                                                        children: register.status === 'Down' ? 'Sample unavailable process or service (demo only)' : 'Sample degraded health state (demo only)'
                                                    }, void 0, false, {
                                                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                        lineNumber: 189,
                                                        columnNumber: 21
                                                    }, _this)
                                                ]
                                            }, register.id, true, {
                                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                                lineNumber: 137,
                                                columnNumber: 17
                                            }, _this);
                                        })
                                    }, void 0, false, {
                                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                        lineNumber: 135,
                                        columnNumber: 13
                                    }, _this)
                                ]
                            }, void 0, true, {
                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                lineNumber: 133,
                                columnNumber: 11
                            }, _this)
                        ]
                    }, void 0, true, {
                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                        lineNumber: 94,
                        columnNumber: 9
                    }, _this)
                ]
            }, void 0, true, {
                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                lineNumber: 43,
                columnNumber: 7
            }, _this)
        ]
    }, void 0, true);
};
var SummaryCard = function SummaryCard(param) {
    var label = param.label, value = param.value, sub = param.sub, tone = param.tone;
    return /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
        className: "dp-card",
        children: [
            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                className: "c-label",
                children: label
            }, void 0, false, {
                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                lineNumber: 217,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                className: "c-value ".concat(tone ? "".concat(tone, "-text") : ''),
                children: value
            }, void 0, false, {
                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                lineNumber: 218,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                className: "c-sub",
                children: sub
            }, void 0, false, {
                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                lineNumber: 219,
                columnNumber: 5
            }, _this)
        ]
    }, void 0, true, {
        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
        lineNumber: 216,
        columnNumber: 3
    }, _this);
};
var SectionHeading = function SectionHeading(param) {
    var title = param.title, subtitle = param.subtitle;
    return /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
        className: "store-section-heading",
        children: [
            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("strong", {
                children: title
            }, void 0, false, {
                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                lineNumber: 225,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("span", {
                children: subtitle
            }, void 0, false, {
                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                lineNumber: 226,
                columnNumber: 5
            }, _this)
        ]
    }, void 0, true, {
        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
        lineNumber: 224,
        columnNumber: 3
    }, _this);
};
var StatusBadge = function StatusBadge(param) {
    var status = param.status;
    return /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("span", {
        className: "store-status-badge ".concat(STATUS_CLASS[status] || 'down'),
        children: status
    }, void 0, false, {
        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
        lineNumber: 231,
        columnNumber: 3
    }, _this);
};
var RegisterUtilization = function RegisterUtilization(param) {
    var siteId = param.siteId, registerId = param.registerId;
    var seed = Array.from("".concat(siteId, ":").concat(registerId)).reduce(function(total, character) {
        return total + character.charCodeAt(0);
    }, 0);
    var metrics = [
        {
            label: 'CPU',
            value: (seed * 17 + 13) % 101
        },
        {
            label: 'Memory',
            value: (seed * 29 + 31) % 101
        },
        {
            label: 'Disk space',
            value: (seed * 43 + 47) % 101
        }
    ];
    return /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
        className: "store-register-group",
        children: [
            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                className: "store-group-heading",
                children: [
                    /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("span", {
                        children: "RESOURCE UTILIZATION"
                    }, void 0, false, {
                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                        lineNumber: 248,
                        columnNumber: 9
                    }, _this),
                    /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("span", {
                        title: "Green: under 80%. Amber: 80–89%. Red: 90–100%.",
                        children: "80 / 90% LIMITS"
                    }, void 0, false, {
                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                        lineNumber: 249,
                        columnNumber: 9
                    }, _this)
                ]
            }, void 0, true, {
                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                lineNumber: 247,
                columnNumber: 7
            }, _this),
            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                className: "store-utilization-thresholds",
                children: metrics.map(function(param) {
                    var label = param.label, value = param.value;
                    var tone = value >= 90 ? 'down' : value >= 80 ? 'degraded' : 'healthy';
                    return /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                        className: "store-utilization-threshold-row ".concat(tone),
                        children: [
                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                                className: "store-utilization-metric-label",
                                children: [
                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("strong", {
                                        children: label
                                    }, void 0, false, {
                                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                        lineNumber: 258,
                                        columnNumber: 17
                                    }, _this),
                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("span", {
                                        children: [
                                            value,
                                            "%"
                                        ]
                                    }, void 0, true, {
                                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                        lineNumber: 259,
                                        columnNumber: 17
                                    }, _this)
                                ]
                            }, void 0, true, {
                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                lineNumber: 257,
                                columnNumber: 15
                            }, _this),
                            /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
                                className: "store-utilization-track",
                                role: "progressbar",
                                "aria-label": "".concat(label, " utilization (demo)"),
                                "aria-valuemin": 0,
                                "aria-valuemax": 100,
                                "aria-valuenow": value,
                                "aria-valuetext": "".concat(value, "%"),
                                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("span", {
                                    className: "store-utilization-fill",
                                    style: {
                                        width: "".concat(value, "%")
                                    }
                                }, void 0, false, {
                                    fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                    lineNumber: 270,
                                    columnNumber: 17
                                }, _this)
                            }, void 0, false, {
                                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                                lineNumber: 261,
                                columnNumber: 15
                            }, _this)
                        ]
                    }, label, true, {
                        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                        lineNumber: 256,
                        columnNumber: 13
                    }, _this);
                })
            }, void 0, false, {
                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                lineNumber: 251,
                columnNumber: 7
            }, _this)
        ]
    }, void 0, true, {
        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
        lineNumber: 246,
        columnNumber: 5
    }, _this);
};
var UptimeBars = function UptimeBars(param) {
    var history = param.history, registerId = param.registerId, _param_compact = param.compact, compact = _param_compact === void 0 ? false : _param_compact;
    return /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("div", {
        className: "store-uptime-bars".concat(compact ? ' compact' : ''),
        "aria-label": "24-hour uptime for register ".concat(registerId),
        children: history.map(function(up, index) {
            return /*#__PURE__*/ (0,react_jsx_dev_runtime__rspack_import_0.jsxDEV)("span", {
                className: up ? 'healthy' : 'down',
                title: "".concat(24 - index, " hours ago: ").concat(up ? 'Up' : 'Down')
            }, "".concat(registerId, "-").concat(index), false, {
                fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
                lineNumber: 291,
                columnNumber: 7
            }, _this);
        })
    }, void 0, false, {
        fileName: "C:\\Users\\HVenkatachalapathy\\OpenSearch-Dashboards\\plugins\\sample_map\\public\\components\\detail\\DetailPanel.tsx",
        lineNumber: 289,
        columnNumber: 3
    }, _this);
};


},
"./public/hooks/useGenscoMap.ts"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  useGenscoMap: () => (useGenscoMap)
});
/* import */ var _swc_helpers_sliced_to_array__rspack_import_5 = __webpack_require__("../../node_modules/@swc/helpers/esm/_sliced_to_array.js");
/* import */ var react__rspack_import_0 = __webpack_require__("react");
/* import */ var react__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(react__rspack_import_0);
/* import */ var maplibre_gl_dist_maplibre_gl_css__rspack_import_1 = __webpack_require__("./node_modules/maplibre-gl/dist/maplibre-gl.css");
/* import */ var maplibre_gl_dist_maplibre_gl_css__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(maplibre_gl_dist_maplibre_gl_css__rspack_import_1);
/* import */ var maplibre_gl__rspack_import_2 = __webpack_require__("./node_modules/maplibre-gl/dist/maplibre-gl.js");
/* import */ var maplibre_gl__rspack_import_2_default = /*#__PURE__*/__webpack_require__.n(maplibre_gl__rspack_import_2);
/* import */ var _lib_constants__rspack_import_3 = __webpack_require__("./public/lib/constants.ts");
/* import */ var _lib_maplibreMap__rspack_import_4 = __webpack_require__("./public/lib/maplibreMap.ts");






// Pins grow as you zoom in; Down pins are 2x so outages stand out.
var ZOOM_SCALE_STOPS = [
    [
        3,
        1
    ],
    [
        8,
        1.3
    ],
    [
        12,
        1.9
    ],
    [
        16,
        2.6
    ]
];
var getPinScale = function getPinScale(width) {
    return width < 900 ? 0.3 : width < 1400 ? 0.35 : 0.4;
};
var getZoomScale = function getZoomScale(zoom) {
    if (zoom <= ZOOM_SCALE_STOPS[0][0]) return ZOOM_SCALE_STOPS[0][1];
    for(var i = 1; i < ZOOM_SCALE_STOPS.length; i++){
        var _ZOOM_SCALE_STOPS_i = (0,_swc_helpers_sliced_to_array__rspack_import_5._)(ZOOM_SCALE_STOPS[i], 2), upperZoom = _ZOOM_SCALE_STOPS_i[0], upperScale = _ZOOM_SCALE_STOPS_i[1];
        var _ZOOM_SCALE_STOPS_ = (0,_swc_helpers_sliced_to_array__rspack_import_5._)(ZOOM_SCALE_STOPS[i - 1], 2), lowerZoom = _ZOOM_SCALE_STOPS_[0], lowerScale = _ZOOM_SCALE_STOPS_[1];
        if (zoom <= upperZoom) {
            return lowerScale + (zoom - lowerZoom) / (upperZoom - lowerZoom) * (upperScale - lowerScale);
        }
    }
    return ZOOM_SCALE_STOPS[ZOOM_SCALE_STOPS.length - 1][1];
};
var buildTooltipHtml = function buildTooltipHtml(p) {
    var cityStateZip = [
        p.city,
        [
            p.state,
            p.zip
        ].filter(Boolean).join(' ')
    ].filter(Boolean).join(', ');
    var status = String(p.status || 'NoStatus');
    return '<div style="padding:10px 12px;min-width:200px;max-width:260px;font-size:12px;line-height:1.5">' + '<div style="font-weight:700;font-size:13px;margin-bottom:4px">'.concat((0,_lib_constants__rspack_import_3.escapeHtml)(p.name || "Site #".concat(p.siteId)), "</div>") + (p.address ? '<div style="opacity:0.85">'.concat((0,_lib_constants__rspack_import_3.escapeHtml)(p.address), "</div>") : '') + (cityStateZip ? '<div style="opacity:0.85;margin-bottom:6px">'.concat((0,_lib_constants__rspack_import_3.escapeHtml)(cityStateZip), "</div>") : '') + '<div style="display:flex;align-items:center;gap:6px;margin-top:6px">' + '<span style="width:8px;height:8px;border-radius:50%;background:'.concat((0,_lib_constants__rspack_import_3.getColor)(status), ';display:inline-block"></span>') + '<span style="opacity:0.9">'.concat((0,_lib_constants__rspack_import_3.escapeHtml)((0,_lib_constants__rspack_import_3.displayLabel)(status)), "</span>") + "</div></div>";
};
/**
 * MapLibre lifecycle: init, pins, hover/click popups, Down-site pulse,
 * filter/search updates and "reset view". Returns the container ref + counts.
 */ function useGenscoMap(param) {
    var allSites = param.allSites, filteredSites = param.filteredSites, search = param.search, onSelectSite = param.onSelectSite;
    var mapContainerRef = (0,react__rspack_import_0.useRef)(null);
    var mapRef = (0,react__rspack_import_0.useRef)(null);
    var popupRef = (0,react__rspack_import_0.useRef)(null);
    var markersRef = (0,react__rspack_import_0.useRef)(new Map());
    var stickyPopupRef = (0,react__rspack_import_0.useRef)(false);
    var readyRef = (0,react__rspack_import_0.useRef)(false);
    var homeRef = (0,react__rspack_import_0.useRef)(null);
    var fittingRef = (0,react__rspack_import_0.useRef)(false);
    var allRef = (0,react__rspack_import_0.useRef)(allSites);
    allRef.current = allSites;
    var filteredRef = (0,react__rspack_import_0.useRef)(filteredSites);
    filteredRef.current = filteredSites;
    var onSelectRef = (0,react__rspack_import_0.useRef)(onSelectSite);
    onSelectRef.current = onSelectSite;
    var _useState = (0,_swc_helpers_sliced_to_array__rspack_import_5._)((0,react__rspack_import_0.useState)({}), 2), counts = _useState[0], setCounts = _useState[1];
    var _useState1 = (0,_swc_helpers_sliced_to_array__rspack_import_5._)((0,react__rspack_import_0.useState)(false), 2), mapMoved = _useState1[0], setMapMoved = _useState1[1];
    var updateMarkerSizes = function updateMarkerSizes(map) {
        var scale = getPinScale(window.innerWidth) * getZoomScale(map.getZoom());
        markersRef.current.forEach(function(marker) {
            var size = 40 * scale * (marker.getElement().classList.contains('site-pin-down') ? 2 : 1);
            marker.getElement().style.width = "".concat(size, "px");
            marker.getElement().style.height = "".concat(size, "px");
        });
    };
    var showPopup = function showPopup(map, site, sticky) {
        var _popupRef_current;
        (_popupRef_current = popupRef.current) === null || _popupRef_current === void 0 ? void 0 : _popupRef_current.remove();
        stickyPopupRef.current = sticky;
        popupRef.current = new maplibre_gl__rspack_import_2.Popup({
            closeButton: sticky,
            closeOnClick: sticky,
            offset: 14,
            className: 'store-popup'
        }).setLngLat([
            site.lon,
            site.lat
        ]).setHTML(buildTooltipHtml(site)).addTo(map);
    };
    var syncMarkers = function syncMarkers(map, sites) {
        markersRef.current.forEach(function(marker) {
            return marker.remove();
        });
        markersRef.current.clear();
        sites.filter(function(site) {
            return Number.isFinite(site.lat) && Number.isFinite(site.lon);
        }).forEach(function(site) {
            var element = document.createElement('button');
            element.type = 'button';
            element.className = "site-pin ".concat(site.status === 'Down' ? 'site-pin-down' : '');
            element.setAttribute('aria-label', "".concat(site.name, " - ").concat((0,_lib_constants__rspack_import_3.displayLabel)(site.status)));
            element.style.background = 'transparent';
            element.style.border = '0';
            element.style.padding = '0';
            element.style.lineHeight = '0';
            element.innerHTML = (0,_lib_constants__rspack_import_3.pinSvg)(_lib_constants__rspack_import_3.STATUS_COLORS[site.status]);
            element.addEventListener('mouseenter', function() {
                return showPopup(map, site, false);
            });
            element.addEventListener('mouseleave', function() {
                var _popupRef_current;
                if (!stickyPopupRef.current) (_popupRef_current = popupRef.current) === null || _popupRef_current === void 0 ? void 0 : _popupRef_current.remove();
            });
            element.addEventListener('click', function(event) {
                event.stopPropagation();
                showPopup(map, site, true);
                onSelectRef.current(site.siteId);
            });
            markersRef.current.set(site.siteId, new maplibre_gl__rspack_import_2.Marker({
                element: element,
                anchor: 'bottom'
            }).setLngLat([
                site.lon,
                site.lat
            ]).addTo(map));
        });
        updateMarkerSizes(map);
    };
    var fitToSites = function fitToSites(map, sites) {
        var valid = sites.filter(function(s) {
            return Number.isFinite(s.lat) && Number.isFinite(s.lon);
        });
        if (valid.length === 0) return;
        fittingRef.current = true;
        var bounds = new maplibre_gl__rspack_import_2.LngLatBounds([
            valid[0].lon,
            valid[0].lat
        ], [
            valid[0].lon,
            valid[0].lat
        ]);
        valid.slice(1).forEach(function(s) {
            return bounds.extend([
                s.lon,
                s.lat
            ]);
        });
        map.fitBounds(bounds, {
            padding: {
                top: 40,
                bottom: 70,
                left: 40,
                right: 320
            },
            maxZoom: 9,
            animate: false
        });
        homeRef.current = {
            center: map.getCenter().toArray(),
            zoom: map.getZoom()
        };
        setMapMoved(false);
        fittingRef.current = false;
    };
    var resetMapView = function resetMapView() {
        var _popupRef_current;
        var map = mapRef.current;
        if (!map || !homeRef.current) return;
        (_popupRef_current = popupRef.current) === null || _popupRef_current === void 0 ? void 0 : _popupRef_current.remove();
        map.easeTo({
            center: homeRef.current.center,
            zoom: homeRef.current.zoom,
            bearing: 0,
            pitch: 0,
            duration: 500
        });
    };
    /* ── MAP INITIALIZATION ── */ (0,react__rspack_import_0.useEffect)(function() {
        if (!mapContainerRef.current) return;
        var map = (0,_lib_maplibreMap__rspack_import_4.createPluginMap)(mapContainerRef.current);
        mapRef.current = map;
        map.addControl(new maplibre_gl__rspack_import_2.NavigationControl({
            showCompass: true
        }), 'top-left');
        var onResize = function onResize() {
            map.resize();
            updateMarkerSizes(map);
        };
        window.addEventListener('resize', onResize);
        map.on('moveend', function() {
            var home = homeRef.current;
            if (!home || fittingRef.current) return;
            var c = map.getCenter();
            setMapMoved(Math.abs(c.lng - home.center[0]) > 0.05 || Math.abs(c.lat - home.center[1]) > 0.05 || Math.abs(map.getZoom() - home.zoom) > 0.15);
        });
        map.on('load', function() {
            readyRef.current = true;
            syncMarkers(map, filteredRef.current);
            map.on('zoom', function() {
                return updateMarkerSizes(map);
            });
            fitToSites(map, allRef.current);
        });
        return function() {
            var _popupRef_current;
            window.removeEventListener('resize', onResize);
            readyRef.current = false;
            (_popupRef_current = popupRef.current) === null || _popupRef_current === void 0 ? void 0 : _popupRef_current.remove();
            markersRef.current.forEach(function(marker) {
                return marker.remove();
            });
            markersRef.current.clear();
            (0,_lib_maplibreMap__rspack_import_4.destroyPluginMap)(map);
            mapRef.current = null;
        };
    }, []);
    /* ── COUNTS + re-fit when the site list changes ── */ (0,react__rspack_import_0.useEffect)(function() {
        var next = {};
        allSites.forEach(function(s) {
            return next[s.status] = (next[s.status] || 0) + 1;
        });
        setCounts(next);
        if (mapRef.current && readyRef.current) {
            syncMarkers(mapRef.current, filteredRef.current);
            fitToSites(mapRef.current, allSites);
        }
    }, [
        allSites
    ]);
    /* ── FILTER & SEARCH VISIBILITY ── */ (0,react__rspack_import_0.useEffect)(function() {
        var map = mapRef.current;
        if (!map || !readyRef.current) return;
        syncMarkers(map, filteredSites);
        if (search.trim() !== '' && filteredSites.length === 1) {
            var s = filteredSites[0];
            map.easeTo({
                center: [
                    s.lon,
                    s.lat
                ],
                zoom: Math.max(map.getZoom(), 10),
                duration: 600
            });
        }
    }, [
        filteredSites,
        search
    ]);
    return {
        mapContainerRef: mapContainerRef,
        counts: counts,
        mapMoved: mapMoved,
        resetMapView: resetMapView
    };
}


},
"./public/lib/constants.ts"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  CFG: () => (CFG),
  METRICS: () => (METRICS),
  SEVERITY_COLORS: () => (SEVERITY_COLORS),
  STATUS_COLORS: () => (STATUS_COLORS),
  displayLabel: () => (displayLabel),
  escapeHtml: () => (escapeHtml),
  getColor: () => (getColor),
  pinSvg: () => (pinSvg),
  svcColor: () => (svcColor)
});
/* ================================================================
   CONFIGURATION, METRIC NAMES & STYLING MAPS
   ================================================================ */ var CFG = {
    /** One document per site: site_id, name, address, city, state, zip, lat, lon. */ sitesIndex: 'gensco-sites',
    /** Log documents: @timestamp, site_id, severity, service, message. */ logsIndex: 'gensco-logs',
    logsTimeField: '@timestamp',
    logsPageSize: 200,
    mapCenter: [
        -120.5,
        46.5
    ],
    mapZoom: 5,
    tileUrl: 'https://tiles.maps.opensearch.org/tiles/{z}/{x}/{y}.png',
    /** CPU/memory % at or above this marks a site as Warning. */ resourceWarnPct: 90,
    /** Window for "latest value" lookups; large enough that seeded (non-live) demo samples still count. */ instantLookback: '6h'
};
/** VictoriaMetrics series read by the plugin (all carry a `site` label). */ var METRICS = {
    siteUp: 'gensco_site_up',
    serviceUp: 'gensco_service_up',
    cpu: 'gensco_cpu_percent',
    memory: 'gensco_memory_percent'
};
/** Map-pin / badge colors per site status. */ var STATUS_COLORS = {
    Up: '#4f9d69',
    Down: '#ef4444',
    Warning: '#e0a030',
    'Registers Down': '#ec4899',
    'EOD / Maintenance': '#a855f7',
    NoStatus: '#94a3b8'
};
var getColor = function getColor(s) {
    return STATUS_COLORS[s] || STATUS_COLORS.NoStatus;
};
var displayLabel = function displayLabel(s) {
    if (s === 'NoStatus') return 'No Status';
    if (s === 'Down') return 'App Services Down';
    if (s === 'Warning') return 'Attention Required';
    return s;
};
var svcColor = function svcColor(up) {
    return up === true ? '#22c55e' : up === false ? '#ef4444' : '#9ca3af';
};
var SEVERITY_COLORS = {
    ERROR: '#ef4444',
    WARN: '#e0a030',
    INFO: '#60a5fa',
    DEBUG: '#94a3b8'
};
var pinSvg = function pinSvg(color) {
    var size = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 40;
    return [
        '<svg xmlns="http://www.w3.org/2000/svg" width="'.concat(size, '" height="').concat(size, '" viewBox="-10 -10 20 20" style="overflow:visible">'),
        '<path d="M0,-10 C-4,-10 -7,-7 -7,-3 C-7,3 0,10 0,10 S7,3 7,-3 C7,-7 4,-10 0,-10 Z M0,-5 C-1.5,-5 -3,-3.5 -3,-2 C-3,-0.5 -1.5,1 0,1 C1.5,1 3,-0.5 3,-2 C3,-3.5 1.5,-5 0,-5 Z" fill="'.concat(color, '" fill-rule="evenodd" stroke="white" stroke-width="0.8"/>'),
        '</svg>'
    ].join('');
};
var escapeHtml = function escapeHtml(value) {
    return String(value !== null && value !== void 0 ? value : '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
};


},
"./public/lib/envConfig.ts"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  setOsdBasePath: () => (setOsdBasePath),
  vmFetch: () => (vmFetch),
  vmUrl: () => (vmUrl)
});
/* import */ var _swc_helpers_sliced_to_array__rspack_import_1 = __webpack_require__("../../node_modules/@swc/helpers/esm/_sliced_to_array.js");
/* import */ var _common__rspack_import_0 = __webpack_require__("./common/index.ts");


// OSD server base path ('' with --no-base-path). Set once at mount.
var osdBasePath = '';
var setOsdBasePath = function setOsdBasePath(basePath) {
    osdBasePath = (basePath || '').replace(/\/+$/, '');
};
/** Same-origin URL of the plugin's VictoriaMetrics proxy (`query` or `query_range`). */ var vmUrl = function vmUrl(api, params) {
    var qs = new URLSearchParams();
    Object.entries(params).forEach(function(param) {
        var _param = (0,_swc_helpers_sliced_to_array__rspack_import_1._)(param, 2), k = _param[0], v = _param[1];
        return qs.set(k, String(v));
    });
    return "".concat(osdBasePath).concat(_common__rspack_import_0.VM_PROXY_BASE, "/").concat(api, "?").concat(qs.toString());
};
/** Fetches through the OSD proxy with the session cookie + xsrf header; null on network failure. */ var vmFetch = function vmFetch(url) {
    return fetch(url, {
        credentials: 'same-origin',
        headers: {
            'osd-xsrf': 'true'
        }
    }).catch(function() {
        return null;
    });
};


},
"./public/lib/maplibreMap.ts"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  MAP_STYLE: () => (MAP_STYLE),
  createPluginMap: () => (createPluginMap),
  destroyPluginMap: () => (destroyPluginMap)
});
/* import */ var maplibre_gl__rspack_import_0 = __webpack_require__("./node_modules/maplibre-gl/dist/maplibre-gl.js");
/* import */ var maplibre_gl__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(maplibre_gl__rspack_import_0);
/* import */ var _constants__rspack_import_1 = __webpack_require__("./public/lib/constants.ts");


// Chrome blocks WebGL after context-loss when MapLibre 5 asks for "high-performance".
var MAP_CANVAS_CONTEXT_ATTRIBUTES = {
    antialias: false,
    alpha: true,
    depth: true,
    stencil: true,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    failIfMajorPerformanceCaveat: false,
    powerPreference: 'default'
};
/** Raster base map (same tile source + water color as the other map apps). */ var MAP_STYLE = {
    version: 8,
    sources: {
        base: {
            type: 'raster',
            tiles: [
                _constants__rspack_import_1.CFG.tileUrl
            ],
            tileSize: 256,
            attribution: 'Map data &copy; OpenSearch Maps contributors'
        }
    },
    layers: [
        {
            id: 'base-tiles',
            type: 'raster',
            source: 'base'
        }
    ]
};
function createPluginMap(container) {
    return new maplibre_gl__rspack_import_0.Map({
        container: container,
        center: _constants__rspack_import_1.CFG.mapCenter,
        zoom: _constants__rspack_import_1.CFG.mapZoom,
        style: MAP_STYLE,
        canvasContextAttributes: MAP_CANVAS_CONTEXT_ATTRIBUTES,
        maxTileCacheSize: 80
    });
}
function destroyPluginMap(mapInstance) {
    if (!mapInstance) return;
    try {
        mapInstance.remove();
    } catch (unused) {
    /* already removed / context lost */ }
}


},
"./public/lib/sampleData.ts"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  DASHBOARD_DEMO_SITE: () => (DASHBOARD_DEMO_SITE),
  SAMPLE_SERVICES: () => (SAMPLE_SERVICES),
  SAMPLE_SITES: () => (SAMPLE_SITES),
  sampleHealth: () => (sampleHealth),
  sampleLogs: () => (sampleLogs),
  sampleSeries: () => (sampleSeries)
});
/* import */ var _swc_helpers_sliced_to_array__rspack_import_1 = __webpack_require__("../../node_modules/@swc/helpers/esm/_sliced_to_array.js");
/* import */ var _constants__rspack_import_0 = __webpack_require__("./public/lib/constants.ts");

/* ================================================================
   BUILT-IN SAMPLE DATA
   Used only when the real sources return nothing (index missing,
   VictoriaMetrics unreachable / no series), so the demo always renders.
   Keep SAMPLE_SITES in sync with sample-data/gensco-sites.json.
   ================================================================ */ 
var SAMPLE_DOWN_SITE_IDS = new Set([
    '0340',
    '1040'
]);
var SAMPLE_REGISTERS_DOWN_SITE_IDS = new Set([
    '1468'
]);
var SAMPLE_WARNING_SITE_IDS = new Set([
    '0303',
    '1005',
    '1141'
]);
var SAMPLE_MAINTENANCE_SITE_IDS = new Set([
    '0096',
    '1250',
    '1493',
    '1665',
    '1690'
]);
var DASHBOARD_DEMO_SITE = {
    siteId: '9001',
    name: 'Dashboard Demo Store #9001 - Tacoma',
    address: '900 Dashboard Demo Way',
    city: 'Tacoma',
    state: 'WA',
    zip: '98402',
    lat: 47.245,
    lon: -122.43
};
var SAMPLE_SITES = [
    {
        "siteId": "0096",
        "name": "Store #0096 - Seattle (DEMO)",
        "address": "Demo location - not a real store address",
        "city": "Seattle",
        "state": "WA",
        "zip": "98101",
        "lat": 47.6062,
        "lon": -122.3321
    },
    {
        "siteId": "0303",
        "name": "Store #0303 - Portland (DEMO)",
        "address": "Demo location - not a real store address",
        "city": "Portland",
        "state": "OR",
        "zip": "97204",
        "lat": 45.5152,
        "lon": -122.6784
    },
    {
        "siteId": "0340",
        "name": "Store #0340 - San Francisco (DEMO)",
        "address": "Demo location - not a real store address",
        "city": "San Francisco",
        "state": "CA",
        "zip": "94103",
        "lat": 37.7749,
        "lon": -122.4194
    },
    {
        "siteId": "1005",
        "name": "Store #1005 - Los Angeles (DEMO)",
        "address": "Demo location - not a real store address",
        "city": "Los Angeles",
        "state": "CA",
        "zip": "90012",
        "lat": 34.0522,
        "lon": -118.2437
    },
    {
        "siteId": "1040",
        "name": "Store #1040 - San Diego (DEMO)",
        "address": "Demo location - not a real store address",
        "city": "San Diego",
        "state": "CA",
        "zip": "92101",
        "lat": 32.7157,
        "lon": -117.1611
    },
    {
        "siteId": "1141",
        "name": "Store #1141 - Phoenix (DEMO)",
        "address": "Demo location - not a real store address",
        "city": "Phoenix",
        "state": "AZ",
        "zip": "85004",
        "lat": 33.4484,
        "lon": -112.074
    },
    {
        "siteId": "1250",
        "name": "Store #1250 - Las Vegas (DEMO)",
        "address": "Demo location - not a real store address",
        "city": "Las Vegas",
        "state": "NV",
        "zip": "89101",
        "lat": 36.1699,
        "lon": -115.1398
    },
    {
        "siteId": "1461",
        "name": "Store #1461 - Salt Lake City (DEMO)",
        "address": "Demo location - not a real store address",
        "city": "Salt Lake City",
        "state": "UT",
        "zip": "84101",
        "lat": 40.7608,
        "lon": -111.891
    },
    {
        "siteId": "1468",
        "name": "Store #1468 - Denver (DEMO)",
        "address": "Demo location - not a real store address",
        "city": "Denver",
        "state": "CO",
        "zip": "80202",
        "lat": 39.7392,
        "lon": -104.9903
    },
    {
        "siteId": "1493",
        "name": "Store #1493 - Albuquerque (DEMO)",
        "address": "Demo location - not a real store address",
        "city": "Albuquerque",
        "state": "NM",
        "zip": "87102",
        "lat": 35.0844,
        "lon": -106.6504
    },
    {
        "siteId": "1508",
        "name": "Store #1508 - Boise (DEMO)",
        "address": "Demo location - not a real store address",
        "city": "Boise",
        "state": "ID",
        "zip": "83702",
        "lat": 43.615,
        "lon": -116.2023
    },
    {
        "siteId": "1665",
        "name": "Store #1665 - Billings (DEMO)",
        "address": "Demo location - not a real store address",
        "city": "Billings",
        "state": "MT",
        "zip": "59101",
        "lat": 45.7833,
        "lon": -108.5007
    },
    {
        "siteId": "1690",
        "name": "Store #1690 - Cheyenne (DEMO)",
        "address": "Demo location - not a real store address",
        "city": "Cheyenne",
        "state": "WY",
        "zip": "82001",
        "lat": 41.14,
        "lon": -104.8202
    },
    {
        "siteId": "1715",
        "name": "Store #1715 - Dallas (DEMO)",
        "address": "Demo location - not a real store address",
        "city": "Dallas",
        "state": "TX",
        "zip": "75201",
        "lat": 32.7767,
        "lon": -96.797
    },
    {
        "siteId": "1726",
        "name": "Store #1726 - Austin (DEMO)",
        "address": "Demo location - not a real store address",
        "city": "Austin",
        "state": "TX",
        "zip": "78701",
        "lat": 30.2672,
        "lon": -97.7431
    },
    {
        "siteId": "1733",
        "name": "Store #1733 - Houston (DEMO)",
        "address": "Demo location - not a real store address",
        "city": "Houston",
        "state": "TX",
        "zip": "77002",
        "lat": 29.7604,
        "lon": -95.3698
    },
    {
        "siteId": "1804",
        "name": "Store #1804 - Oklahoma City (DEMO)",
        "address": "Demo location - not a real store address",
        "city": "Oklahoma City",
        "state": "OK",
        "zip": "73102",
        "lat": 35.4676,
        "lon": -97.5164
    },
    {
        "siteId": "1855",
        "name": "Store #1855 - Kansas City (DEMO)",
        "address": "Demo location - not a real store address",
        "city": "Kansas City",
        "state": "MO",
        "zip": "64106",
        "lat": 39.0997,
        "lon": -94.5786
    },
    {
        "siteId": "1885",
        "name": "Store #1885 - Omaha (DEMO)",
        "address": "Demo location - not a real store address",
        "city": "Omaha",
        "state": "NE",
        "zip": "68102",
        "lat": 41.2565,
        "lon": -95.9345
    },
    {
        "siteId": "2001",
        "name": "Store #2001 - Minneapolis (DEMO)",
        "address": "Demo location - not a real store address",
        "city": "Minneapolis",
        "state": "MN",
        "zip": "55401",
        "lat": 44.9778,
        "lon": -93.265
    },
    {
        "siteId": "2079",
        "name": "Store #2079 - Des Moines (DEMO)",
        "address": "Demo location - not a real store address",
        "city": "Des Moines",
        "state": "IA",
        "zip": "50309",
        "lat": 41.5868,
        "lon": -93.625
    },
    {
        "siteId": "2088",
        "name": "Store #2088 - Chicago (DEMO)",
        "address": "Demo location - not a real store address",
        "city": "Chicago",
        "state": "IL",
        "zip": "60601",
        "lat": 41.8781,
        "lon": -87.6298
    },
    {
        "siteId": "3501",
        "name": "Store #3501 - Indianapolis (DEMO)",
        "address": "Demo location - not a real store address",
        "city": "Indianapolis",
        "state": "IN",
        "zip": "46204",
        "lat": 39.7684,
        "lon": -86.1581
    },
    {
        "siteId": "5004",
        "name": "Store #5004 - Detroit (DEMO)",
        "address": "Demo location - not a real store address",
        "city": "Detroit",
        "state": "MI",
        "zip": "48226",
        "lat": 42.3314,
        "lon": -83.0458
    },
    {
        "siteId": "5012",
        "name": "Store #5012 - Columbus (DEMO)",
        "address": "Demo location - not a real store address",
        "city": "Columbus",
        "state": "OH",
        "zip": "43215",
        "lat": 39.9612,
        "lon": -82.9988
    },
    {
        "siteId": "6200",
        "name": "Store #6200 - Nashville (DEMO)",
        "address": "Demo location - not a real store address",
        "city": "Nashville",
        "state": "TN",
        "zip": "37219",
        "lat": 36.1627,
        "lon": -86.7816
    },
    {
        "siteId": "6237",
        "name": "Store #6237 - Louisville (DEMO)",
        "address": "Demo location - not a real store address",
        "city": "Louisville",
        "state": "KY",
        "zip": "40202",
        "lat": 38.2527,
        "lon": -85.7585
    },
    {
        "siteId": "6247",
        "name": "Store #6247 - Birmingham (DEMO)",
        "address": "Demo location - not a real store address",
        "city": "Birmingham",
        "state": "AL",
        "zip": "35203",
        "lat": 33.5186,
        "lon": -86.8104
    },
    {
        "siteId": "6270",
        "name": "Store #6270 - Atlanta (DEMO)",
        "address": "Demo location - not a real store address",
        "city": "Atlanta",
        "state": "GA",
        "zip": "30303",
        "lat": 33.749,
        "lon": -84.388
    },
    {
        "siteId": "7140",
        "name": "Store #7140 - Jacksonville (DEMO)",
        "address": "Demo location - not a real store address",
        "city": "Jacksonville",
        "state": "FL",
        "zip": "32202",
        "lat": 30.3322,
        "lon": -81.6557
    }
];
var SAMPLE_SERVICES = [
    'pos',
    'inventory',
    'sync',
    'printer'
];
/** Deterministic 0..1 from a string seed. */ var hash01 = function hash01(seed) {
    var h = 2166136261;
    for(var i = 0; i < seed.length; i++)h = Math.imul(h ^ seed.charCodeAt(i), 16777619) >>> 0;
    return h % 10000 / 10000;
};
/** Sample map health includes demo examples for each status category. */ var sampleHealth = function sampleHealth(siteId) {
    var down = SAMPLE_DOWN_SITE_IDS.has(siteId);
    var registersDown = SAMPLE_REGISTERS_DOWN_SITE_IDS.has(siteId);
    var warning = SAMPLE_WARNING_SITE_IDS.has(siteId);
    var services = {};
    SAMPLE_SERVICES.forEach(function(svc) {
        services[svc] = !down && !(warning && svc === 'printer');
    });
    return {
        up: !down,
        services: services,
        cpu: down ? null : warning ? 94 : Math.round(20 + hash01(siteId + 'cpu') * 40),
        memory: down ? null : Math.round(35 + hash01(siteId + 'mem') * 35),
        registersDown: registersDown,
        maintenance: SAMPLE_MAINTENANCE_SITE_IDS.has(siteId)
    };
};
/** Smooth-ish synthetic series between `base` and `base+amp`. */ var sampleSeries = function sampleSeries(siteId, metric, win, stepSec, base, amp) {
    if (SAMPLE_DOWN_SITE_IDS.has(siteId)) return [];
    var seed = hash01(siteId + metric) * 10;
    var points = [];
    for(var t = win.fromMs; t <= win.toMs; t += stepSec * 1000){
        var x = t / 600000 + seed;
        var v = base + amp * (0.5 + 0.35 * Math.sin(x) + 0.15 * Math.sin(x * 3.7));
        points.push({
            t: t,
            v: Math.round(v * 10) / 10
        });
    }
    return points;
};
var SAMPLE_MESSAGES = [
    [
        'INFO',
        'pos',
        'Transaction batch uploaded successfully'
    ],
    [
        'INFO',
        'sync',
        'Inventory sync completed in 4.2s'
    ],
    [
        'WARN',
        'printer',
        'Label printer paper low'
    ],
    [
        'ERROR',
        'printer',
        'Label printer not responding (timeout after 30s)'
    ],
    [
        'INFO',
        'inventory',
        'Stock levels refreshed for 1,284 SKUs'
    ],
    [
        'WARN',
        'sync',
        'Sync retry 1/3 - upstream returned 503'
    ],
    [
        'ERROR',
        'pos',
        'Payment terminal handshake failed'
    ],
    [
        'DEBUG',
        'inventory',
        'Cache warm-up finished'
    ]
];
/** ~40 synthetic log lines spread across the window, newest first. */ var sampleLogs = function sampleLogs(siteId, win) {
    var count = 40;
    var span = Math.max(1, win.toMs - win.fromMs);
    var logs = [];
    for(var i = 0; i < count; i++){
        var pick = Math.floor(hash01("".concat(siteId, "-").concat(i)) * SAMPLE_MESSAGES.length);
        var _SAMPLE_MESSAGES_pick = (0,_swc_helpers_sliced_to_array__rspack_import_1._)(SAMPLE_MESSAGES[pick], 3), severity = _SAMPLE_MESSAGES_pick[0], service = _SAMPLE_MESSAGES_pick[1], message = _SAMPLE_MESSAGES_pick[2];
        logs.push({
            time: new Date(win.toMs - Math.floor(i / count * span)).toISOString(),
            severity: severity,
            service: service,
            message: message
        });
    }
    return logs.slice(0, _constants__rspack_import_0.CFG.logsPageSize);
};


},
"./public/services/searchClient.ts"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  createOsSearch: () => (createOsSearch)
});
/* import */ var _swc_helpers_async_to_generator__rspack_import_0 = __webpack_require__("../../node_modules/@swc/helpers/esm/_async_to_generator.js");
/* import */ var _swc_helpers_ts_generator__rspack_import_1 = __webpack_require__("../../node_modules/@swc/helpers/esm/_ts_generator.js");


/** All OpenSearch reads go through the data plugin's search route (uses the user's session). */ var createOsSearch = function createOsSearch(http) {
    return function(index, queryBody) {
        return (0,_swc_helpers_async_to_generator__rspack_import_0._)(function() {
            var res;
            return (0,_swc_helpers_ts_generator__rspack_import_1._)(this, function(_state) {
                switch(_state.label){
                    case 0:
                        return [
                            4,
                            http.post('/internal/search/opensearch', {
                                body: JSON.stringify({
                                    params: {
                                        index: index,
                                        body: queryBody
                                    }
                                })
                            })
                        ];
                    case 1:
                        res = _state.sent();
                        return [
                            2,
                            res.rawResponse || res
                        ];
                }
            });
        })();
    };
};


},
"./public/services/siteService.ts"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  buildSiteRecords: () => (buildSiteRecords),
  deriveStatus: () => (deriveStatus),
  fetchAllSiteHealth: () => (fetchAllSiteHealth),
  fetchSiteLocations: () => (fetchSiteLocations)
});
/* import */ var _swc_helpers_async_to_generator__rspack_import_3 = __webpack_require__("../../node_modules/@swc/helpers/esm/_async_to_generator.js");
/* import */ var _swc_helpers_object_spread__rspack_import_8 = __webpack_require__("../../node_modules/@swc/helpers/esm/_object_spread.js");
/* import */ var _swc_helpers_object_spread_props__rspack_import_7 = __webpack_require__("../../node_modules/@swc/helpers/esm/_object_spread_props.js");
/* import */ var _swc_helpers_sliced_to_array__rspack_import_6 = __webpack_require__("../../node_modules/@swc/helpers/esm/_sliced_to_array.js");
/* import */ var _swc_helpers_to_consumable_array__rspack_import_5 = __webpack_require__("../../node_modules/@swc/helpers/esm/_to_consumable_array.js");
/* import */ var _swc_helpers_ts_generator__rspack_import_4 = __webpack_require__("../../node_modules/@swc/helpers/esm/_ts_generator.js");
/* import */ var _lib_constants__rspack_import_0 = __webpack_require__("./public/lib/constants.ts");
/* import */ var _lib_sampleData__rspack_import_1 = __webpack_require__("./public/lib/sampleData.ts");
/* import */ var _victoriaMetrics__rspack_import_2 = __webpack_require__("./public/services/victoriaMetrics.ts");






/* ================================================================
   SITE LIST + STATUS (MAP VIEW)
   Locations come from OpenSearch, live health from VictoriaMetrics.
   ================================================================ */ 


/** Reads site documents. Falls back to SAMPLE_SITES when the index is missing or empty. */ var fetchSiteLocations = function fetchSiteLocations(osSearch) {
    return (0,_swc_helpers_async_to_generator__rspack_import_3._)(function() {
        var _data_hits, data, sites, siteIds, missingSampleSites, e;
        return (0,_swc_helpers_ts_generator__rspack_import_4._)(this, function(_state) {
            switch(_state.label){
                case 0:
                    _state.trys.push([
                        0,
                        2,
                        ,
                        3
                    ]);
                    return [
                        4,
                        osSearch(_lib_constants__rspack_import_0.CFG.sitesIndex, {
                            size: 10000,
                            query: {
                                match_all: {}
                            }
                        })
                    ];
                case 1:
                    data = _state.sent();
                    sites = (((_data_hits = data.hits) === null || _data_hits === void 0 ? void 0 : _data_hits.hits) || []).map(function(h) {
                        return h._source || {};
                    }).map(function(s) {
                        var _s_site_id, _s_name, _s_address, _s_city, _s_state, _s_zip;
                        return {
                            siteId: String((_s_site_id = s.site_id) !== null && _s_site_id !== void 0 ? _s_site_id : ''),
                            name: String((_s_name = s.name) !== null && _s_name !== void 0 ? _s_name : "Site #".concat(s.site_id)),
                            address: String((_s_address = s.address) !== null && _s_address !== void 0 ? _s_address : ''),
                            city: String((_s_city = s.city) !== null && _s_city !== void 0 ? _s_city : ''),
                            state: String((_s_state = s.state) !== null && _s_state !== void 0 ? _s_state : ''),
                            zip: String((_s_zip = s.zip) !== null && _s_zip !== void 0 ? _s_zip : ''),
                            lat: Number(s.lat),
                            lon: Number(s.lon)
                        };
                    }).filter(function(s) {
                        return s.siteId && Number.isFinite(s.lat) && Number.isFinite(s.lon);
                    });
                    if (sites.length > 0) {
                        siteIds = new Set(sites.map(function(site) {
                            return site.siteId;
                        }));
                        missingSampleSites = _lib_sampleData__rspack_import_1.SAMPLE_SITES.filter(function(site) {
                            return !siteIds.has(site.siteId);
                        });
                        return [
                            2,
                            {
                                sites: (0,_swc_helpers_to_consumable_array__rspack_import_5._)(sites).concat((0,_swc_helpers_to_consumable_array__rspack_import_5._)(missingSampleSites)),
                                sample: missingSampleSites.length > 0
                            }
                        ];
                    }
                    return [
                        3,
                        3
                    ];
                case 2:
                    e = _state.sent();
                    console.warn("[sample_map] ".concat(_lib_constants__rspack_import_0.CFG.sitesIndex, " not readable, using sample sites"), e);
                    return [
                        3,
                        3
                    ];
                case 3:
                    return [
                        2,
                        {
                            sites: _lib_sampleData__rspack_import_1.SAMPLE_SITES,
                            sample: true
                        }
                    ];
            }
        });
    })();
};
/**
 * Latest health for every site in 4 instant queries (one per metric).
 * Returns an empty map when VictoriaMetrics has no `gensco_*` series.
 */ var fetchAllSiteHealth = function fetchAllSiteHealth() {
    return (0,_swc_helpers_async_to_generator__rspack_import_3._)(function() {
        var latest, _ref, upRows, svcRows, cpuRows, memRows, map, get;
        return (0,_swc_helpers_ts_generator__rspack_import_4._)(this, function(_state) {
            switch(_state.label){
                case 0:
                    latest = function latest(metric) {
                        return (0,_victoriaMetrics__rspack_import_2.instantQuery)("last_over_time(".concat(metric, "[").concat(_lib_constants__rspack_import_0.CFG.instantLookback, "])"));
                    };
                    return [
                        4,
                        Promise.all([
                            latest(_lib_constants__rspack_import_0.METRICS.siteUp),
                            latest(_lib_constants__rspack_import_0.METRICS.serviceUp),
                            latest(_lib_constants__rspack_import_0.METRICS.cpu),
                            latest(_lib_constants__rspack_import_0.METRICS.memory)
                        ])
                    ];
                case 1:
                    _ref = _swc_helpers_sliced_to_array__rspack_import_6._.apply(void 0, [
                        _state.sent(),
                        4
                    ]), upRows = _ref[0], svcRows = _ref[1], cpuRows = _ref[2], memRows = _ref[3];
                    map = new Map();
                    get = function get(site) {
                        if (!map.has(site)) map.set(site, {
                            up: null,
                            services: {},
                            cpu: null,
                            memory: null
                        });
                        return map.get(site);
                    };
                    upRows.forEach(function(r) {
                        var _r_value;
                        return r.metric.site && (get(r.metric.site).up = Number((_r_value = r.value) === null || _r_value === void 0 ? void 0 : _r_value[1]) > 0);
                    });
                    svcRows.forEach(function(r) {
                        if (r.metric.site && r.metric.service) {
                            var _r_value;
                            get(r.metric.site).services[r.metric.service] = Number((_r_value = r.value) === null || _r_value === void 0 ? void 0 : _r_value[1]) > 0;
                        }
                    });
                    cpuRows.forEach(function(r) {
                        var _r_value;
                        return r.metric.site && (get(r.metric.site).cpu = Number((_r_value = r.value) === null || _r_value === void 0 ? void 0 : _r_value[1]));
                    });
                    memRows.forEach(function(r) {
                        var _r_value;
                        return r.metric.site && (get(r.metric.site).memory = Number((_r_value = r.value) === null || _r_value === void 0 ? void 0 : _r_value[1]));
                    });
                    return [
                        2,
                        map
                    ];
            }
        });
    })();
};
/** Host outage takes precedence over maintenance, register outage, and resource warnings. */ var deriveStatus = function deriveStatus(h) {
    var _h_cpu, _h_memory;
    if (!h || h.up === null) return 'NoStatus';
    if (!h.up) return 'Down';
    if (h.maintenance) return 'EOD / Maintenance';
    if (h.registersDown) return 'Registers Down';
    var anyServiceDown = Object.values(h.services).some(function(v) {
        return !v;
    });
    var hot = ((_h_cpu = h.cpu) !== null && _h_cpu !== void 0 ? _h_cpu : 0) >= _lib_constants__rspack_import_0.CFG.resourceWarnPct || ((_h_memory = h.memory) !== null && _h_memory !== void 0 ? _h_memory : 0) >= _lib_constants__rspack_import_0.CFG.resourceWarnPct;
    return anyServiceDown || hot ? 'Warning' : 'Up';
};
/** Joins locations + health. When VM returned nothing at all, sample health is used instead. */ var buildSiteRecords = function buildSiteRecords(sites, health) {
    var sampleMetrics = health.size === 0;
    var records = sites.map(function(s) {
        var liveHealth = health.get(s.siteId);
        var h = sampleMetrics || s.siteId === _lib_sampleData__rspack_import_1.DASHBOARD_DEMO_SITE.siteId && !liveHealth ? (0,_lib_sampleData__rspack_import_1.sampleHealth)(s.siteId) : liveHealth || {
            up: null,
            services: {},
            cpu: null,
            memory: null
        };
        return (0,_swc_helpers_object_spread_props__rspack_import_7._)((0,_swc_helpers_object_spread__rspack_import_8._)({}, s), {
            health: h,
            status: deriveStatus(h)
        });
    });
    return {
        records: records,
        sampleMetrics: sampleMetrics
    };
};


},
"./public/services/victoriaMetrics.ts"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  instantQuery: () => (instantQuery),
  rangeQuery: () => (rangeQuery),
  toPoints: () => (toPoints)
});
/* import */ var _swc_helpers_async_to_generator__rspack_import_1 = __webpack_require__("../../node_modules/@swc/helpers/esm/_async_to_generator.js");
/* import */ var _swc_helpers_sliced_to_array__rspack_import_3 = __webpack_require__("../../node_modules/@swc/helpers/esm/_sliced_to_array.js");
/* import */ var _swc_helpers_ts_generator__rspack_import_2 = __webpack_require__("../../node_modules/@swc/helpers/esm/_ts_generator.js");
/* import */ var _lib_envConfig__rspack_import_0 = __webpack_require__("./public/lib/envConfig.ts");



/* ================================================================
   VICTORIAMETRICS (Prometheus API) HELPERS
   ================================================================ */ 
var readResult = function readResult(res) {
    return (0,_swc_helpers_async_to_generator__rspack_import_1._)(function() {
        var _json_data, json;
        return (0,_swc_helpers_ts_generator__rspack_import_2._)(this, function(_state) {
            switch(_state.label){
                case 0:
                    if (!res || !res.ok) return [
                        2,
                        []
                    ];
                    return [
                        4,
                        res.json().catch(function() {
                            return null;
                        })
                    ];
                case 1:
                    json = _state.sent();
                    return [
                        2,
                        (json === null || json === void 0 ? void 0 : json.status) === 'success' ? ((_json_data = json.data) === null || _json_data === void 0 ? void 0 : _json_data.result) || [] : []
                    ];
            }
        });
    })();
};
/** Latest value per series. Returns [] on any failure. */ var instantQuery = function instantQuery(query) {
    return (0,_swc_helpers_async_to_generator__rspack_import_1._)(function() {
        return (0,_swc_helpers_ts_generator__rspack_import_2._)(this, function(_state) {
            switch(_state.label){
                case 0:
                    return [
                        4,
                        (0,_lib_envConfig__rspack_import_0.vmFetch)((0,_lib_envConfig__rspack_import_0.vmUrl)('query', {
                            query: query
                        }))
                    ];
                case 1:
                    return [
                        2,
                        readResult.apply(void 0, [
                            _state.sent()
                        ])
                    ];
            }
        });
    })();
};
/** Range query over the window. Returns [] on any failure. */ var rangeQuery = function rangeQuery(query, win, stepSec) {
    return (0,_swc_helpers_async_to_generator__rspack_import_1._)(function() {
        return (0,_swc_helpers_ts_generator__rspack_import_2._)(this, function(_state) {
            switch(_state.label){
                case 0:
                    return [
                        4,
                        (0,_lib_envConfig__rspack_import_0.vmFetch)((0,_lib_envConfig__rspack_import_0.vmUrl)('query_range', {
                            query: query,
                            start: Math.floor(win.fromMs / 1000),
                            end: Math.floor(win.toMs / 1000),
                            step: "".concat(stepSec, "s")
                        }))
                    ];
                case 1:
                    return [
                        2,
                        readResult.apply(void 0, [
                            _state.sent()
                        ])
                    ];
            }
        });
    })();
};
/** First series of a range result as chart points. */ var toPoints = function toPoints(rows) {
    var _rows_;
    return (((_rows_ = rows[0]) === null || _rows_ === void 0 ? void 0 : _rows_.values) || []).map(function(param) {
        var _param = (0,_swc_helpers_sliced_to_array__rspack_import_3._)(param, 2), ts = _param[0], v = _param[1];
        return {
            t: ts * 1000,
            v: Number(v)
        };
    });
};


},
"./sample-data/store-dashboard-by-store.json"(module) {
module.exports = /*#__PURE__*/JSON.parse('{"0096":{"lastRefreshed":"2026-10-15T10:00:00-05:00","storeMode":"Registers-only store","notice":"Synthetic demonstration data. Register identifiers and IPs supplied; locations and health are illustrative only.","storeHealth":96,"registers":[{"id":1,"host":"awsd0096r01","ip":"10.188.80.68","uptime":"16d 16h 12m","lastBoot":"Sep 28, 09:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":16649},{"name":"xstore_mobile","status":"Up","pid":15155},{"name":"xstore-wrapper","status":"Up","pid":18898},{"name":"xstore_mobile-wrapper","status":"Up","pid":5587},{"name":"xenv_ui","status":"Up","pid":20307},{"name":"xenv_eng","status":"Up","pid":7579}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":2,"host":"awsd0096r02","ip":"10.188.80.69","uptime":"17d 20h 16m","lastBoot":"Sep 27, 23:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":16494},{"name":"xstore_mobile","status":"Up","pid":7891},{"name":"xstore-wrapper","status":"Up","pid":16052},{"name":"xstore_mobile-wrapper","status":"Up","pid":1028},{"name":"xenv_ui","status":"Up","pid":17903},{"name":"xenv_eng","status":"Up","pid":25684}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":3,"host":"awsd0096r03","ip":"10.188.80.70","uptime":"16d 16h 12m","lastBoot":"Sep 28, 09:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":19649},{"name":"xstore_mobile","status":"Up","pid":18155},{"name":"xstore-wrapper","status":"Up","pid":21898},{"name":"xstore_mobile-wrapper","status":"Up","pid":8587},{"name":"xenv_ui","status":"Up","pid":23307},{"name":"xenv_eng","status":"Up","pid":10579}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":4,"host":"awsd0096r04","ip":"10.188.80.71","uptime":"16d 16h 12m","lastBoot":"Sep 28, 09:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":20649},{"name":"xstore_mobile","status":"Up","pid":19155},{"name":"xstore-wrapper","status":"Up","pid":22898},{"name":"xstore_mobile-wrapper","status":"Up","pid":9587},{"name":"xenv_ui","status":"Up","pid":24307},{"name":"xenv_eng","status":"Up","pid":11579}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":5,"host":"awsd0096r05","ip":"10.188.80.72","uptime":"16d 16h 12m","lastBoot":"Sep 28, 09:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":21649},{"name":"xstore_mobile","status":"Up","pid":20155},{"name":"xstore-wrapper","status":"Up","pid":23898},{"name":"xstore_mobile-wrapper","status":"Up","pid":10587},{"name":"xenv_ui","status":"Up","pid":25307},{"name":"xenv_eng","status":"Up","pid":12579}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]}]},"0303":{"lastRefreshed":"2026-10-15T10:00:00-05:00","storeMode":"Registers-only store","notice":"Synthetic demonstration data. Register identifiers and IPs supplied; locations and health are illustrative only.","storeHealth":85,"registers":[{"id":1,"host":"awsd0303r01","ip":"10.188.81.82","uptime":"29d 10h 22m","lastBoot":"Sep 15, 19:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":9784},{"name":"xstore_mobile","status":"Up","pid":2741},{"name":"xstore-wrapper","status":"Up","pid":14928},{"name":"xstore_mobile-wrapper","status":"Up","pid":25929},{"name":"xenv_ui","status":"Up","pid":24213},{"name":"xenv_eng","status":"Up","pid":19658}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":2,"host":"awsd0303r02","ip":"10.188.81.83","uptime":"12d 17h 49m","lastBoot":"Oct 02, 10:00","processesUp":6,"servicesUp":3,"status":"Degraded","history":[1,1,1,1,0,1,1,0,1,0,0,1,1,1,1,1,1,1,1,1,0,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":25311},{"name":"xstore_mobile","status":"Up","pid":16758},{"name":"xstore-wrapper","status":"Up","pid":18327},{"name":"xstore_mobile-wrapper","status":"Up","pid":3492},{"name":"xenv_ui","status":"Up","pid":2386},{"name":"xenv_eng","status":"Up","pid":6230}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Down"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":3,"host":"awsd0303r03","ip":"10.188.81.84","uptime":"29d 10h 22m","lastBoot":"Sep 15, 19:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":12784},{"name":"xstore_mobile","status":"Up","pid":5741},{"name":"xstore-wrapper","status":"Up","pid":17928},{"name":"xstore_mobile-wrapper","status":"Up","pid":28929},{"name":"xenv_ui","status":"Up","pid":27213},{"name":"xenv_eng","status":"Up","pid":22658}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":4,"host":"awsd0303r04","ip":"10.188.81.85","uptime":"29d 10h 22m","lastBoot":"Sep 15, 19:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":13784},{"name":"xstore_mobile","status":"Up","pid":6741},{"name":"xstore-wrapper","status":"Up","pid":18928},{"name":"xstore_mobile-wrapper","status":"Up","pid":29929},{"name":"xenv_ui","status":"Up","pid":28213},{"name":"xenv_eng","status":"Up","pid":23658}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":5,"host":"awsd0303r05","ip":"10.188.81.86","uptime":"29d 10h 22m","lastBoot":"Sep 15, 19:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":14784},{"name":"xstore_mobile","status":"Up","pid":7741},{"name":"xstore-wrapper","status":"Up","pid":19928},{"name":"xstore_mobile-wrapper","status":"Up","pid":30929},{"name":"xenv_ui","status":"Up","pid":29213},{"name":"xenv_eng","status":"Up","pid":24658}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]}]},"0340":{"lastRefreshed":"2026-10-15T10:00:00-05:00","storeMode":"Registers-only store","notice":"Synthetic demonstration data. Register identifiers and IPs supplied; locations and health are illustrative only.","storeHealth":52,"registers":[{"id":1,"host":"awsd0340r01","ip":"10.188.84.82","uptime":"2d 14h 10m","lastBoot":"Oct 13, 00:00","processesUp":6,"servicesUp":3,"status":"Degraded","history":[0,1,1,1,1,1,0,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":14581},{"name":"xstore_mobile","status":"Up","pid":4726},{"name":"xstore-wrapper","status":"Up","pid":28887},{"name":"xstore_mobile-wrapper","status":"Up","pid":18999},{"name":"xenv_ui","status":"Up","pid":8081},{"name":"xenv_eng","status":"Up","pid":20831}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Down"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":2,"host":"awsd0340r02","ip":"10.188.84.83","uptime":"28d 16h 43m","lastBoot":"Sep 16, 23:00","processesUp":2,"servicesUp":1,"status":"Down","history":[0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1],"processes":[{"name":"xstore","status":"Down","pid":24584},{"name":"xstore_mobile","status":"Down","pid":23394},{"name":"xstore-wrapper","status":"Down","pid":25658},{"name":"xstore_mobile-wrapper","status":"Down","pid":12818},{"name":"xenv_ui","status":"Up","pid":9561},{"name":"xenv_eng","status":"Up","pid":5348}],"services":[{"name":"browser.service","status":"Down"},{"name":"eftlink.service","status":"Down"},{"name":"posi.service","status":"Down"},{"name":"tenderretail.service","status":"Up"}]},{"id":3,"host":"awsd0340r03","ip":"10.188.84.84","uptime":"2d 14h 10m","lastBoot":"Oct 13, 00:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[0,1,1,1,1,1,0,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":17581},{"name":"xstore_mobile","status":"Up","pid":7726},{"name":"xstore-wrapper","status":"Up","pid":31887},{"name":"xstore_mobile-wrapper","status":"Up","pid":21999},{"name":"xenv_ui","status":"Up","pid":11081},{"name":"xenv_eng","status":"Up","pid":23831}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":4,"host":"awsd0340r04","ip":"10.188.84.85","uptime":"2d 14h 10m","lastBoot":"Oct 13, 00:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[0,1,1,1,1,1,0,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":18581},{"name":"xstore_mobile","status":"Up","pid":8726},{"name":"xstore-wrapper","status":"Up","pid":32887},{"name":"xstore_mobile-wrapper","status":"Up","pid":22999},{"name":"xenv_ui","status":"Up","pid":12081},{"name":"xenv_eng","status":"Up","pid":24831}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":5,"host":"awsd0340r05","ip":"10.188.84.86","uptime":"2d 14h 10m","lastBoot":"Oct 13, 00:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[0,1,1,1,1,1,0,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":19581},{"name":"xstore_mobile","status":"Up","pid":9726},{"name":"xstore-wrapper","status":"Up","pid":33887},{"name":"xstore_mobile-wrapper","status":"Up","pid":23999},{"name":"xenv_ui","status":"Up","pid":13081},{"name":"xenv_eng","status":"Up","pid":25831}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]}]},"1005":{"lastRefreshed":"2026-10-15T10:00:00-05:00","storeMode":"Registers-only store","notice":"Synthetic demonstration data. Register identifiers and IPs supplied; locations and health are illustrative only.","storeHealth":56,"registers":[{"id":1,"host":"awsd1005r01","ip":"10.8.1.227","uptime":"9d 0h 19m","lastBoot":"Oct 05, 17:00","processesUp":2,"servicesUp":1,"status":"Down","history":[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0],"processes":[{"name":"xstore","status":"Down","pid":8459},{"name":"xstore_mobile","status":"Down","pid":25005},{"name":"xstore-wrapper","status":"Down","pid":28148},{"name":"xstore_mobile-wrapper","status":"Down","pid":28250},{"name":"xenv_ui","status":"Up","pid":22488},{"name":"xenv_eng","status":"Up","pid":5871}],"services":[{"name":"browser.service","status":"Down"},{"name":"eftlink.service","status":"Down"},{"name":"posi.service","status":"Down"},{"name":"tenderretail.service","status":"Up"}]},{"id":2,"host":"awsd1005r02","ip":"10.8.1.228","uptime":"30d 19h 21m","lastBoot":"Sep 14, 09:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":6744},{"name":"xstore_mobile","status":"Up","pid":10401},{"name":"xstore-wrapper","status":"Up","pid":16733},{"name":"xstore_mobile-wrapper","status":"Up","pid":11955},{"name":"xenv_ui","status":"Up","pid":14678},{"name":"xenv_eng","status":"Up","pid":18818}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":3,"host":"awsd1005r03","ip":"10.8.1.229","uptime":"30d 19h 21m","lastBoot":"Sep 14, 09:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":9744},{"name":"xstore_mobile","status":"Up","pid":13401},{"name":"xstore-wrapper","status":"Up","pid":19733},{"name":"xstore_mobile-wrapper","status":"Up","pid":14955},{"name":"xenv_ui","status":"Up","pid":17678},{"name":"xenv_eng","status":"Up","pid":21818}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":4,"host":"awsd1005r04","ip":"10.8.1.230","uptime":"30d 19h 21m","lastBoot":"Sep 14, 09:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":10744},{"name":"xstore_mobile","status":"Up","pid":14401},{"name":"xstore-wrapper","status":"Up","pid":20733},{"name":"xstore_mobile-wrapper","status":"Up","pid":15955},{"name":"xenv_ui","status":"Up","pid":18678},{"name":"xenv_eng","status":"Up","pid":22818}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":5,"host":"awsd1005r05","ip":"10.8.1.231","uptime":"30d 19h 21m","lastBoot":"Sep 14, 09:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":11744},{"name":"xstore_mobile","status":"Up","pid":15401},{"name":"xstore-wrapper","status":"Up","pid":21733},{"name":"xstore_mobile-wrapper","status":"Up","pid":16955},{"name":"xenv_ui","status":"Up","pid":19678},{"name":"xenv_eng","status":"Up","pid":23818}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]}]},"1040":{"lastRefreshed":"2026-10-15T10:00:00-05:00","storeMode":"Registers-only store","notice":"Synthetic demonstration data. Register identifiers and IPs supplied; locations and health are illustrative only.","storeHealth":96,"registers":[{"id":1,"host":"awsd1040r01","ip":"10.8.1.86","uptime":"10d 17h 52m","lastBoot":"Oct 04, 09:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":1480},{"name":"xstore_mobile","status":"Up","pid":4139},{"name":"xstore-wrapper","status":"Up","pid":6556},{"name":"xstore_mobile-wrapper","status":"Up","pid":27053},{"name":"xenv_ui","status":"Up","pid":16870},{"name":"xenv_eng","status":"Up","pid":11096}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":2,"host":"awsd1040r02","ip":"10.8.1.87","uptime":"10d 17h 52m","lastBoot":"Oct 04, 09:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":3480},{"name":"xstore_mobile","status":"Up","pid":6139},{"name":"xstore-wrapper","status":"Up","pid":8556},{"name":"xstore_mobile-wrapper","status":"Up","pid":29053},{"name":"xenv_ui","status":"Up","pid":18870},{"name":"xenv_eng","status":"Up","pid":13096}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":3,"host":"awsd1040r03","ip":"10.8.1.88","uptime":"10d 17h 52m","lastBoot":"Oct 04, 09:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":4480},{"name":"xstore_mobile","status":"Up","pid":7139},{"name":"xstore-wrapper","status":"Up","pid":9556},{"name":"xstore_mobile-wrapper","status":"Up","pid":30053},{"name":"xenv_ui","status":"Up","pid":19870},{"name":"xenv_eng","status":"Up","pid":14096}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":4,"host":"awsd1040r04","ip":"10.8.1.89","uptime":"10d 17h 52m","lastBoot":"Oct 04, 09:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":5480},{"name":"xstore_mobile","status":"Up","pid":8139},{"name":"xstore-wrapper","status":"Up","pid":10556},{"name":"xstore_mobile-wrapper","status":"Up","pid":31053},{"name":"xenv_ui","status":"Up","pid":20870},{"name":"xenv_eng","status":"Up","pid":15096}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]}]},"1141":{"lastRefreshed":"2026-10-15T10:00:00-05:00","storeMode":"Registers-only store","notice":"Synthetic demonstration data. Register identifiers and IPs supplied; locations and health are illustrative only.","storeHealth":100,"registers":[{"id":1,"host":"awsd1141r01","ip":"10.8.1.239","uptime":"19d 17h 38m","lastBoot":"Sep 25, 06:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":27819},{"name":"xstore_mobile","status":"Up","pid":3074},{"name":"xstore-wrapper","status":"Up","pid":21511},{"name":"xstore_mobile-wrapper","status":"Up","pid":4011},{"name":"xenv_ui","status":"Up","pid":10985},{"name":"xenv_eng","status":"Up","pid":1253}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":2,"host":"awsd1141r02","ip":"10.8.1.240","uptime":"10d 2h 29m","lastBoot":"Oct 04, 16:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":12101},{"name":"xstore_mobile","status":"Up","pid":10811},{"name":"xstore-wrapper","status":"Up","pid":27682},{"name":"xstore_mobile-wrapper","status":"Up","pid":17781},{"name":"xenv_ui","status":"Up","pid":17538},{"name":"xenv_eng","status":"Up","pid":1955}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":3,"host":"awsd1141r03","ip":"10.8.1.241","uptime":"19d 17h 38m","lastBoot":"Sep 25, 06:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":30819},{"name":"xstore_mobile","status":"Up","pid":6074},{"name":"xstore-wrapper","status":"Up","pid":24511},{"name":"xstore_mobile-wrapper","status":"Up","pid":7011},{"name":"xenv_ui","status":"Up","pid":13985},{"name":"xenv_eng","status":"Up","pid":4253}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":4,"host":"awsd1141r04","ip":"10.8.1.242","uptime":"19d 17h 38m","lastBoot":"Sep 25, 06:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":31819},{"name":"xstore_mobile","status":"Up","pid":7074},{"name":"xstore-wrapper","status":"Up","pid":25511},{"name":"xstore_mobile-wrapper","status":"Up","pid":8011},{"name":"xenv_ui","status":"Up","pid":14985},{"name":"xenv_eng","status":"Up","pid":5253}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":5,"host":"awsd1141r05","ip":"10.8.1.243","uptime":"19d 17h 38m","lastBoot":"Sep 25, 06:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":32819},{"name":"xstore_mobile","status":"Up","pid":8074},{"name":"xstore-wrapper","status":"Up","pid":26511},{"name":"xstore_mobile-wrapper","status":"Up","pid":9011},{"name":"xenv_ui","status":"Up","pid":15985},{"name":"xenv_eng","status":"Up","pid":6253}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]}]},"1250":{"lastRefreshed":"2026-10-15T10:00:00-05:00","storeMode":"Registers-only store","notice":"Synthetic demonstration data. Register identifiers and IPs supplied; locations and health are illustrative only.","storeHealth":96,"registers":[{"id":1,"host":"awsd1250r01","ip":"10.8.1.50","uptime":"30d 11h 22m","lastBoot":"Sep 14, 11:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":10110},{"name":"xstore_mobile","status":"Up","pid":1955},{"name":"xstore-wrapper","status":"Up","pid":7656},{"name":"xstore_mobile-wrapper","status":"Up","pid":9685},{"name":"xenv_ui","status":"Up","pid":11460},{"name":"xenv_eng","status":"Up","pid":23887}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":2,"host":"awsd1250r02","ip":"10.8.1.51","uptime":"30d 11h 22m","lastBoot":"Sep 14, 11:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":12110},{"name":"xstore_mobile","status":"Up","pid":3955},{"name":"xstore-wrapper","status":"Up","pid":9656},{"name":"xstore_mobile-wrapper","status":"Up","pid":11685},{"name":"xenv_ui","status":"Up","pid":13460},{"name":"xenv_eng","status":"Up","pid":25887}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":3,"host":"awsd1250r03","ip":"10.8.1.52","uptime":"30d 11h 22m","lastBoot":"Sep 14, 11:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":13110},{"name":"xstore_mobile","status":"Up","pid":4955},{"name":"xstore-wrapper","status":"Up","pid":10656},{"name":"xstore_mobile-wrapper","status":"Up","pid":12685},{"name":"xenv_ui","status":"Up","pid":14460},{"name":"xenv_eng","status":"Up","pid":26887}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":4,"host":"awsd1250r04","ip":"10.8.1.53","uptime":"30d 11h 22m","lastBoot":"Sep 14, 11:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":14110},{"name":"xstore_mobile","status":"Up","pid":5955},{"name":"xstore-wrapper","status":"Up","pid":11656},{"name":"xstore_mobile-wrapper","status":"Up","pid":13685},{"name":"xenv_ui","status":"Up","pid":15460},{"name":"xenv_eng","status":"Up","pid":27887}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]}]},"1461":{"lastRefreshed":"2026-10-15T10:00:00-05:00","storeMode":"Registers-only store","notice":"Synthetic demonstration data. Register identifiers and IPs supplied; locations and health are illustrative only.","storeHealth":48,"registers":[{"id":1,"host":"awsd1461r01","ip":"10.188.94.82","uptime":"13d 15h 47m","lastBoot":"Oct 01, 10:00","processesUp":6,"servicesUp":3,"status":"Degraded","history":[1,1,1,1,1,0,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":24526},{"name":"xstore_mobile","status":"Up","pid":6741},{"name":"xstore-wrapper","status":"Up","pid":3855},{"name":"xstore_mobile-wrapper","status":"Up","pid":7930},{"name":"xenv_ui","status":"Up","pid":9105},{"name":"xenv_eng","status":"Up","pid":20187}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Down"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":2,"host":"awsd1461r02","ip":"10.188.94.83","uptime":"18d 12h 56m","lastBoot":"Sep 26, 08:00","processesUp":2,"servicesUp":1,"status":"Down","history":[0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"processes":[{"name":"xstore","status":"Down","pid":22944},{"name":"xstore_mobile","status":"Down","pid":13702},{"name":"xstore-wrapper","status":"Down","pid":17674},{"name":"xstore_mobile-wrapper","status":"Down","pid":5640},{"name":"xenv_ui","status":"Up","pid":1587},{"name":"xenv_eng","status":"Up","pid":17474}],"services":[{"name":"browser.service","status":"Down"},{"name":"eftlink.service","status":"Down"},{"name":"posi.service","status":"Down"},{"name":"tenderretail.service","status":"Up"}]},{"id":3,"host":"awsd1461r03","ip":"10.188.94.84","uptime":"13d 15h 47m","lastBoot":"Oct 01, 10:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,0,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":27526},{"name":"xstore_mobile","status":"Up","pid":9741},{"name":"xstore-wrapper","status":"Up","pid":6855},{"name":"xstore_mobile-wrapper","status":"Up","pid":10930},{"name":"xenv_ui","status":"Up","pid":12105},{"name":"xenv_eng","status":"Up","pid":23187}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":4,"host":"awsd1461r04","ip":"10.188.94.85","uptime":"13d 15h 47m","lastBoot":"Oct 01, 10:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,0,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":28526},{"name":"xstore_mobile","status":"Up","pid":10741},{"name":"xstore-wrapper","status":"Up","pid":7855},{"name":"xstore_mobile-wrapper","status":"Up","pid":11930},{"name":"xenv_ui","status":"Up","pid":13105},{"name":"xenv_eng","status":"Up","pid":24187}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":5,"host":"awsd1461r05","ip":"10.188.94.86","uptime":"13d 15h 47m","lastBoot":"Oct 01, 10:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,0,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":29526},{"name":"xstore_mobile","status":"Up","pid":11741},{"name":"xstore-wrapper","status":"Up","pid":8855},{"name":"xstore_mobile-wrapper","status":"Up","pid":12930},{"name":"xenv_ui","status":"Up","pid":14105},{"name":"xenv_eng","status":"Up","pid":25187}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]}]},"1468":{"lastRefreshed":"2026-10-15T10:00:00-05:00","storeMode":"Registers-only store","notice":"Synthetic demonstration data. Register identifiers and IPs supplied; locations and health are illustrative only.","storeHealth":17,"registers":[{"id":1,"host":"awsd1468r01","ip":"10.188.80.70","uptime":"2d 21h 36m","lastBoot":"Oct 12, 04:00","processesUp":2,"servicesUp":1,"status":"Down","history":[0,1,0,1,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],"processes":[{"name":"xstore","status":"Down","pid":22595},{"name":"xstore_mobile","status":"Down","pid":14480},{"name":"xstore-wrapper","status":"Down","pid":26785},{"name":"xstore_mobile-wrapper","status":"Down","pid":16968},{"name":"xenv_ui","status":"Up","pid":16557},{"name":"xenv_eng","status":"Up","pid":12087}],"services":[{"name":"browser.service","status":"Down"},{"name":"eftlink.service","status":"Down"},{"name":"posi.service","status":"Down"},{"name":"tenderretail.service","status":"Up"}]},{"id":2,"host":"awsd1468r02","ip":"10.188.80.71","uptime":"2d 21h 36m","lastBoot":"Oct 12, 04:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[0,1,0,1,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],"processes":[{"name":"xstore","status":"Up","pid":24595},{"name":"xstore_mobile","status":"Up","pid":16480},{"name":"xstore-wrapper","status":"Up","pid":28785},{"name":"xstore_mobile-wrapper","status":"Up","pid":18968},{"name":"xenv_ui","status":"Up","pid":18557},{"name":"xenv_eng","status":"Up","pid":14087}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":3,"host":"awsd1468r03","ip":"10.188.80.72","uptime":"2d 21h 36m","lastBoot":"Oct 12, 04:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[0,1,0,1,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],"processes":[{"name":"xstore","status":"Up","pid":25595},{"name":"xstore_mobile","status":"Up","pid":17480},{"name":"xstore-wrapper","status":"Up","pid":29785},{"name":"xstore_mobile-wrapper","status":"Up","pid":19968},{"name":"xenv_ui","status":"Up","pid":19557},{"name":"xenv_eng","status":"Up","pid":15087}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":4,"host":"awsd1468r04","ip":"10.188.80.73","uptime":"2d 21h 36m","lastBoot":"Oct 12, 04:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[0,1,0,1,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],"processes":[{"name":"xstore","status":"Up","pid":26595},{"name":"xstore_mobile","status":"Up","pid":18480},{"name":"xstore-wrapper","status":"Up","pid":30785},{"name":"xstore_mobile-wrapper","status":"Up","pid":20968},{"name":"xenv_ui","status":"Up","pid":20557},{"name":"xenv_eng","status":"Up","pid":16087}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]}]},"1493":{"lastRefreshed":"2026-10-15T10:00:00-05:00","storeMode":"Registers-only store","notice":"Synthetic demonstration data. Register identifiers and IPs supplied; locations and health are illustrative only.","storeHealth":92,"registers":[{"id":1,"host":"awsd1493r01","ip":"10.8.1.113","uptime":"12d 12h 5m","lastBoot":"Oct 02, 13:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1],"processes":[{"name":"xstore","status":"Up","pid":11027},{"name":"xstore_mobile","status":"Up","pid":28417},{"name":"xstore-wrapper","status":"Up","pid":14252},{"name":"xstore_mobile-wrapper","status":"Up","pid":28411},{"name":"xenv_ui","status":"Up","pid":25956},{"name":"xenv_eng","status":"Up","pid":4834}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":2,"host":"awsd1493r02","ip":"10.8.1.114","uptime":"12d 12h 5m","lastBoot":"Oct 02, 13:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1],"processes":[{"name":"xstore","status":"Up","pid":13027},{"name":"xstore_mobile","status":"Up","pid":30417},{"name":"xstore-wrapper","status":"Up","pid":16252},{"name":"xstore_mobile-wrapper","status":"Up","pid":30411},{"name":"xenv_ui","status":"Up","pid":27956},{"name":"xenv_eng","status":"Up","pid":6834}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":3,"host":"awsd1493r03","ip":"10.8.1.115","uptime":"12d 12h 5m","lastBoot":"Oct 02, 13:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1],"processes":[{"name":"xstore","status":"Up","pid":14027},{"name":"xstore_mobile","status":"Up","pid":31417},{"name":"xstore-wrapper","status":"Up","pid":17252},{"name":"xstore_mobile-wrapper","status":"Up","pid":31411},{"name":"xenv_ui","status":"Up","pid":28956},{"name":"xenv_eng","status":"Up","pid":7834}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":4,"host":"awsd1493r04","ip":"10.8.1.116","uptime":"12d 12h 5m","lastBoot":"Oct 02, 13:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1],"processes":[{"name":"xstore","status":"Up","pid":15027},{"name":"xstore_mobile","status":"Up","pid":32417},{"name":"xstore-wrapper","status":"Up","pid":18252},{"name":"xstore_mobile-wrapper","status":"Up","pid":32411},{"name":"xenv_ui","status":"Up","pid":29956},{"name":"xenv_eng","status":"Up","pid":8834}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]}]},"1508":{"lastRefreshed":"2026-10-15T10:00:00-05:00","storeMode":"Registers-only store","notice":"Synthetic demonstration data. Register identifiers and IPs supplied; locations and health are illustrative only.","storeHealth":92,"registers":[{"id":1,"host":"awsd1508r01","ip":"10.8.1.145","uptime":"19d 7h 7m","lastBoot":"Sep 25, 17:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":12680},{"name":"xstore_mobile","status":"Up","pid":24466},{"name":"xstore-wrapper","status":"Up","pid":4873},{"name":"xstore_mobile-wrapper","status":"Up","pid":5129},{"name":"xenv_ui","status":"Up","pid":5717},{"name":"xenv_eng","status":"Up","pid":27281}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":2,"host":"awsd1508r02","ip":"10.8.1.146","uptime":"19d 7h 7m","lastBoot":"Sep 25, 17:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":14680},{"name":"xstore_mobile","status":"Up","pid":26466},{"name":"xstore-wrapper","status":"Up","pid":6873},{"name":"xstore_mobile-wrapper","status":"Up","pid":7129},{"name":"xenv_ui","status":"Up","pid":7717},{"name":"xenv_eng","status":"Up","pid":29281}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":3,"host":"awsd1508r03","ip":"10.8.1.147","uptime":"19d 7h 7m","lastBoot":"Sep 25, 17:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":15680},{"name":"xstore_mobile","status":"Up","pid":27466},{"name":"xstore-wrapper","status":"Up","pid":7873},{"name":"xstore_mobile-wrapper","status":"Up","pid":8129},{"name":"xenv_ui","status":"Up","pid":8717},{"name":"xenv_eng","status":"Up","pid":30281}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":4,"host":"awsd1508r04","ip":"10.8.1.148","uptime":"19d 7h 7m","lastBoot":"Sep 25, 17:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":16680},{"name":"xstore_mobile","status":"Up","pid":28466},{"name":"xstore-wrapper","status":"Up","pid":8873},{"name":"xstore_mobile-wrapper","status":"Up","pid":9129},{"name":"xenv_ui","status":"Up","pid":9717},{"name":"xenv_eng","status":"Up","pid":31281}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]}]},"1665":{"lastRefreshed":"2026-10-15T10:00:00-05:00","storeMode":"Registers-only store","notice":"Synthetic demonstration data. Register identifiers and IPs supplied; locations and health are illustrative only.","storeHealth":100,"registers":[{"id":1,"host":"awsd1665r01","ip":"10.188.94.73","uptime":"9d 22h 14m","lastBoot":"Oct 05, 05:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":6125},{"name":"xstore_mobile","status":"Up","pid":28825},{"name":"xstore-wrapper","status":"Up","pid":8424},{"name":"xstore_mobile-wrapper","status":"Up","pid":18766},{"name":"xenv_ui","status":"Up","pid":16090},{"name":"xenv_eng","status":"Up","pid":21362}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":2,"host":"awsd1665r02","ip":"10.188.94.74","uptime":"9d 22h 14m","lastBoot":"Oct 05, 05:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":8125},{"name":"xstore_mobile","status":"Up","pid":30825},{"name":"xstore-wrapper","status":"Up","pid":10424},{"name":"xstore_mobile-wrapper","status":"Up","pid":20766},{"name":"xenv_ui","status":"Up","pid":18090},{"name":"xenv_eng","status":"Up","pid":23362}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":3,"host":"awsd1665r03","ip":"10.188.94.75","uptime":"9d 22h 14m","lastBoot":"Oct 05, 05:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":9125},{"name":"xstore_mobile","status":"Up","pid":31825},{"name":"xstore-wrapper","status":"Up","pid":11424},{"name":"xstore_mobile-wrapper","status":"Up","pid":21766},{"name":"xenv_ui","status":"Up","pid":19090},{"name":"xenv_eng","status":"Up","pid":24362}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":4,"host":"awsd1665r04","ip":"10.188.94.76","uptime":"9d 22h 14m","lastBoot":"Oct 05, 05:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":10125},{"name":"xstore_mobile","status":"Up","pid":32825},{"name":"xstore-wrapper","status":"Up","pid":12424},{"name":"xstore_mobile-wrapper","status":"Up","pid":22766},{"name":"xenv_ui","status":"Up","pid":20090},{"name":"xenv_eng","status":"Up","pid":25362}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]}]},"1690":{"lastRefreshed":"2026-10-15T10:00:00-05:00","storeMode":"Registers-only store","notice":"Synthetic demonstration data. Register identifiers and IPs supplied; locations and health are illustrative only.","storeHealth":75,"registers":[{"id":1,"host":"awsd1690r01","ip":"10.8.1.252","uptime":"4d 9h 21m","lastBoot":"Oct 10, 12:00","processesUp":6,"servicesUp":3,"status":"Degraded","history":[0,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,0,1,1,1,0,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":13613},{"name":"xstore_mobile","status":"Up","pid":17115},{"name":"xstore-wrapper","status":"Up","pid":19825},{"name":"xstore_mobile-wrapper","status":"Up","pid":1281},{"name":"xenv_ui","status":"Up","pid":13498},{"name":"xenv_eng","status":"Up","pid":19682}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Down"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":2,"host":"awsd1690r02","ip":"10.8.1.253","uptime":"4d 9h 21m","lastBoot":"Oct 10, 12:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[0,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,0,1,1,1,0,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":15613},{"name":"xstore_mobile","status":"Up","pid":19115},{"name":"xstore-wrapper","status":"Up","pid":21825},{"name":"xstore_mobile-wrapper","status":"Up","pid":3281},{"name":"xenv_ui","status":"Up","pid":15498},{"name":"xenv_eng","status":"Up","pid":21682}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":3,"host":"awsd1690r03","ip":"10.8.1.254","uptime":"4d 9h 21m","lastBoot":"Oct 10, 12:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[0,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,0,1,1,1,0,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":16613},{"name":"xstore_mobile","status":"Up","pid":20115},{"name":"xstore-wrapper","status":"Up","pid":22825},{"name":"xstore_mobile-wrapper","status":"Up","pid":4281},{"name":"xenv_ui","status":"Up","pid":16498},{"name":"xenv_eng","status":"Up","pid":22682}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":4,"host":"awsd1690r04","ip":"10.8.1.255","uptime":"4d 9h 21m","lastBoot":"Oct 10, 12:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[0,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,0,1,1,1,0,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":17613},{"name":"xstore_mobile","status":"Up","pid":21115},{"name":"xstore-wrapper","status":"Up","pid":23825},{"name":"xstore_mobile-wrapper","status":"Up","pid":5281},{"name":"xenv_ui","status":"Up","pid":17498},{"name":"xenv_eng","status":"Up","pid":23682}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]}]},"1715":{"lastRefreshed":"2026-10-15T10:00:00-05:00","storeMode":"Registers-only store","notice":"Synthetic demonstration data. Register identifiers and IPs supplied; locations and health are illustrative only.","storeHealth":29,"registers":[{"id":1,"host":"awsd1715r01","ip":"10.8.1.85","uptime":"11d 6h 21m","lastBoot":"Oct 03, 15:00","processesUp":2,"servicesUp":1,"status":"Down","history":[0,0,0,1,1,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1,1],"processes":[{"name":"xstore","status":"Down","pid":21451},{"name":"xstore_mobile","status":"Down","pid":1394},{"name":"xstore-wrapper","status":"Down","pid":28578},{"name":"xstore_mobile-wrapper","status":"Down","pid":5297},{"name":"xenv_ui","status":"Up","pid":3976},{"name":"xenv_eng","status":"Up","pid":18393}],"services":[{"name":"browser.service","status":"Down"},{"name":"eftlink.service","status":"Down"},{"name":"posi.service","status":"Down"},{"name":"tenderretail.service","status":"Up"}]},{"id":2,"host":"awsd1715r02","ip":"10.8.1.86","uptime":"11d 6h 21m","lastBoot":"Oct 03, 15:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[0,0,0,1,1,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1,1],"processes":[{"name":"xstore","status":"Up","pid":23451},{"name":"xstore_mobile","status":"Up","pid":3394},{"name":"xstore-wrapper","status":"Up","pid":30578},{"name":"xstore_mobile-wrapper","status":"Up","pid":7297},{"name":"xenv_ui","status":"Up","pid":5976},{"name":"xenv_eng","status":"Up","pid":20393}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":3,"host":"awsd1715r03","ip":"10.8.1.87","uptime":"11d 6h 21m","lastBoot":"Oct 03, 15:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[0,0,0,1,1,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1,1],"processes":[{"name":"xstore","status":"Up","pid":24451},{"name":"xstore_mobile","status":"Up","pid":4394},{"name":"xstore-wrapper","status":"Up","pid":31578},{"name":"xstore_mobile-wrapper","status":"Up","pid":8297},{"name":"xenv_ui","status":"Up","pid":6976},{"name":"xenv_eng","status":"Up","pid":21393}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":4,"host":"awsd1715r04","ip":"10.8.1.88","uptime":"11d 6h 21m","lastBoot":"Oct 03, 15:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[0,0,0,1,1,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1,1],"processes":[{"name":"xstore","status":"Up","pid":25451},{"name":"xstore_mobile","status":"Up","pid":5394},{"name":"xstore-wrapper","status":"Up","pid":32578},{"name":"xstore_mobile-wrapper","status":"Up","pid":9297},{"name":"xenv_ui","status":"Up","pid":7976},{"name":"xenv_eng","status":"Up","pid":22393}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]}]},"1726":{"lastRefreshed":"2026-10-15T10:00:00-05:00","storeMode":"Registers-only store","notice":"Synthetic demonstration data. Register identifiers and IPs supplied; locations and health are illustrative only.","storeHealth":96,"registers":[{"id":1,"host":"awsd1726r01","ip":"10.8.1.60","uptime":"29d 5h 29m","lastBoot":"Sep 15, 03:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":12417},{"name":"xstore_mobile","status":"Up","pid":1784},{"name":"xstore-wrapper","status":"Up","pid":6330},{"name":"xstore_mobile-wrapper","status":"Up","pid":24593},{"name":"xenv_ui","status":"Up","pid":13059},{"name":"xenv_eng","status":"Up","pid":13101}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":2,"host":"awsd1726r02","ip":"10.8.1.61","uptime":"29d 5h 29m","lastBoot":"Sep 15, 03:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":14417},{"name":"xstore_mobile","status":"Up","pid":3784},{"name":"xstore-wrapper","status":"Up","pid":8330},{"name":"xstore_mobile-wrapper","status":"Up","pid":26593},{"name":"xenv_ui","status":"Up","pid":15059},{"name":"xenv_eng","status":"Up","pid":15101}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":3,"host":"awsd1726r03","ip":"10.8.1.62","uptime":"29d 5h 29m","lastBoot":"Sep 15, 03:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":15417},{"name":"xstore_mobile","status":"Up","pid":4784},{"name":"xstore-wrapper","status":"Up","pid":9330},{"name":"xstore_mobile-wrapper","status":"Up","pid":27593},{"name":"xenv_ui","status":"Up","pid":16059},{"name":"xenv_eng","status":"Up","pid":16101}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":4,"host":"awsd1726r04","ip":"10.8.1.63","uptime":"29d 5h 29m","lastBoot":"Sep 15, 03:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":16417},{"name":"xstore_mobile","status":"Up","pid":5784},{"name":"xstore-wrapper","status":"Up","pid":10330},{"name":"xstore_mobile-wrapper","status":"Up","pid":28593},{"name":"xenv_ui","status":"Up","pid":17059},{"name":"xenv_eng","status":"Up","pid":17101}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]}]},"1733":{"lastRefreshed":"2026-10-15T10:00:00-05:00","storeMode":"Registers-only store","notice":"Synthetic demonstration data. Register identifiers and IPs supplied; locations and health are illustrative only.","storeHealth":96,"registers":[{"id":1,"host":"awsd1733r01","ip":"10.188.94.72","uptime":"19d 23h 38m","lastBoot":"Sep 25, 07:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":17877},{"name":"xstore_mobile","status":"Up","pid":22602},{"name":"xstore-wrapper","status":"Up","pid":19057},{"name":"xstore_mobile-wrapper","status":"Up","pid":6807},{"name":"xenv_ui","status":"Up","pid":10834},{"name":"xenv_eng","status":"Up","pid":4077}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":2,"host":"awsd1733r02","ip":"10.188.94.73","uptime":"19d 23h 38m","lastBoot":"Sep 25, 07:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":19877},{"name":"xstore_mobile","status":"Up","pid":24602},{"name":"xstore-wrapper","status":"Up","pid":21057},{"name":"xstore_mobile-wrapper","status":"Up","pid":8807},{"name":"xenv_ui","status":"Up","pid":12834},{"name":"xenv_eng","status":"Up","pid":6077}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":3,"host":"awsd1733r03","ip":"10.188.94.74","uptime":"19d 23h 38m","lastBoot":"Sep 25, 07:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":20877},{"name":"xstore_mobile","status":"Up","pid":25602},{"name":"xstore-wrapper","status":"Up","pid":22057},{"name":"xstore_mobile-wrapper","status":"Up","pid":9807},{"name":"xenv_ui","status":"Up","pid":13834},{"name":"xenv_eng","status":"Up","pid":7077}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":4,"host":"awsd1733r04","ip":"10.188.94.75","uptime":"19d 23h 38m","lastBoot":"Sep 25, 07:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":21877},{"name":"xstore_mobile","status":"Up","pid":26602},{"name":"xstore-wrapper","status":"Up","pid":23057},{"name":"xstore_mobile-wrapper","status":"Up","pid":10807},{"name":"xenv_ui","status":"Up","pid":14834},{"name":"xenv_eng","status":"Up","pid":8077}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]}]},"1804":{"lastRefreshed":"2026-10-15T10:00:00-05:00","storeMode":"Registers-only store","notice":"Synthetic demonstration data. Register identifiers and IPs supplied; locations and health are illustrative only.","storeHealth":96,"registers":[{"id":1,"host":"awsd1804r01","ip":"10.8.1.146","uptime":"28d 11h 42m","lastBoot":"Sep 16, 21:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":9549},{"name":"xstore_mobile","status":"Up","pid":27422},{"name":"xstore-wrapper","status":"Up","pid":19060},{"name":"xstore_mobile-wrapper","status":"Up","pid":5728},{"name":"xenv_ui","status":"Up","pid":14447},{"name":"xenv_eng","status":"Up","pid":7499}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":2,"host":"awsd1804r02","ip":"10.8.1.147","uptime":"28d 11h 42m","lastBoot":"Sep 16, 21:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":11549},{"name":"xstore_mobile","status":"Up","pid":29422},{"name":"xstore-wrapper","status":"Up","pid":21060},{"name":"xstore_mobile-wrapper","status":"Up","pid":7728},{"name":"xenv_ui","status":"Up","pid":16447},{"name":"xenv_eng","status":"Up","pid":9499}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":3,"host":"awsd1804r03","ip":"10.8.1.148","uptime":"28d 11h 42m","lastBoot":"Sep 16, 21:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":12549},{"name":"xstore_mobile","status":"Up","pid":30422},{"name":"xstore-wrapper","status":"Up","pid":22060},{"name":"xstore_mobile-wrapper","status":"Up","pid":8728},{"name":"xenv_ui","status":"Up","pid":17447},{"name":"xenv_eng","status":"Up","pid":10499}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":4,"host":"awsd1804r04","ip":"10.8.1.149","uptime":"28d 11h 42m","lastBoot":"Sep 16, 21:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":13549},{"name":"xstore_mobile","status":"Up","pid":31422},{"name":"xstore-wrapper","status":"Up","pid":23060},{"name":"xstore_mobile-wrapper","status":"Up","pid":9728},{"name":"xenv_ui","status":"Up","pid":18447},{"name":"xenv_eng","status":"Up","pid":11499}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]}]},"1855":{"lastRefreshed":"2026-10-15T10:00:00-05:00","storeMode":"Registers-only store","notice":"Synthetic demonstration data. Register identifiers and IPs supplied; locations and health are illustrative only.","storeHealth":48,"registers":[{"id":1,"host":"awsd1855r01","ip":"10.8.1.225","uptime":"25d 22h 56m","lastBoot":"Sep 19, 14:00","processesUp":6,"servicesUp":3,"status":"Degraded","history":[1,1,0,1,1,1,1,0,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":4282},{"name":"xstore_mobile","status":"Up","pid":2524},{"name":"xstore-wrapper","status":"Up","pid":21896},{"name":"xstore_mobile-wrapper","status":"Up","pid":26353},{"name":"xenv_ui","status":"Up","pid":15927},{"name":"xenv_eng","status":"Up","pid":17203}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Down"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":2,"host":"awsd1855r02","ip":"10.8.1.226","uptime":"7d 23h 19m","lastBoot":"Oct 08, 00:00","processesUp":2,"servicesUp":1,"status":"Down","history":[0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0],"processes":[{"name":"xstore","status":"Down","pid":15060},{"name":"xstore_mobile","status":"Down","pid":17737},{"name":"xstore-wrapper","status":"Down","pid":28451},{"name":"xstore_mobile-wrapper","status":"Down","pid":4110},{"name":"xenv_ui","status":"Up","pid":10241},{"name":"xenv_eng","status":"Up","pid":21901}],"services":[{"name":"browser.service","status":"Down"},{"name":"eftlink.service","status":"Down"},{"name":"posi.service","status":"Down"},{"name":"tenderretail.service","status":"Up"}]},{"id":3,"host":"awsd1855r03","ip":"10.8.1.227","uptime":"25d 22h 56m","lastBoot":"Sep 19, 14:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,0,1,1,1,1,0,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":7282},{"name":"xstore_mobile","status":"Up","pid":5524},{"name":"xstore-wrapper","status":"Up","pid":24896},{"name":"xstore_mobile-wrapper","status":"Up","pid":29353},{"name":"xenv_ui","status":"Up","pid":18927},{"name":"xenv_eng","status":"Up","pid":20203}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":4,"host":"awsd1855r04","ip":"10.8.1.228","uptime":"25d 22h 56m","lastBoot":"Sep 19, 14:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,0,1,1,1,1,0,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":8282},{"name":"xstore_mobile","status":"Up","pid":6524},{"name":"xstore-wrapper","status":"Up","pid":25896},{"name":"xstore_mobile-wrapper","status":"Up","pid":30353},{"name":"xenv_ui","status":"Up","pid":19927},{"name":"xenv_eng","status":"Up","pid":21203}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":5,"host":"awsd1855r05","ip":"10.8.1.229","uptime":"25d 22h 56m","lastBoot":"Sep 19, 14:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,0,1,1,1,1,0,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":9282},{"name":"xstore_mobile","status":"Up","pid":7524},{"name":"xstore-wrapper","status":"Up","pid":26896},{"name":"xstore_mobile-wrapper","status":"Up","pid":31353},{"name":"xenv_ui","status":"Up","pid":20927},{"name":"xenv_eng","status":"Up","pid":22203}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]}]},"1885":{"lastRefreshed":"2026-10-15T10:00:00-05:00","storeMode":"Registers-only store","notice":"Synthetic demonstration data. Register identifiers and IPs supplied; locations and health are illustrative only.","storeHealth":21,"registers":[{"id":1,"host":"awsd1885r01","ip":"10.8.1.20","uptime":"11d 23h 31m","lastBoot":"Oct 03, 04:00","processesUp":2,"servicesUp":1,"status":"Down","history":[0,0,1,0,0,0,0,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,0],"processes":[{"name":"xstore","status":"Down","pid":24471},{"name":"xstore_mobile","status":"Down","pid":15216},{"name":"xstore-wrapper","status":"Down","pid":1982},{"name":"xstore_mobile-wrapper","status":"Down","pid":12186},{"name":"xenv_ui","status":"Up","pid":12165},{"name":"xenv_eng","status":"Up","pid":10501}],"services":[{"name":"browser.service","status":"Down"},{"name":"eftlink.service","status":"Down"},{"name":"posi.service","status":"Down"},{"name":"tenderretail.service","status":"Up"}]},{"id":2,"host":"awsd1885r02","ip":"10.8.1.21","uptime":"11d 23h 31m","lastBoot":"Oct 03, 04:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[0,0,1,0,0,0,0,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,0],"processes":[{"name":"xstore","status":"Up","pid":26471},{"name":"xstore_mobile","status":"Up","pid":17216},{"name":"xstore-wrapper","status":"Up","pid":3982},{"name":"xstore_mobile-wrapper","status":"Up","pid":14186},{"name":"xenv_ui","status":"Up","pid":14165},{"name":"xenv_eng","status":"Up","pid":12501}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":3,"host":"awsd1885r03","ip":"10.8.1.22","uptime":"11d 23h 31m","lastBoot":"Oct 03, 04:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[0,0,1,0,0,0,0,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,0],"processes":[{"name":"xstore","status":"Up","pid":27471},{"name":"xstore_mobile","status":"Up","pid":18216},{"name":"xstore-wrapper","status":"Up","pid":4982},{"name":"xstore_mobile-wrapper","status":"Up","pid":15186},{"name":"xenv_ui","status":"Up","pid":15165},{"name":"xenv_eng","status":"Up","pid":13501}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":4,"host":"awsd1885r04","ip":"10.8.1.23","uptime":"11d 23h 31m","lastBoot":"Oct 03, 04:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[0,0,1,0,0,0,0,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,0],"processes":[{"name":"xstore","status":"Up","pid":28471},{"name":"xstore_mobile","status":"Up","pid":19216},{"name":"xstore-wrapper","status":"Up","pid":5982},{"name":"xstore_mobile-wrapper","status":"Up","pid":16186},{"name":"xenv_ui","status":"Up","pid":16165},{"name":"xenv_eng","status":"Up","pid":14501}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]}]},"2001":{"lastRefreshed":"2026-10-15T10:00:00-05:00","storeMode":"Registers-only store","notice":"Synthetic demonstration data. Register identifiers and IPs supplied; locations and health are illustrative only.","storeHealth":100,"registers":[{"id":1,"host":"awsd2001r01","ip":"10.8.1.87","uptime":"8d 21h 39m","lastBoot":"Oct 06, 11:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":9208},{"name":"xstore_mobile","status":"Up","pid":18441},{"name":"xstore-wrapper","status":"Up","pid":17249},{"name":"xstore_mobile-wrapper","status":"Up","pid":9847},{"name":"xenv_ui","status":"Up","pid":12602},{"name":"xenv_eng","status":"Up","pid":27622}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":2,"host":"awsd2001r02","ip":"10.8.1.88","uptime":"8d 21h 39m","lastBoot":"Oct 06, 11:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":11208},{"name":"xstore_mobile","status":"Up","pid":20441},{"name":"xstore-wrapper","status":"Up","pid":19249},{"name":"xstore_mobile-wrapper","status":"Up","pid":11847},{"name":"xenv_ui","status":"Up","pid":14602},{"name":"xenv_eng","status":"Up","pid":29622}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":3,"host":"awsd2001r03","ip":"10.8.1.89","uptime":"8d 21h 39m","lastBoot":"Oct 06, 11:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":12208},{"name":"xstore_mobile","status":"Up","pid":21441},{"name":"xstore-wrapper","status":"Up","pid":20249},{"name":"xstore_mobile-wrapper","status":"Up","pid":12847},{"name":"xenv_ui","status":"Up","pid":15602},{"name":"xenv_eng","status":"Up","pid":30622}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":4,"host":"awsd2001r04","ip":"10.8.1.90","uptime":"8d 21h 39m","lastBoot":"Oct 06, 11:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":13208},{"name":"xstore_mobile","status":"Up","pid":22441},{"name":"xstore-wrapper","status":"Up","pid":21249},{"name":"xstore_mobile-wrapper","status":"Up","pid":13847},{"name":"xenv_ui","status":"Up","pid":16602},{"name":"xenv_eng","status":"Up","pid":31622}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]}]},"2079":{"lastRefreshed":"2026-10-15T10:00:00-05:00","storeMode":"Registers-only store","notice":"Synthetic demonstration data. Register identifiers and IPs supplied; locations and health are illustrative only.","storeHealth":100,"registers":[{"id":1,"host":"awsd2079r01","ip":"10.8.1.72","uptime":"16d 20h 21m","lastBoot":"Sep 28, 11:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":21532},{"name":"xstore_mobile","status":"Up","pid":1680},{"name":"xstore-wrapper","status":"Up","pid":26157},{"name":"xstore_mobile-wrapper","status":"Up","pid":1593},{"name":"xenv_ui","status":"Up","pid":22921},{"name":"xenv_eng","status":"Up","pid":16364}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":2,"host":"awsd2079r02","ip":"10.8.1.73","uptime":"16d 20h 21m","lastBoot":"Sep 28, 11:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":23532},{"name":"xstore_mobile","status":"Up","pid":3680},{"name":"xstore-wrapper","status":"Up","pid":28157},{"name":"xstore_mobile-wrapper","status":"Up","pid":3593},{"name":"xenv_ui","status":"Up","pid":24921},{"name":"xenv_eng","status":"Up","pid":18364}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":3,"host":"awsd2079r03","ip":"10.8.1.74","uptime":"16d 20h 21m","lastBoot":"Sep 28, 11:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":24532},{"name":"xstore_mobile","status":"Up","pid":4680},{"name":"xstore-wrapper","status":"Up","pid":29157},{"name":"xstore_mobile-wrapper","status":"Up","pid":4593},{"name":"xenv_ui","status":"Up","pid":25921},{"name":"xenv_eng","status":"Up","pid":19364}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":4,"host":"awsd2079r04","ip":"10.8.1.75","uptime":"16d 20h 21m","lastBoot":"Sep 28, 11:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":25532},{"name":"xstore_mobile","status":"Up","pid":5680},{"name":"xstore-wrapper","status":"Up","pid":30157},{"name":"xstore_mobile-wrapper","status":"Up","pid":5593},{"name":"xenv_ui","status":"Up","pid":26921},{"name":"xenv_eng","status":"Up","pid":20364}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]}]},"2088":{"lastRefreshed":"2026-10-15T10:00:00-05:00","storeMode":"Registers-only store","notice":"Synthetic demonstration data. Register identifiers and IPs supplied; locations and health are illustrative only.","storeHealth":96,"registers":[{"id":1,"host":"awsd2088r01","ip":"10.188.80.71","uptime":"7d 12h 52m","lastBoot":"Oct 07, 21:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":25529},{"name":"xstore_mobile","status":"Up","pid":15671},{"name":"xstore-wrapper","status":"Up","pid":23150},{"name":"xstore_mobile-wrapper","status":"Up","pid":13159},{"name":"xenv_ui","status":"Up","pid":15333},{"name":"xenv_eng","status":"Up","pid":16281}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":2,"host":"awsd2088r02","ip":"10.188.80.72","uptime":"7d 12h 52m","lastBoot":"Oct 07, 21:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":27529},{"name":"xstore_mobile","status":"Up","pid":17671},{"name":"xstore-wrapper","status":"Up","pid":25150},{"name":"xstore_mobile-wrapper","status":"Up","pid":15159},{"name":"xenv_ui","status":"Up","pid":17333},{"name":"xenv_eng","status":"Up","pid":18281}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":3,"host":"awsd2088r03","ip":"10.188.80.73","uptime":"7d 12h 52m","lastBoot":"Oct 07, 21:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":28529},{"name":"xstore_mobile","status":"Up","pid":18671},{"name":"xstore-wrapper","status":"Up","pid":26150},{"name":"xstore_mobile-wrapper","status":"Up","pid":16159},{"name":"xenv_ui","status":"Up","pid":18333},{"name":"xenv_eng","status":"Up","pid":19281}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":4,"host":"awsd2088r04","ip":"10.188.80.74","uptime":"7d 12h 52m","lastBoot":"Oct 07, 21:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":29529},{"name":"xstore_mobile","status":"Up","pid":19671},{"name":"xstore-wrapper","status":"Up","pid":27150},{"name":"xstore_mobile-wrapper","status":"Up","pid":17159},{"name":"xenv_ui","status":"Up","pid":19333},{"name":"xenv_eng","status":"Up","pid":20281}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]}]},"3501":{"lastRefreshed":"2026-10-15T10:00:00-05:00","storeMode":"Registers-only store","notice":"Synthetic demonstration data. Register identifiers and IPs supplied; locations and health are illustrative only.","storeHealth":56,"registers":[{"id":1,"host":"awsd3501r01","ip":"10.8.1.220","uptime":"1d 10h 0m","lastBoot":"Oct 13, 06:00","processesUp":6,"servicesUp":3,"status":"Degraded","history":[1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":23080},{"name":"xstore_mobile","status":"Up","pid":10456},{"name":"xstore-wrapper","status":"Up","pid":7865},{"name":"xstore_mobile-wrapper","status":"Up","pid":1718},{"name":"xenv_ui","status":"Up","pid":18980},{"name":"xenv_eng","status":"Up","pid":22927}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Down"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":2,"host":"awsd3501r02","ip":"10.8.1.221","uptime":"18d 15h 21m","lastBoot":"Sep 26, 06:00","processesUp":2,"servicesUp":1,"status":"Down","history":[0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,1],"processes":[{"name":"xstore","status":"Down","pid":15186},{"name":"xstore_mobile","status":"Down","pid":5447},{"name":"xstore-wrapper","status":"Down","pid":4751},{"name":"xstore_mobile-wrapper","status":"Down","pid":6877},{"name":"xenv_ui","status":"Up","pid":4388},{"name":"xenv_eng","status":"Up","pid":18480}],"services":[{"name":"browser.service","status":"Down"},{"name":"eftlink.service","status":"Down"},{"name":"posi.service","status":"Down"},{"name":"tenderretail.service","status":"Up"}]},{"id":3,"host":"awsd3501r03","ip":"10.8.1.222","uptime":"1d 10h 0m","lastBoot":"Oct 13, 06:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":26080},{"name":"xstore_mobile","status":"Up","pid":13456},{"name":"xstore-wrapper","status":"Up","pid":10865},{"name":"xstore_mobile-wrapper","status":"Up","pid":4718},{"name":"xenv_ui","status":"Up","pid":21980},{"name":"xenv_eng","status":"Up","pid":25927}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":4,"host":"awsd3501r04","ip":"10.8.1.223","uptime":"1d 10h 0m","lastBoot":"Oct 13, 06:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":27080},{"name":"xstore_mobile","status":"Up","pid":14456},{"name":"xstore-wrapper","status":"Up","pid":11865},{"name":"xstore_mobile-wrapper","status":"Up","pid":5718},{"name":"xenv_ui","status":"Up","pid":22980},{"name":"xenv_eng","status":"Up","pid":26927}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":5,"host":"awsd3501r05","ip":"10.8.1.224","uptime":"1d 10h 0m","lastBoot":"Oct 13, 06:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":28080},{"name":"xstore_mobile","status":"Up","pid":15456},{"name":"xstore-wrapper","status":"Up","pid":12865},{"name":"xstore_mobile-wrapper","status":"Up","pid":6718},{"name":"xenv_ui","status":"Up","pid":23980},{"name":"xenv_eng","status":"Up","pid":27927}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]}]},"5004":{"lastRefreshed":"2026-10-15T10:00:00-05:00","storeMode":"Registers-only store","notice":"Synthetic demonstration data. Register identifiers and IPs supplied; locations and health are illustrative only.","storeHealth":54,"registers":[{"id":1,"host":"awsd5004r01","ip":"10.8.1.216","uptime":"12d 7h 24m","lastBoot":"Oct 02, 15:00","processesUp":2,"servicesUp":1,"status":"Down","history":[0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,1,0,0,0,0,0,0,0],"processes":[{"name":"xstore","status":"Down","pid":12021},{"name":"xstore_mobile","status":"Down","pid":9143},{"name":"xstore-wrapper","status":"Down","pid":26472},{"name":"xstore_mobile-wrapper","status":"Down","pid":4309},{"name":"xenv_ui","status":"Up","pid":20705},{"name":"xenv_eng","status":"Up","pid":21095}],"services":[{"name":"browser.service","status":"Down"},{"name":"eftlink.service","status":"Down"},{"name":"posi.service","status":"Down"},{"name":"tenderretail.service","status":"Up"}]},{"id":2,"host":"awsd5004r02","ip":"10.8.1.217","uptime":"13d 16h 28m","lastBoot":"Oct 01, 20:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":11977},{"name":"xstore_mobile","status":"Up","pid":15966},{"name":"xstore-wrapper","status":"Up","pid":5586},{"name":"xstore_mobile-wrapper","status":"Up","pid":23181},{"name":"xenv_ui","status":"Up","pid":8442},{"name":"xenv_eng","status":"Up","pid":9002}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":3,"host":"awsd5004r03","ip":"10.8.1.218","uptime":"13d 16h 28m","lastBoot":"Oct 01, 20:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":14977},{"name":"xstore_mobile","status":"Up","pid":18966},{"name":"xstore-wrapper","status":"Up","pid":8586},{"name":"xstore_mobile-wrapper","status":"Up","pid":26181},{"name":"xenv_ui","status":"Up","pid":11442},{"name":"xenv_eng","status":"Up","pid":12002}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":4,"host":"awsd5004r04","ip":"10.8.1.219","uptime":"13d 16h 28m","lastBoot":"Oct 01, 20:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":15977},{"name":"xstore_mobile","status":"Up","pid":19966},{"name":"xstore-wrapper","status":"Up","pid":9586},{"name":"xstore_mobile-wrapper","status":"Up","pid":27181},{"name":"xenv_ui","status":"Up","pid":12442},{"name":"xenv_eng","status":"Up","pid":13002}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":5,"host":"awsd5004r05","ip":"10.8.1.220","uptime":"13d 16h 28m","lastBoot":"Oct 01, 20:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":16977},{"name":"xstore_mobile","status":"Up","pid":20966},{"name":"xstore-wrapper","status":"Up","pid":10586},{"name":"xstore_mobile-wrapper","status":"Up","pid":28181},{"name":"xenv_ui","status":"Up","pid":13442},{"name":"xenv_eng","status":"Up","pid":14002}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]}]},"5012":{"lastRefreshed":"2026-10-15T10:00:00-05:00","storeMode":"Registers-only store","notice":"Synthetic demonstration data. Register identifiers and IPs supplied; locations and health are illustrative only.","storeHealth":92,"registers":[{"id":1,"host":"awsd5012r01","ip":"10.188.94.68","uptime":"7d 3h 36m","lastBoot":"Oct 07, 20:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":26432},{"name":"xstore_mobile","status":"Up","pid":10417},{"name":"xstore-wrapper","status":"Up","pid":7326},{"name":"xstore_mobile-wrapper","status":"Up","pid":8794},{"name":"xenv_ui","status":"Up","pid":15609},{"name":"xenv_eng","status":"Up","pid":24095}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":2,"host":"awsd5012r02","ip":"10.188.94.69","uptime":"20d 2h 5m","lastBoot":"Sep 24, 20:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,0,1,1,1,0,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":28462},{"name":"xstore_mobile","status":"Up","pid":13064},{"name":"xstore-wrapper","status":"Up","pid":9979},{"name":"xstore_mobile-wrapper","status":"Up","pid":19844},{"name":"xenv_ui","status":"Up","pid":25798},{"name":"xenv_eng","status":"Up","pid":23761}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":3,"host":"awsd5012r03","ip":"10.188.94.70","uptime":"7d 3h 36m","lastBoot":"Oct 07, 20:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":29432},{"name":"xstore_mobile","status":"Up","pid":13417},{"name":"xstore-wrapper","status":"Up","pid":10326},{"name":"xstore_mobile-wrapper","status":"Up","pid":11794},{"name":"xenv_ui","status":"Up","pid":18609},{"name":"xenv_eng","status":"Up","pid":27095}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":4,"host":"awsd5012r04","ip":"10.188.94.71","uptime":"7d 3h 36m","lastBoot":"Oct 07, 20:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":30432},{"name":"xstore_mobile","status":"Up","pid":14417},{"name":"xstore-wrapper","status":"Up","pid":11326},{"name":"xstore_mobile-wrapper","status":"Up","pid":12794},{"name":"xenv_ui","status":"Up","pid":19609},{"name":"xenv_eng","status":"Up","pid":28095}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":5,"host":"awsd5012r05","ip":"10.188.94.72","uptime":"7d 3h 36m","lastBoot":"Oct 07, 20:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":31432},{"name":"xstore_mobile","status":"Up","pid":15417},{"name":"xstore-wrapper","status":"Up","pid":12326},{"name":"xstore_mobile-wrapper","status":"Up","pid":13794},{"name":"xenv_ui","status":"Up","pid":20609},{"name":"xenv_eng","status":"Up","pid":29095}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]}]},"6200":{"lastRefreshed":"2026-10-15T10:00:00-05:00","storeMode":"Registers-only store","notice":"Synthetic demonstration data. Register identifiers and IPs supplied; locations and health are illustrative only.","storeHealth":100,"registers":[{"id":1,"host":"awsd6200r01","ip":"10.188.80.73","uptime":"29d 19h 5m","lastBoot":"Sep 15, 18:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":27707},{"name":"xstore_mobile","status":"Up","pid":28380},{"name":"xstore-wrapper","status":"Up","pid":23134},{"name":"xstore_mobile-wrapper","status":"Up","pid":22201},{"name":"xenv_ui","status":"Up","pid":20574},{"name":"xenv_eng","status":"Up","pid":16379}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":2,"host":"awsd6200r02","ip":"10.188.80.74","uptime":"29d 19h 5m","lastBoot":"Sep 15, 18:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":29707},{"name":"xstore_mobile","status":"Up","pid":30380},{"name":"xstore-wrapper","status":"Up","pid":25134},{"name":"xstore_mobile-wrapper","status":"Up","pid":24201},{"name":"xenv_ui","status":"Up","pid":22574},{"name":"xenv_eng","status":"Up","pid":18379}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":3,"host":"awsd6200r03","ip":"10.188.80.75","uptime":"29d 19h 5m","lastBoot":"Sep 15, 18:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":30707},{"name":"xstore_mobile","status":"Up","pid":31380},{"name":"xstore-wrapper","status":"Up","pid":26134},{"name":"xstore_mobile-wrapper","status":"Up","pid":25201},{"name":"xenv_ui","status":"Up","pid":23574},{"name":"xenv_eng","status":"Up","pid":19379}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":4,"host":"awsd6200r04","ip":"10.188.80.76","uptime":"29d 19h 5m","lastBoot":"Sep 15, 18:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":31707},{"name":"xstore_mobile","status":"Up","pid":32380},{"name":"xstore-wrapper","status":"Up","pid":27134},{"name":"xstore_mobile-wrapper","status":"Up","pid":26201},{"name":"xenv_ui","status":"Up","pid":24574},{"name":"xenv_eng","status":"Up","pid":20379}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]}]},"6237":{"lastRefreshed":"2026-10-15T10:00:00-05:00","storeMode":"Registers-only store","notice":"Synthetic demonstration data. Register identifiers and IPs supplied; locations and health are illustrative only.","storeHealth":85,"registers":[{"id":1,"host":"awsd6237r01","ip":"10.8.1.223","uptime":"6d 11h 51m","lastBoot":"Oct 08, 06:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":5162},{"name":"xstore_mobile","status":"Up","pid":25746},{"name":"xstore-wrapper","status":"Up","pid":6047},{"name":"xstore_mobile-wrapper","status":"Up","pid":22766},{"name":"xenv_ui","status":"Up","pid":27926},{"name":"xenv_eng","status":"Up","pid":28192}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":2,"host":"awsd6237r02","ip":"10.8.1.224","uptime":"30d 3h 51m","lastBoot":"Sep 14, 14:00","processesUp":6,"servicesUp":3,"status":"Degraded","history":[1,1,1,1,1,1,0,1,1,1,1,1,0,1,0,1,1,1,0,1,1,0,0,1],"processes":[{"name":"xstore","status":"Up","pid":15947},{"name":"xstore_mobile","status":"Up","pid":24483},{"name":"xstore-wrapper","status":"Up","pid":27504},{"name":"xstore_mobile-wrapper","status":"Up","pid":11922},{"name":"xenv_ui","status":"Up","pid":5182},{"name":"xenv_eng","status":"Up","pid":17597}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Down"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":3,"host":"awsd6237r03","ip":"10.8.1.225","uptime":"6d 11h 51m","lastBoot":"Oct 08, 06:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":8162},{"name":"xstore_mobile","status":"Up","pid":28746},{"name":"xstore-wrapper","status":"Up","pid":9047},{"name":"xstore_mobile-wrapper","status":"Up","pid":25766},{"name":"xenv_ui","status":"Up","pid":30926},{"name":"xenv_eng","status":"Up","pid":31192}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":4,"host":"awsd6237r04","ip":"10.8.1.226","uptime":"6d 11h 51m","lastBoot":"Oct 08, 06:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":9162},{"name":"xstore_mobile","status":"Up","pid":29746},{"name":"xstore-wrapper","status":"Up","pid":10047},{"name":"xstore_mobile-wrapper","status":"Up","pid":26766},{"name":"xenv_ui","status":"Up","pid":31926},{"name":"xenv_eng","status":"Up","pid":32192}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":5,"host":"awsd6237r05","ip":"10.8.1.227","uptime":"6d 11h 51m","lastBoot":"Oct 08, 06:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":10162},{"name":"xstore_mobile","status":"Up","pid":30746},{"name":"xstore-wrapper","status":"Up","pid":11047},{"name":"xstore_mobile-wrapper","status":"Up","pid":27766},{"name":"xenv_ui","status":"Up","pid":32926},{"name":"xenv_eng","status":"Up","pid":33192}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]}]},"6247":{"lastRefreshed":"2026-10-15T10:00:00-05:00","storeMode":"Registers-only store","notice":"Synthetic demonstration data. Register identifiers and IPs supplied; locations and health are illustrative only.","storeHealth":56,"registers":[{"id":1,"host":"awsd6247r01","ip":"10.8.1.210","uptime":"23d 4h 32m","lastBoot":"Sep 21, 02:00","processesUp":6,"servicesUp":3,"status":"Degraded","history":[1,1,1,1,1,1,0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":26012},{"name":"xstore_mobile","status":"Up","pid":10697},{"name":"xstore-wrapper","status":"Up","pid":2985},{"name":"xstore_mobile-wrapper","status":"Up","pid":10268},{"name":"xenv_ui","status":"Up","pid":14198},{"name":"xenv_eng","status":"Up","pid":7221}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Down"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":2,"host":"awsd6247r02","ip":"10.8.1.211","uptime":"6d 4h 7m","lastBoot":"Oct 08, 06:00","processesUp":2,"servicesUp":1,"status":"Down","history":[0,0,1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,1,0,0,0],"processes":[{"name":"xstore","status":"Down","pid":12297},{"name":"xstore_mobile","status":"Down","pid":28253},{"name":"xstore-wrapper","status":"Down","pid":8613},{"name":"xstore_mobile-wrapper","status":"Down","pid":4188},{"name":"xenv_ui","status":"Up","pid":12468},{"name":"xenv_eng","status":"Up","pid":1119}],"services":[{"name":"browser.service","status":"Down"},{"name":"eftlink.service","status":"Down"},{"name":"posi.service","status":"Down"},{"name":"tenderretail.service","status":"Up"}]},{"id":3,"host":"awsd6247r03","ip":"10.8.1.212","uptime":"23d 4h 32m","lastBoot":"Sep 21, 02:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":29012},{"name":"xstore_mobile","status":"Up","pid":13697},{"name":"xstore-wrapper","status":"Up","pid":5985},{"name":"xstore_mobile-wrapper","status":"Up","pid":13268},{"name":"xenv_ui","status":"Up","pid":17198},{"name":"xenv_eng","status":"Up","pid":10221}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":4,"host":"awsd6247r04","ip":"10.8.1.213","uptime":"23d 4h 32m","lastBoot":"Sep 21, 02:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":30012},{"name":"xstore_mobile","status":"Up","pid":14697},{"name":"xstore-wrapper","status":"Up","pid":6985},{"name":"xstore_mobile-wrapper","status":"Up","pid":14268},{"name":"xenv_ui","status":"Up","pid":18198},{"name":"xenv_eng","status":"Up","pid":11221}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":5,"host":"awsd6247r05","ip":"10.8.1.214","uptime":"23d 4h 32m","lastBoot":"Sep 21, 02:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":31012},{"name":"xstore_mobile","status":"Up","pid":15697},{"name":"xstore-wrapper","status":"Up","pid":7985},{"name":"xstore_mobile-wrapper","status":"Up","pid":15268},{"name":"xenv_ui","status":"Up","pid":19198},{"name":"xenv_eng","status":"Up","pid":12221}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]}]},"6270":{"lastRefreshed":"2026-10-15T10:00:00-05:00","storeMode":"Registers-only store","notice":"Synthetic demonstration data. Register identifiers and IPs supplied; locations and health are illustrative only.","storeHealth":56,"registers":[{"id":1,"host":"awsd6270r01","ip":"10.188.94.70","uptime":"4d 21h 29m","lastBoot":"Oct 10, 14:00","processesUp":2,"servicesUp":1,"status":"Down","history":[0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],"processes":[{"name":"xstore","status":"Down","pid":14383},{"name":"xstore_mobile","status":"Down","pid":28000},{"name":"xstore-wrapper","status":"Down","pid":3234},{"name":"xstore_mobile-wrapper","status":"Down","pid":12906},{"name":"xenv_ui","status":"Up","pid":15712},{"name":"xenv_eng","status":"Up","pid":9323}],"services":[{"name":"browser.service","status":"Down"},{"name":"eftlink.service","status":"Down"},{"name":"posi.service","status":"Down"},{"name":"tenderretail.service","status":"Up"}]},{"id":2,"host":"awsd6270r02","ip":"10.188.94.71","uptime":"11d 14h 17m","lastBoot":"Oct 03, 01:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":10623},{"name":"xstore_mobile","status":"Up","pid":7801},{"name":"xstore-wrapper","status":"Up","pid":23697},{"name":"xstore_mobile-wrapper","status":"Up","pid":20389},{"name":"xenv_ui","status":"Up","pid":21137},{"name":"xenv_eng","status":"Up","pid":5104}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":3,"host":"awsd6270r03","ip":"10.188.94.72","uptime":"11d 14h 17m","lastBoot":"Oct 03, 01:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":13623},{"name":"xstore_mobile","status":"Up","pid":10801},{"name":"xstore-wrapper","status":"Up","pid":26697},{"name":"xstore_mobile-wrapper","status":"Up","pid":23389},{"name":"xenv_ui","status":"Up","pid":24137},{"name":"xenv_eng","status":"Up","pid":8104}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":4,"host":"awsd6270r04","ip":"10.188.94.73","uptime":"11d 14h 17m","lastBoot":"Oct 03, 01:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":14623},{"name":"xstore_mobile","status":"Up","pid":11801},{"name":"xstore-wrapper","status":"Up","pid":27697},{"name":"xstore_mobile-wrapper","status":"Up","pid":24389},{"name":"xenv_ui","status":"Up","pid":25137},{"name":"xenv_eng","status":"Up","pid":9104}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":5,"host":"awsd6270r05","ip":"10.188.94.74","uptime":"11d 14h 17m","lastBoot":"Oct 03, 01:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":15623},{"name":"xstore_mobile","status":"Up","pid":12801},{"name":"xstore-wrapper","status":"Up","pid":28697},{"name":"xstore_mobile-wrapper","status":"Up","pid":25389},{"name":"xenv_ui","status":"Up","pid":26137},{"name":"xenv_eng","status":"Up","pid":10104}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]}]},"7140":{"lastRefreshed":"2026-10-15T10:00:00-05:00","storeMode":"Registers-only store","notice":"Synthetic demonstration data. Register identifiers and IPs supplied; locations and health are illustrative only.","storeHealth":98,"registers":[{"id":1,"host":"awsd7140r01","ip":"10.8.1.175","uptime":"5d 12h 0m","lastBoot":"Oct 10, 00:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":15837},{"name":"xstore_mobile","status":"Up","pid":6034},{"name":"xstore-wrapper","status":"Up","pid":8607},{"name":"xstore_mobile-wrapper","status":"Up","pid":16208},{"name":"xenv_ui","status":"Up","pid":10452},{"name":"xenv_eng","status":"Up","pid":21002}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":2,"host":"awsd7140r02","ip":"10.8.1.176","uptime":"7d 17h 5m","lastBoot":"Oct 07, 20:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":1518},{"name":"xstore_mobile","status":"Up","pid":1301},{"name":"xstore-wrapper","status":"Up","pid":26151},{"name":"xstore_mobile-wrapper","status":"Up","pid":14148},{"name":"xenv_ui","status":"Up","pid":3300},{"name":"xenv_eng","status":"Up","pid":15836}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":3,"host":"awsd7140r03","ip":"10.8.1.177","uptime":"5d 12h 0m","lastBoot":"Oct 10, 00:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":18837},{"name":"xstore_mobile","status":"Up","pid":9034},{"name":"xstore-wrapper","status":"Up","pid":11607},{"name":"xstore_mobile-wrapper","status":"Up","pid":19208},{"name":"xenv_ui","status":"Up","pid":13452},{"name":"xenv_eng","status":"Up","pid":24002}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":4,"host":"awsd7140r04","ip":"10.8.1.178","uptime":"5d 12h 0m","lastBoot":"Oct 10, 00:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":19837},{"name":"xstore_mobile","status":"Up","pid":10034},{"name":"xstore-wrapper","status":"Up","pid":12607},{"name":"xstore_mobile-wrapper","status":"Up","pid":20208},{"name":"xenv_ui","status":"Up","pid":14452},{"name":"xenv_eng","status":"Up","pid":25002}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]},{"id":5,"host":"awsd7140r05","ip":"10.8.1.179","uptime":"5d 12h 0m","lastBoot":"Oct 10, 00:00","processesUp":6,"servicesUp":4,"status":"Healthy","history":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"processes":[{"name":"xstore","status":"Up","pid":20837},{"name":"xstore_mobile","status":"Up","pid":11034},{"name":"xstore-wrapper","status":"Up","pid":13607},{"name":"xstore_mobile-wrapper","status":"Up","pid":21208},{"name":"xenv_ui","status":"Up","pid":15452},{"name":"xenv_eng","status":"Up","pid":26002}],"services":[{"name":"browser.service","status":"Up"},{"name":"eftlink.service","status":"Up"},{"name":"posi.service","status":"Up"},{"name":"tenderretail.service","status":"Up"}]}]}}')

},

}]);
//# sourceMappingURL=sampleMap.chunk.1.js.map