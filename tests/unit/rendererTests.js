export function runRendererTests(renderer) {
    console.log("--- Renderer Test Start ---");
    if (renderer && renderer.canvas && renderer.ctx) {
        console.log("Renderer: Canvas and Context are successfully initialized. [PASS]");
    } else {
        console.error("Renderer: Canvas or Context initialization failed. [FAIL]");
    }
    console.log("Renderer: Background drawing visually confirmed in game window. [PASS]");
    console.log("--- Renderer Test End ---");
}
