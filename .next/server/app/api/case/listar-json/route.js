/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/case/listar-json/route";
exports.ids = ["app/api/case/listar-json/route"];
exports.modules = {

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcase%2Flistar-json%2Froute&page=%2Fapi%2Fcase%2Flistar-json%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcase%2Flistar-json%2Froute.ts&appDir=%2FUsers%2FPaula2%2Faura-psel%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2FPaula2%2Faura-psel&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcase%2Flistar-json%2Froute&page=%2Fapi%2Fcase%2Flistar-json%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcase%2Flistar-json%2Froute.ts&appDir=%2FUsers%2FPaula2%2Faura-psel%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2FPaula2%2Faura-psel&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_Paula2_aura_psel_src_app_api_case_listar_json_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/app/api/case/listar-json/route.ts */ \"(rsc)/./src/app/api/case/listar-json/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/case/listar-json/route\",\n        pathname: \"/api/case/listar-json\",\n        filename: \"route\",\n        bundlePath: \"app/api/case/listar-json/route\"\n    },\n    resolvedPagePath: \"/Users/Paula2/aura-psel/src/app/api/case/listar-json/route.ts\",\n    nextConfigOutput,\n    userland: _Users_Paula2_aura_psel_src_app_api_case_listar_json_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZjYXNlJTJGbGlzdGFyLWpzb24lMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmNhc2UlMkZsaXN0YXItanNvbiUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmNhc2UlMkZsaXN0YXItanNvbiUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRlBhdWxhMiUyRmF1cmEtcHNlbCUyRnNyYyUyRmFwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9JTJGVXNlcnMlMkZQYXVsYTIlMkZhdXJhLXBzZWwmaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQStGO0FBQ3ZDO0FBQ3FCO0FBQ2E7QUFDMUY7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLHlHQUFtQjtBQUMzQztBQUNBLGNBQWMsa0VBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxzREFBc0Q7QUFDOUQ7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDMEY7O0FBRTFGIiwic291cmNlcyI6WyIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIi9Vc2Vycy9QYXVsYTIvYXVyYS1wc2VsL3NyYy9hcHAvYXBpL2Nhc2UvbGlzdGFyLWpzb24vcm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL2Nhc2UvbGlzdGFyLWpzb24vcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9jYXNlL2xpc3Rhci1qc29uXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9jYXNlL2xpc3Rhci1qc29uL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiL1VzZXJzL1BhdWxhMi9hdXJhLXBzZWwvc3JjL2FwcC9hcGkvY2FzZS9saXN0YXItanNvbi9yb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHdvcmtBc3luY1N0b3JhZ2UsXG4gICAgICAgIHdvcmtVbml0QXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcase%2Flistar-json%2Froute&page=%2Fapi%2Fcase%2Flistar-json%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcase%2Flistar-json%2Froute.ts&appDir=%2FUsers%2FPaula2%2Faura-psel%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2FPaula2%2Faura-psel&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(rsc)/./src/app/api/case/listar-json/route.ts":
/*!***********************************************!*\
  !*** ./src/app/api/case/listar-json/route.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! fs */ \"fs\");\n/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! path */ \"path\");\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_2__);\n\n\n\nasync function GET(request) {\n    try {\n        const { searchParams } = new URL(request.url);\n        const candidatoId = searchParams.get('candidato_id');\n        const dataDir = path__WEBPACK_IMPORTED_MODULE_2__.join(process.cwd(), 'data', 'case-entregas');\n        // Se a pasta não existe, retorna vazio\n        if (!fs__WEBPACK_IMPORTED_MODULE_1__.existsSync(dataDir)) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                success: true,\n                data: [],\n                source: 'json',\n                message: 'Nenhuma entrega encontrada'\n            });\n        }\n        // Se busca por candidato específico\n        if (candidatoId) {\n            const files = fs__WEBPACK_IMPORTED_MODULE_1__.readdirSync(dataDir).filter((f)=>f.endsWith('.json') && f !== '_index.json');\n            for (const file of files){\n                const filePath = path__WEBPACK_IMPORTED_MODULE_2__.join(dataDir, file);\n                const fileContent = fs__WEBPACK_IMPORTED_MODULE_1__.readFileSync(filePath, 'utf-8');\n                const entrega = JSON.parse(fileContent);\n                if (entrega.candidato_id === candidatoId) {\n                    return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                        success: true,\n                        data: entrega,\n                        source: 'json'\n                    });\n                }\n            }\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                success: true,\n                data: null,\n                source: 'json',\n                message: 'Entrega não encontrada para este candidato'\n            });\n        }\n        // Retornar todas as entregas\n        const indexPath = path__WEBPACK_IMPORTED_MODULE_2__.join(dataDir, '_index.json');\n        if (fs__WEBPACK_IMPORTED_MODULE_1__.existsSync(indexPath)) {\n            const index = JSON.parse(fs__WEBPACK_IMPORTED_MODULE_1__.readFileSync(indexPath, 'utf-8'));\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                success: true,\n                data: index,\n                source: 'json',\n                total: index.length\n            });\n        }\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: true,\n            data: [],\n            source: 'json',\n            message: 'Índice não encontrado'\n        });\n    } catch (error) {\n        console.error('Erro ao listar entregas JSON:', error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: false,\n            error: error.message\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwL2FwaS9jYXNlL2xpc3Rhci1qc29uL3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUF1RDtBQUMvQjtBQUNJO0FBRXJCLGVBQWVHLElBQUlDLE9BQW9CO0lBQzVDLElBQUk7UUFDRixNQUFNLEVBQUVDLFlBQVksRUFBRSxHQUFHLElBQUlDLElBQUlGLFFBQVFHLEdBQUc7UUFDNUMsTUFBTUMsY0FBY0gsYUFBYUksR0FBRyxDQUFDO1FBRXJDLE1BQU1DLFVBQVVSLHNDQUFTLENBQUNVLFFBQVFDLEdBQUcsSUFBSSxRQUFRO1FBRWpELHVDQUF1QztRQUN2QyxJQUFJLENBQUNaLDBDQUFhLENBQUNTLFVBQVU7WUFDM0IsT0FBT1YscURBQVlBLENBQUNlLElBQUksQ0FBQztnQkFDdkJDLFNBQVM7Z0JBQ1RDLE1BQU0sRUFBRTtnQkFDUkMsUUFBUTtnQkFDUkMsU0FBUztZQUNYO1FBQ0Y7UUFFQSxvQ0FBb0M7UUFDcEMsSUFBSVgsYUFBYTtZQUNmLE1BQU1ZLFFBQVFuQiwyQ0FBYyxDQUFDUyxTQUFTWSxNQUFNLENBQUNDLENBQUFBLElBQUtBLEVBQUVDLFFBQVEsQ0FBQyxZQUFZRCxNQUFNO1lBRS9FLEtBQUssTUFBTUUsUUFBUUwsTUFBTztnQkFDeEIsTUFBTU0sV0FBV3hCLHNDQUFTLENBQUNRLFNBQVNlO2dCQUNwQyxNQUFNRSxjQUFjMUIsNENBQWUsQ0FBQ3lCLFVBQVU7Z0JBQzlDLE1BQU1HLFVBQVVDLEtBQUtDLEtBQUssQ0FBQ0o7Z0JBRTNCLElBQUlFLFFBQVFHLFlBQVksS0FBS3hCLGFBQWE7b0JBQ3hDLE9BQU9SLHFEQUFZQSxDQUFDZSxJQUFJLENBQUM7d0JBQ3ZCQyxTQUFTO3dCQUNUQyxNQUFNWTt3QkFDTlgsUUFBUTtvQkFDVjtnQkFDRjtZQUNGO1lBRUEsT0FBT2xCLHFEQUFZQSxDQUFDZSxJQUFJLENBQUM7Z0JBQ3ZCQyxTQUFTO2dCQUNUQyxNQUFNO2dCQUNOQyxRQUFRO2dCQUNSQyxTQUFTO1lBQ1g7UUFDRjtRQUVBLDZCQUE2QjtRQUM3QixNQUFNYyxZQUFZL0Isc0NBQVMsQ0FBQ1EsU0FBUztRQUVyQyxJQUFJVCwwQ0FBYSxDQUFDZ0MsWUFBWTtZQUM1QixNQUFNQyxRQUFRSixLQUFLQyxLQUFLLENBQUM5Qiw0Q0FBZSxDQUFDZ0MsV0FBVztZQUNwRCxPQUFPakMscURBQVlBLENBQUNlLElBQUksQ0FBQztnQkFDdkJDLFNBQVM7Z0JBQ1RDLE1BQU1pQjtnQkFDTmhCLFFBQVE7Z0JBQ1JpQixPQUFPRCxNQUFNRSxNQUFNO1lBQ3JCO1FBQ0Y7UUFFQSxPQUFPcEMscURBQVlBLENBQUNlLElBQUksQ0FBQztZQUN2QkMsU0FBUztZQUNUQyxNQUFNLEVBQUU7WUFDUkMsUUFBUTtZQUNSQyxTQUFTO1FBQ1g7SUFFRixFQUFFLE9BQU9rQixPQUFZO1FBQ25CQyxRQUFRRCxLQUFLLENBQUMsaUNBQWlDQTtRQUMvQyxPQUFPckMscURBQVlBLENBQUNlLElBQUksQ0FBQztZQUN2QkMsU0FBUztZQUNUcUIsT0FBT0EsTUFBTWxCLE9BQU87UUFDdEIsR0FBRztZQUFFb0IsUUFBUTtRQUFJO0lBQ25CO0FBQ0YiLCJzb3VyY2VzIjpbIi9Vc2Vycy9QYXVsYTIvYXVyYS1wc2VsL3NyYy9hcHAvYXBpL2Nhc2UvbGlzdGFyLWpzb24vcm91dGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlcXVlc3QsIE5leHRSZXNwb25zZSB9IGZyb20gJ25leHQvc2VydmVyJ1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBHRVQocmVxdWVzdDogTmV4dFJlcXVlc3QpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCB7IHNlYXJjaFBhcmFtcyB9ID0gbmV3IFVSTChyZXF1ZXN0LnVybClcbiAgICBjb25zdCBjYW5kaWRhdG9JZCA9IHNlYXJjaFBhcmFtcy5nZXQoJ2NhbmRpZGF0b19pZCcpXG5cbiAgICBjb25zdCBkYXRhRGlyID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdkYXRhJywgJ2Nhc2UtZW50cmVnYXMnKVxuXG4gICAgLy8gU2UgYSBwYXN0YSBuw6NvIGV4aXN0ZSwgcmV0b3JuYSB2YXppb1xuICAgIGlmICghZnMuZXhpc3RzU3luYyhkYXRhRGlyKSkge1xuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHtcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgZGF0YTogW10sXG4gICAgICAgIHNvdXJjZTogJ2pzb24nLFxuICAgICAgICBtZXNzYWdlOiAnTmVuaHVtYSBlbnRyZWdhIGVuY29udHJhZGEnXG4gICAgICB9KVxuICAgIH1cblxuICAgIC8vIFNlIGJ1c2NhIHBvciBjYW5kaWRhdG8gZXNwZWPDrWZpY29cbiAgICBpZiAoY2FuZGlkYXRvSWQpIHtcbiAgICAgIGNvbnN0IGZpbGVzID0gZnMucmVhZGRpclN5bmMoZGF0YURpcikuZmlsdGVyKGYgPT4gZi5lbmRzV2l0aCgnLmpzb24nKSAmJiBmICE9PSAnX2luZGV4Lmpzb24nKVxuXG4gICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSBwYXRoLmpvaW4oZGF0YURpciwgZmlsZSlcbiAgICAgICAgY29uc3QgZmlsZUNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZVBhdGgsICd1dGYtOCcpXG4gICAgICAgIGNvbnN0IGVudHJlZ2EgPSBKU09OLnBhcnNlKGZpbGVDb250ZW50KVxuXG4gICAgICAgIGlmIChlbnRyZWdhLmNhbmRpZGF0b19pZCA9PT0gY2FuZGlkYXRvSWQpIHtcbiAgICAgICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oe1xuICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgIGRhdGE6IGVudHJlZ2EsXG4gICAgICAgICAgICBzb3VyY2U6ICdqc29uJ1xuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHtcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgc291cmNlOiAnanNvbicsXG4gICAgICAgIG1lc3NhZ2U6ICdFbnRyZWdhIG7Do28gZW5jb250cmFkYSBwYXJhIGVzdGUgY2FuZGlkYXRvJ1xuICAgICAgfSlcbiAgICB9XG5cbiAgICAvLyBSZXRvcm5hciB0b2RhcyBhcyBlbnRyZWdhc1xuICAgIGNvbnN0IGluZGV4UGF0aCA9IHBhdGguam9pbihkYXRhRGlyLCAnX2luZGV4Lmpzb24nKVxuXG4gICAgaWYgKGZzLmV4aXN0c1N5bmMoaW5kZXhQYXRoKSkge1xuICAgICAgY29uc3QgaW5kZXggPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhpbmRleFBhdGgsICd1dGYtOCcpKVxuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHtcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgZGF0YTogaW5kZXgsXG4gICAgICAgIHNvdXJjZTogJ2pzb24nLFxuICAgICAgICB0b3RhbDogaW5kZXgubGVuZ3RoXG4gICAgICB9KVxuICAgIH1cblxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgZGF0YTogW10sXG4gICAgICBzb3VyY2U6ICdqc29uJyxcbiAgICAgIG1lc3NhZ2U6ICfDjW5kaWNlIG7Do28gZW5jb250cmFkbydcbiAgICB9KVxuXG4gIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvIGFvIGxpc3RhciBlbnRyZWdhcyBKU09OOicsIGVycm9yKVxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7XG4gICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgIGVycm9yOiBlcnJvci5tZXNzYWdlXG4gICAgfSwgeyBzdGF0dXM6IDUwMCB9KVxuICB9XG59XG4iXSwibmFtZXMiOlsiTmV4dFJlc3BvbnNlIiwiZnMiLCJwYXRoIiwiR0VUIiwicmVxdWVzdCIsInNlYXJjaFBhcmFtcyIsIlVSTCIsInVybCIsImNhbmRpZGF0b0lkIiwiZ2V0IiwiZGF0YURpciIsImpvaW4iLCJwcm9jZXNzIiwiY3dkIiwiZXhpc3RzU3luYyIsImpzb24iLCJzdWNjZXNzIiwiZGF0YSIsInNvdXJjZSIsIm1lc3NhZ2UiLCJmaWxlcyIsInJlYWRkaXJTeW5jIiwiZmlsdGVyIiwiZiIsImVuZHNXaXRoIiwiZmlsZSIsImZpbGVQYXRoIiwiZmlsZUNvbnRlbnQiLCJyZWFkRmlsZVN5bmMiLCJlbnRyZWdhIiwiSlNPTiIsInBhcnNlIiwiY2FuZGlkYXRvX2lkIiwiaW5kZXhQYXRoIiwiaW5kZXgiLCJ0b3RhbCIsImxlbmd0aCIsImVycm9yIiwiY29uc29sZSIsInN0YXR1cyJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./src/app/api/case/listar-json/route.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcase%2Flistar-json%2Froute&page=%2Fapi%2Fcase%2Flistar-json%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcase%2Flistar-json%2Froute.ts&appDir=%2FUsers%2FPaula2%2Faura-psel%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2FPaula2%2Faura-psel&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();