import './style.css'
import { GeometryCore } from "./lib/geometry-core.ts";

(function () {
    document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
      <div>
        <canvas id="canvas"></canvas>
      </div>
    `;

    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const geometryCore = new GeometryCore(canvas);

    geometryCore.initialize();
    geometryCore.start();
})();
