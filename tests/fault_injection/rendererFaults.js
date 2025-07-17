export function injectRendererFault(renderer) {
    console.warn("--- Injecting Renderer Fault (Simulating missing context) ---");
    const originalCtx = renderer.ctx;
    try {
        renderer.ctx = null;
        console.log("Attempting to draw with null context...");
        renderer.clear();
        renderer.drawBackground();
        console.error("Renderer Fault Test: Failed to throw error as expected. [FAIL]");
    } catch (e) {
        console.log("Renderer Fault Test: Successfully caught expected error when drawing with null context. [PASS]");
        console.error("Error details:", e);
    } finally {
        renderer.ctx = originalCtx;
        console.log("Renderer context restored.");
    }
    console.warn("--- Renderer Fault Injection End ---");
}
