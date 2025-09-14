import './style.css'
import { GeometryCore } from "./lib/geometry-core.ts";
import { SplashScreen } from "./lib/ui/splash-screen.ts";
import { TitleScreen } from "./lib/ui/title-screen.ts";

(function () {
  // Setup initial HTML structure
  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
        <div>
            <!-- Splash Screen Container -->
            <div class="splash-screen">
                <div class="grid-background"></div>
                <div class="logo-container logo-1">
                    <div class="geometric-logo">
                        <div class="triangle triangle-1"></div>
                        <div class="triangle triangle-2"></div>
                        <div class="triangle triangle-3"></div>
                        <div class="circle center-circle"></div>
                    </div>
                </div>
                <div class="logo-container logo-2">
                    <div class="geometric-logo-2">
                        <div class="hexagon"></div>
                        <div class="inner-shapes">
                            <div class="diamond diamond-1"></div>
                            <div class="diamond diamond-2"></div>
                            <div class="diamond diamond-3"></div>
                        </div>
                    </div>
                </div>
                <div class="floating-elements">
                    <div class="float-shape triangle-float"></div>
                    <div class="float-shape circle-float"></div>
                    <div class="float-shape square-float"></div>
                    <div class="float-shape diamond-float"></div>
                </div>
            </div>
            
            <!-- Title Screen Container -->
            <div id="title-container"></div>
            
            <!-- Game Canvas -->
            <canvas id="canvas" style="display: none;"></canvas>
        </div>
    `;

  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const splashContainer = document.getElementsByClassName("splash-screen")[0] as HTMLDivElement;
  const titleContainer = document.getElementById("title-container") as HTMLDivElement;

  // Initialize splash screen
  const splashScreen = new SplashScreen(splashContainer);

  // Initialize title screen with callbacks
  const titleScreen = new TitleScreen(titleContainer, {
    onStartGame: () => {
      console.log("Starting game from title screen...");
      startGame();
    },
    onJoinServer: () => {
      console.log("Join server logic here");
      // Add server browser or direct join logic
    },
    onShowInfo: () => {
      console.log("Show game info modal");
      // Add info modal logic
    },
    onShowSettings: () => {
      console.log("Show settings modal");
      // Add settings modal logic
    },
    onShowCredits: () => {
      console.log("Show credits modal");
      // Add credits modal logic
    }
  });

  // titleScreen.setLogos([
  //     "/assets/logo1.png",
  //     "/assets/logo2.png", 
  //     "/assets/logo3.png"
  // ]);

  function startGame() {
    titleScreen.fadeOut().then(() => {
      canvas.style.display = 'block';

      // Initialize and start the game
      const geometryCore = new GeometryCore(canvas);
      geometryCore.initialize();
      geometryCore.start();
    });
  }

  function showTitleScreen() {
    canvas.style.display = 'none';
    titleScreen.show();
  }

  // titleScreen.hide();
  // splashScreen.start().then(() => {
    // console.log("Splash screen finished");
    splashContainer.style.display = 'none';
    titleScreen.show();
  // });
})();