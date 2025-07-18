// js/managers/LayerEngine.js

export class LayerEngine {
    constructor(renderer, cameraEngine) {
        console.log("\ud83c\udcc3 LayerEngine initialized. Ready to manage rendering layers. \ud83c\udcc3");
        this.renderer = renderer;
        this.cameraEngine = cameraEngine;
        this.layers = [];
    }

    // 'useCamera' determines whether camera transformations are applied when drawing this layer
    registerLayer(name, drawFunction, zIndex, useCamera = false) {
        const existingLayerIndex = this.layers.findIndex(layer => layer.name === name);
        if (existingLayerIndex !== -1) {
            console.warn(`[LayerEngine] Layer '${name}' already exists. Overwriting.`);
            this.layers[existingLayerIndex] = { name, drawFunction, zIndex, useCamera };
        } else {
            this.layers.push({ name, drawFunction, zIndex, useCamera });
        }
        this.layers.sort((a, b) => a.zIndex - b.zIndex);
        console.log(`[LayerEngine] Registered layer: ${name} with zIndex: ${zIndex}, useCamera: ${useCamera}`);
    }

    draw() {
        this.renderer.clear();
        this.renderer.drawBackground();

        for (const layer of this.layers) {
            this.renderer.ctx.save();

            // Apply camera transformations only if this layer opts in
            if (layer.useCamera && this.cameraEngine) {
                this.cameraEngine.applyTransform(this.renderer.ctx);
            }

            layer.drawFunction(this.renderer.ctx);
            this.renderer.ctx.restore();
        }
    }
}
