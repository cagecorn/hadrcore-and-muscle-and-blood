// js/managers/IdManager.js

const DB_NAME = 'game_id_db';
const DB_VERSION = 1;
const STORE_NAME = 'ids';
const CACHE_NAME = 'id-manager-cache-v1';

export class IdManager {
    constructor() {
        console.log("\ud83d\udd22 IdManager initialized. Building the universal language. \ud83d\udd22");
        this.db = null; // IndexedDB instance
        this.cache = null; // Cache API instance
        this.idMap = new Map(); // In-memory map of ID to data
    }

    /**
     * Initialize IdManager by opening IndexedDB and Cache API.
     * @returns {Promise<void>}
     */
    async initialize() {
        console.log("[IdManager] Initializing IndexedDB and Cache API...");
        try {
            await this._openIndexedDB();
            await this._openCacheAPI();
            await this.loadAllIdsFromDB();
            console.log("[IdManager] IndexedDB and Cache API initialized successfully.");
        } catch (error) {
            console.error("[IdManager] Failed to initialize IdManager:", error);
            throw error;
        }
    }

    /**
     * Open IndexedDB.
     * @private
     */
    _openIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                    console.log(`[IdManager] IndexedDB object store '${STORE_NAME}' created.`);
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log("[IdManager] IndexedDB opened.");
                resolve();
            };

            request.onerror = (event) => {
                console.error("[IdManager] IndexedDB error:", event.target.errorCode);
                reject(event.target.error);
            };
        });
    }

    /**
     * Open the Cache API. Mainly for resource caching.
     * @private
     */
    async _openCacheAPI() {
        try {
            this.cache = await caches.open(CACHE_NAME);
            console.log(`[IdManager] Cache API '${CACHE_NAME}' opened.`);
        } catch (error) {
            console.error("[IdManager] Cache API error:", error);
            throw error;
        }
    }

    /**
     * Add or update an ID-data mapping.
     * @param {string} id
     * @param {object} data
     * @returns {Promise<void>}
     */
    async addOrUpdateId(id, data) {
        if (!this.db) {
            console.error("[IdManager] IndexedDB not initialized.");
            throw new Error("IndexedDB not initialized.");
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put({ id, data });

            request.onsuccess = () => {
                this.idMap.set(id, data);
                console.log(`[IdManager] ID '${id}' added/updated in IndexedDB and memory.`);
                resolve();
            };

            request.onerror = (event) => {
                console.error(`[IdManager] Failed to add/update ID '${id}':`, event.target.error);
                reject(event.target.error);
            };
        });
    }

    /**
     * Retrieve data for a given ID.
     * @param {string} id
     * @returns {Promise<object | undefined>}
     */
    async get(id) {
        if (this.idMap.has(id)) {
            return this.idMap.get(id);
        }

        if (!this.db) {
            console.warn("[IdManager] IndexedDB not initialized for lookup, returning undefined for:", id);
            return undefined;
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(id);

            request.onsuccess = (event) => {
                const result = event.target.result;
                if (result) {
                    this.idMap.set(id, result.data);
                    resolve(result.data);
                } else {
                    resolve(undefined);
                }
            };

            request.onerror = (event) => {
                console.error(`[IdManager] Failed to get ID '${id}' from IndexedDB:`, event.target.error);
                reject(event.target.error);
            };
        });
    }

    /**
     * Load all ID mappings from IndexedDB into memory.
     * @returns {Promise<void>}
     */
    async loadAllIdsFromDB() {
        if (!this.db) {
            console.warn("[IdManager] IndexedDB not initialized, cannot load all IDs.");
            return;
        }

        this.idMap.clear();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.openCursor();

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    this.idMap.set(cursor.value.id, cursor.value.data);
                    cursor.continue();
                } else {
                    console.log(`[IdManager] All IDs (${this.idMap.size}) loaded into memory.`);
                    resolve();
                }
            };

            request.onerror = (event) => {
                console.error("[IdManager] Failed to load all IDs from IndexedDB:", event.target.error);
                reject(event.target.error);
            };
        });
    }

    /**
     * Example: cache a resource URL using Cache API.
     * @param {string} url
     * @returns {Promise<void>}
     */
    async cacheResource(url) {
        if (!this.cache) {
            console.warn("[IdManager] Cache API not initialized, cannot cache resource.");
            return;
        }
        try {
            await this.cache.add(url);
            console.log(`[IdManager] Resource '${url}' cached.`);
        } catch (error) {
            console.error(`[IdManager] Failed to cache resource '${url}':`, error);
        }
    }

    /**
     * Example: get a cached resource response.
     * @param {string} url
     * @returns {Promise<Response | undefined>}
     */
    async getCachedResource(url) {
        if (!this.cache) {
            console.warn("[IdManager] Cache API not initialized, cannot get cached resource.");
            return undefined;
        }
        try {
            const response = await this.cache.match(url);
            if (response) {
                console.log(`[IdManager] Resource '${url}' found in cache.`);
            } else {
                console.log(`[IdManager] Resource '${url}' not found in cache.`);
            }
            return response;
        } catch (error) {
            console.error(`[IdManager] Failed to get cached resource '${url}':`, error);
            return undefined;
        }
    }
}
