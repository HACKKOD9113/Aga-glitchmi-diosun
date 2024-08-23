const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');

const emojis = {
    'btc': '<:bitcoin:1269241637469552723>',
    'dogecoin': '<:dogecoin:1269240399009157252>',
    'altın': '<:gold:1269236070625579008>',
    'ethereum': '<:ethereum:1269238909800546358>',
    'euro': '<:euro:1269240157459185666>',
    'dolar': '<:dollar:1269240185489723546>',
    'elmas': '<:diamond:1269239220644483192>',
    'frost': '<:frost:1268960986560331786>'
};

const işlemAralıklarıDosyası = path.join(__dirname, '..', 'birim-süre.json');
const kullanıcıSüreDosyası = path.join(__dirname, '..', 'kullanıcı-süre-sat.json');

module.exports = {
    name: 'sat',
    description: 'Belirtilen varlığı satın.',
    async execute(message, args) {
        const varlık = args[0]?.toLowerCase();
        const miktar = parseInt(args[1]);

        if (!varlık || !miktar) {
            return message.reply({ content: '❌ **Geçersiz giriş. Kullanım: f!sat <varlık> <miktar>**' });
        }

        const geçerliVarlıklar = Object.keys(emojis);
        if (!geçerliVarlıklar.includes(varlık)) {
            return message.reply({ content: '❌ **Geçersiz varlık.** Lütfen geçerli bir varlık adı girin.' });
        }

        const varlıkLimitleri = {
            'btc': 10,
            'dogecoin': 20000,
            'altın': 100,
            'ethereum': 20,
            'euro': 10000,
            'dolar': 10000,
            'elmas': 10
        };

        const userId = message.author.id;
        const ekonomiDosyası = path.join(__dirname, '..', 'ekonomi.json');
        const databaseDosyası = path.join(__dirname, '..', 'database.json');

        let ekonomi = JSON.parse(fs.readFileSync(ekonomiDosyası, 'utf8'));
        let database = JSON.parse(fs.readFileSync(databaseDosyası, 'utf8'));
        let işlemAralıkları = JSON.parse(fs.readFileSync(işlemAralıklarıDosyası, 'utf8'));
        let kullanıcıSüre = JSON.parse(fs.readFileSync(kullanıcıSüreDosyası, 'utf8'));

        if (!database[userId]) {
            return message.reply({ content: '❌ **Hesabınız bulunamadı.**' });
        }

        const kullanıcı = database[userId];

        // Hükümdar ünvanı kontrolü ve limit artırımı
        if (Array.isArray(kullanıcı.unvan) && kullanıcı.unvan.includes("Hükümdar")) {
            varlıkLimitleri['btc'] = 12;
            varlıkLimitleri['dogecoin'] = 24000;
            varlıkLimitleri['altın'] = 120;
            varlıkLimitleri['ethereum'] = 24;
            varlıkLimitleri['euro'] = 12000;
            varlıkLimitleri['dolar'] = 12000;
            varlıkLimitleri['elmas'] = 12;
        }

        if (miktar <= 0) {
            return message.reply({ content: '❌ **Lütfen pozitif bir miktar girin.**' });
        }

        if (miktar > varlıkLimitleri[varlık]) {
            return message.reply({ content: `❌ **Tek seferde en fazla ${varlıkLimitleri[varlık]} ${emojis[varlık]} satabilirsiniz.**` });
        }

        const şuAn = Date.now();
        const beklemeSüresi = işlemAralıkları[varlık] || 0;

        if (!kullanıcıSüre[userId]) {
            kullanıcıSüre[userId] = {};
        }

        if (kullanıcıSüre[userId][varlık] && şuAn - kullanıcıSüre[userId][varlık] < beklemeSüresi) {
            const kalanSüre = Math.ceil((beklemeSüresi - (şuAn - kullanıcıSüre[userId][varlık])) / 1000);
            return message.reply({ content: `❌ **Bu varlıktan tekrar satım yapabilmek için ${kalanSüre} saniye beklemelisiniz.**` });
        }

        if (!kullanıcı[varlık] || kullanıcı[varlık] < miktar) {
            return message.reply({ content: `❌ **Yeterli ${emojis[varlık]} ${varlık} varlığınız yok.**` });
        }

        const varlıkFiyatı = ekonomi[varlık];
        if (typeof varlıkFiyatı === 'undefined') {
            return message.reply({ content: `❌ **${varlık} varlığı için fiyat bilgisi bulunamadı.**` });
        }

        const fiyat = varlıkFiyatı * miktar;

        kullanıcı.bakiye = (kullanıcı.bakiye || 0) + fiyat;
        kullanıcı[varlık] -= miktar;
        kullanıcıSüre[userId][varlık] = şuAn;

        fs.writeFileSync(databaseDosyası, JSON.stringify(database, null, 2));
        fs.writeFileSync(kullanıcıSüreDosyası, JSON.stringify(kullanıcıSüre, null, 2));

        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Satış İşlemi Başarılı')
            .setDescription(`✅ **Başarıyla ${miktar} adet ${emojis[varlık]} ${varlık} sattınız.**`)
            .addField('Toplam Kazanç', `${fiyat.toFixed(2)} ${emojis.frost}`)
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    },
};