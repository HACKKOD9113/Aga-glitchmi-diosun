const { MessageEmbed } = require('discord.js');
const fs = require('fs');

// Ekonomi verilerini okuma fonksiyonu
function ekonomiyiOku() {
  try {
    const data = fs.readFileSync('ekonomi.json', 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Ekonomi dosyası okunamadı:', err);
    return {};
  }
}

// Ekonomi verilerini yazma fonksiyonu
function ekonomiyiYaz(data) {
  try {
    fs.writeFileSync('ekonomi.json', JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Ekonomi dosyası yazılamadı:', err);
  }
}

// Varlıklar ve değer aralıkları
const varliklar = [
  { sembol: 'btc', isim: 'Bitcoin', emoji: '�比', minDeger: 1500000, maxDeger: 3000000 },
  { sembol: 'dogecoin', isim: 'Dogecoin', emoji: '🐕', minDeger: 1.75, maxDeger: 5 },
  { sembol: 'altın', isim: 'Altın', emoji: '🥇', minDeger: 2000, maxDeger: 6000 },
  { sembol: 'ethereum', isim: 'Ethereum', emoji: '💠', minDeger: 70000, maxDeger: 140000 },
  { sembol: 'euro', isim: 'Euro', emoji: '🇪🇺', minDeger: 7.3, maxDeger: 52 },
  { sembol: 'dolar', isim: 'Dolar', emoji: '💵', minDeger: 7.2, maxDeger: 45.9 },
  { sembol: 'elmas', isim: 'Elmas', emoji: '💎', minDeger: 900000, maxDeger: 2000000 }
];

module.exports = {
  name: 'ekonomi-değiş',
  async execute(message, args) {
    // Komutu kullanabilecek kullanıcıların ID'leri
    const izinliKullanicilar = ['1055865214651871393'];

    // Kullanıcının yetkisi kontrol ediliyor
    if (!izinliKullanicilar.includes(message.author.id)) {
      return message.reply('Bu komutu kullanma yetkiniz yok.');
    }

    let ekonomi = ekonomiyiOku();

    // Her birim için yeni değer belirleniyor
    varliklar.forEach(varlik => {
      ekonomi[varlik.sembol] = Math.random() * (varlik.maxDeger - varlik.minDeger) + varlik.minDeger;
    });

    // Yeni değerler kaydediliyor
    ekonomi.sonGuncelleme = new Date().toISOString();
    ekonomiyiYaz(ekonomi);

    // Yeni değerler bir embed mesajı ile gösteriliyor
    const embed = new MessageEmbed()
      .setTitle('Ekonomi Piyasası Güncellendi')
      .setColor('#0099ff')
      .setDescription(`Son güncelleme: ${new Date(ekonomi.sonGuncelleme).toLocaleString('tr-TR')}`)
      .setFooter({ text: 'Piyasa manuel olarak güncellendi.' });

    varliklar.forEach(varlik => {
      const deger = ekonomi[varlik.sembol];
      embed.addField(`${varlik.emoji} ${varlik.isim}`, `1 = ${deger.toFixed(2)} <:frost:1268960986560331786>`, true);
    });

    message.reply({ embeds: [embed] });
  },
};