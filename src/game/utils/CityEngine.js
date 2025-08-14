import { cityData } from '../data/city.js';

/**
 * 월드맵의 도시 정보를 관리하는 엔진
 */
class CityEngine {
    constructor() {
        this.cities = [];
        this.initializeCities();
    }

    /**
     * 데이터 파일로부터 도시 정보를 초기화합니다.
     */
    initializeCities() {
        for (const cityId in cityData) {
            this.cities.push(cityData[cityId]);
        }
    }

    /**
     * 모든 도시의 목록을 반환합니다.
     * @returns {Array<object>}
     */
    getCities() {
        return this.cities;
    }
}

export const cityEngine = new CityEngine();
