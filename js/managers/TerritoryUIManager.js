export class TerritoryUIManager {
    constructor() {
        console.log("🖼️ TerritoryUIManager initialized. Managing the visual aspects of your territory.");
        this.tooltipElement = this.createTooltipElement();
        document.body.appendChild(this.tooltipElement);
        this.tooltipElement.style.display = 'none';
        this.animatedIcon = null;
        this.animationInterval = null;
    }

    createTooltipElement() {
        const tooltip = document.createElement('div');
        tooltip.style.position = 'absolute';
        tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        tooltip.style.color = 'white';
        tooltip.style.padding = '5px';
        tooltip.style.borderRadius = '5px';
        tooltip.style.fontSize = '12px';
        tooltip.style.zIndex = '10';
        return tooltip;
    }

    showTooltip(text, x, y) {
        this.tooltipElement.textContent = text;
        this.tooltipElement.style.left = `${x + 10}px`;
        this.tooltipElement.style.top = `${y + 10}px`;
        this.tooltipElement.style.display = 'block';
    }

    hideTooltip() {
        this.tooltipElement.style.display = 'none';
    }

    animateIcon(iconKey) {
        if (this.animatedIcon !== iconKey) {
            this.stopAnimation(this.animatedIcon);
            this.animatedIcon = iconKey;
            let scale = 1;
            let direction = 0.05;
            this.animationInterval = setInterval(() => {
                const iconElement = document.querySelector(`img.asset-${iconKey}`);
                if (iconElement) {
                    scale += direction;
                    if (scale > 1.1 || scale < 1) {
                        direction *= -1;
                    }
                    iconElement.style.transform = `scale(${scale})`;
                }
            }, 100);
        }
    }

    stopAnimation(iconKey) {
        if (this.animatedIcon === iconKey && this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animatedIcon = null;
            const iconElement = document.querySelector(`img.asset-${iconKey}`);
            if (iconElement) {
                iconElement.style.transform = `scale(1)`;
            }
        }
    }

    cleanup() {
        this.hideTooltip();
        this.stopAnimation(this.animatedIcon);
        console.log("[TerritoryUIManager] Cleaned up UI elements for scene transition.");
    }

    draw(ctx) {
        // UI 요소 그리기 (툴팁은 HTML 요소로 처리하므로 canvas에 그리지 않음)
    }
}
