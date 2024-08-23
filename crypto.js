const economy = require('./economy');

class Crypto {
  constructor() {
    this.wallets = new Map();
  }

  createWallet(userId, username) {
    if (!this.wallets.has(userId)) {
      this.wallets.set(userId, {
        username: username,
        balance: 1000,
        assets: new Map(economy.getAllCurrencies().map(c => [c.symbol, 0]))
      });
    }
    return this.wallets.get(userId);
  }

  buyAsset(userId, symbol, amount) {
    const wallet = this.wallets.get(userId);
    if (!wallet) return false;

    const price = economy.getCurrencyPrice(symbol);
    const cost = price * amount;

    if (wallet.balance >= cost) {
      wallet.balance -= cost;
      wallet.assets.set(symbol, (wallet.assets.get(symbol) || 0) + amount);
      return true;
    }
    return false;
  }

  getWallet(userId) {
    return this.wallets.get(userId);
  }

  getAllWallets() {
    return Array.from(this.wallets.values());
  }

  getTotalValue(wallet) {
    let total = wallet.balance;
    wallet.assets.forEach((amount, symbol) => {
      total += amount * economy.getCurrencyPrice(symbol);
    });
    return total;
  }
}

module.exports = new Crypto();