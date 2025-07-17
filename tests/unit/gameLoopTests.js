export function runGameLoopTests(gameLoop) {
    console.log("--- GameLoop Test Start ---");
    if (gameLoop && gameLoop.isRunning) {
        console.log("GameLoop: Loop is running. [PASS]");
    } else {
        console.error("GameLoop: Loop is not running. [FAIL]");
    }
    console.log("--- GameLoop Test End ---");
}
