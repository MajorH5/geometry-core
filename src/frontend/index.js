import { GeometryCore } from "./lib/geometry-core.js";

(function () {
    const canvas = document.getElementById("canvas");
    const geometryCore = new GeometryCore(canvas);

    geometryCore.initialize();
    geometryCore.start();
})();