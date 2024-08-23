const fs = require('fs');
const path = require('path');

const DATABASE_PATH = path.join(__dirname, '../database.json');
const EKONOMI_PATH = path.join(__dirname, '../ekonomi.json');
const COIN_SYMBOL = '🪙';

const varliklar = [
  { sembol: 'btc', isim: 'Bitcoin', emoji: '<:bitcoin:1269241637469552723>', minDeger: 1500000, maxDeger: 3000000 },
  { sembol: 'dogecoin', isim: 'Dogecoin', emoji: '<:dogecoin:1269240399009157252>', minDeger: 1.75, maxDeger: 5 },
  { sembol: 'altın', isim: 'Altın', emoji: '<:gold:1269236070625579008>', minDeger: 2000, maxDeger: 6000 },
  { sembol: 'ethereum', isim: 'Ethereum', emoji: '<:ethereum:1269238909800546358>', minDeger: 70000, maxDeger: 140000 },
  { sembol: 'euro', isim: 'Euro', emoji: '<:euro:1269240157459185666>', minDeger: 7.3, maxDeger: 52 },
  { sembol: 'dolar', isim: 'Dolar', emoji: '<:dollar:1269240185489723546>', minDeger: 7.2, maxDeger: 45.9 },
  { sembol: 'elmas', isim: 'Elmas', emoji: '<:diamond:1269239220644483192>', minDeger: 900000, maxDeger: 2000000 }
];

function veritabaniniOku() {
  if (!fs.existsSync(DATABASE_PATH)) {
    fs.writeFileSync(DATABASE_PATH, JSON.stringify({}));
  }
  return JSON.parse(fs.readFileSync(DATABASE_PATH, 'utf8'));
}

function veritabaniniYaz(data) {
  fs.writeFileSync(DATABASE_PATH, JSON.stringify(data, null, 2));
}

function ekonomiyiOku() {
  if (!fs.existsSync(EKONOMI_PATH)) {
    const baslangicEkonomi = {};
    varliklar.forEach(varlik => {
      baslangicEkonomi[varlik.sembol] = Math.random() * (varlik.maxDeger - varlik.minDeger) + varlik.minDeger;
    });
    baslangicEkonomi.sonGuncelleme = Date.now();
    fs.writeFileSync(EKONOMI_PATH, JSON.stringify(baslangicEkonomi, null, 2));
  }
  return JSON.parse(fs.readFileSync(EKONOMI_PATH, 'utf8'));
}

function ekonomiyiGuncelle(data) {
  fs.writeFileSync(EKONOMI_PATH, JSON.stringify(data, null, 2));
}

function cuzdanAl(kullaniciId) {
  const veritabani = veritabaniniOku();
  return veritabani[kullaniciId] || null;
}

function cuzdanOlustur(kullaniciId, kullaniciAdi, mevcutCuzdan = {}) {
  const veritabani = veritabaniniOku();
  veritabani[kullaniciId] = {
    kullaniciAdi: kullaniciAdi,
    bakiye: mevcutCuzdan.bakiye || 0,
    btc: mevcutCuzdan.btc || 0,
    dogecoin: mevcutCuzdan.dogecoin || 0,
    altın: mevcutCuzdan.altın || 0,
    ethereum: mevcutCuzdan.ethereum || 0,
    euro: mevcutCuzdan.euro || 0,
    dolar: mevcutCuzdan.dolar || 0,
    elmas: mevcutCuzdan.elmas || 0
  };
  veritabaniniYaz(veritabani);
  return veritabani[kullaniciId];
}

function cuzdaniGuncelle(kullaniciId, data) {
  const veritabani = veritabaniniOku();
  veritabani[kullaniciId] = { ...veritabani[kullaniciId], ...data };
  veritabaniniYaz(veritabani);
}

// Ekonomiyi otomatik güncelleme fonksiyonu
function ekonomiyiOtomatikGuncelle() {
  const ekonomi = ekonomiyiOku();
  const sonGuncelleme = new Date(ekonomi.sonGuncelleme);
  const simdi = new Date();
  
  if (simdi - sonGuncelleme >= 6 * 60 * 60 * 1000) { // 6 saat
    varliklar.forEach(varlik => {
      ekonomi[varlik.sembol] = Math.random() * (varlik.maxDeger - varlik.minDeger) + varlik.minDeger; // Rastgele değer
    });
    ekonomi.sonGuncelleme = simdi.getTime();
    ekonomiyiGuncelle(ekonomi);
  }
}

// Her saat başı ekonomiyi kontrol et ve gerekirse güncelle
setInterval(ekonomiyiOtomatikGuncelle, 60 * 60 * 1000);

module.exports = {
  veritabaniniOku,
  veritabaniniYaz,
  ekonomiyiOku,
  ekonomiyiGuncelle,
  cuzdanAl,
  cuzdanOlustur,
  cuzdaniGuncelle,
  COIN_SYMBOL,
  varliklar
};