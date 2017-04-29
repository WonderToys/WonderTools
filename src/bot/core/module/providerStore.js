// -----
//  ProviderStore
// -----

class ProviderStore {
  constructor() {
    this._providers = {};
  }

  // -----
  //  Public
  // -----

  register(name, provider) {
    this._providers[name] = provider;
  }

  get(name) {
    return this._providers[name];
  }
};

// Exports
export default new ProviderStore();