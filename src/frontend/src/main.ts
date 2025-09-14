import './style.css'
import { GeometryCore } from "./lib/geometry-core.ts";
import { SplashScreen } from "./lib/ui/splash-screen.ts";

(function () {
    // document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    //   <div>
    //     <div id="splash-container"></div>
    //     <canvas id="canvas" style="display: none;"></canvas>
    //   </div>
    // `;
    document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
      <div>
        <canvas id="canvas"></canvas>
      </div>
    `;

    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    // const splashContainer = document.getElementById("splash-container") as HTMLDivElement;

    // Initialize splash screen
    // const splashScreen = new SplashScreen(splashContainer);
    
    // Start splash sequence
    // splashScreen.start().then(() => {
    //     // Hide splash and show game
    //     console.log("starting")
    //     splashContainer.style.display = 'none';
    //     canvas.style.display = 'block';
        
        // Initialize game
        const geometryCore = new GeometryCore(canvas);
        geometryCore.initialize();
        geometryCore.start();
    // });
})();