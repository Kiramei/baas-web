import type {Asset, UISettings} from '../lib/types.ts';

const MOCK_DELAY = 100;

let mockAssets: Asset = {
  ap: {count: 120, max: 120, time: Date.now() / 1000 - 60},
  creditpoints: {count: 1500000, time: Date.now() / 1000 - 120},
  pyroxene: {count: 24000, time: Date.now() / 1000 - 180},
  tactical_challenge_coin: {count: 500, time: Date.now() / 1000 - 3600},
};


const api = {
  getAssets: async (): Promise<Asset> => {
    mockAssets.ap.count = Math.min(mockAssets.ap.max, mockAssets.ap.count + 5);
    return new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(mockAssets))), MOCK_DELAY));
  },


  getUISettings: async (): Promise<UISettings> => {
    return new Promise(resolve => {
      const returnValue: UISettings = {
        "lang": "",
        "theme": "",
        "startupWidth": 1280,
        "startupHeight": 720,
        "zoomScale": 100,
        "scrollToEnd": true
      }
      resolve(returnValue)
    })
  }

};

export default api;
