import { GAME_DEBUG_MODE } from '../constants.js';

export class DependencyInjector {
    constructor() {
        if (GAME_DEBUG_MODE) console.log("🔧 DependencyInjector initialized. All managers will be registered here.");
        this.services = new Map();
    }

    /**
     * \uad00\ub9ac\uc790(\uc11c\ube44\uc2a4)\ub97c \uc2dc\uc2a4\ud15c\uc5d0 \ub4f1\ub85d\ud569\ub2c8\ub2e4.
     * @param {object} serviceInstance - \ub4f1\ub85d\ud560 \uad00\ub9ac\uc790 \uc778\uc2a4\ud134\uc2a4
     * @param {string} [name=serviceInstance.constructor.name] - \ub4f1\ub85d\ud560 \uc774\ub984 (\uae30\ubcf8\uac12: \ud074\ub798\uc2a4 \uc774\ub984)
     */
    register(serviceInstance, name) {
        const serviceName = name || serviceInstance.constructor.name;
        if (this.services.has(serviceName)) {
            console.warn(`[DependencyInjector] Service '${serviceName}' is already registered. Overwriting.`);
        }
        this.services.set(serviceName, serviceInstance);
        // if (GAME_DEBUG_MODE) console.log(`[DependencyInjector] Registered: ${serviceName}`);
    }

    /**
     * \ub4f1\ub85d\ub41c \uad00\ub9ac\uc790(\uc11c\ube44\uc2a4)\ub97c \uc774\ub984\uc73c\ub85c \uac00\uc838\uc624\ubbc0\ub85c\uc11c
     * @param {string} serviceName - \uac00\uc838\uc624\uc77c \uad00\ub9ac\uc790\uc758 \uc774\ub984 (\ud074\ub798\uc2a4 \uc774\ub984)
     * @returns {object | undefined}
     */
    get(serviceName) {
        const service = this.services.get(serviceName);
        if (!service) {
            console.warn(`%c[DependencyInjector] Service '${serviceName}' not found. It might not have been registered.`, 'color: orange;');
        }
        return service;
    }

    /**
     * 'update' \uba54\uc11c\ub4dc\ub97c \uac16\uc9c0\ub294 \ubaa8\ub4e0 \ub4f1\ub85d\ub41c \uad00\ub9ac\uc790\ub97c \ubc18\ud658\ud569\ub2c8\ub2e4.
     * @returns {object[]}
     */
    getAllUpdateable() {
        return Array.from(this.services.values()).filter(s => typeof s.update === 'function');
    }

    /**
     * 'draw' \uba54\uc11c\ub4dc\ub97c \uac16\uc9c0\ub294 \ubaa8\ub4e0 \ub4f1\ub85d\ub41c \uad00\ub9ac\uc790\ub97c \ubc18\ud658\ud569\ub2c8\ub2e4.
     * @returns {object[]}
     */
    getAllDrawable() {
        return Array.from(this.services.values()).filter(s => typeof s.draw === 'function');
    }
}
