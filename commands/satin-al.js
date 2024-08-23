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
const kullanıcıSüreDosyası = path.join(__dirname, '..', 'kullanıcı-süre-al.json');

module.exports = {
    name: 'satın-al',
    description: 'Belirtilen varlıktan satın alın.',
    async execute(message, args) {
        const varlık = args[0]?.toLowerCase();
        const miktar = parseInt(args[1]);

        if (!varlık || !miktar) {
            return message.reply({ content: '❌ **Geçersiz giriş. Kullanım: f!satın-al <varlık> <miktar>**' });
        }

        const geçerliVarlıklar = Object.keys(emojis);
        if (!geçerliVarlıklar.includes(varlık)) {
            return message.reply({ content: '❌ **Geçersiz varlık.** Lütfen geçerli bir varlık adı girin.' });
        }

        const varlıkLimitleri = {
            'btc': 5,
            'dogecoin': 10000,
            'altın': 50,
            'ethereum': 10,
            'euro': 5000,
            'dolar': 5000,
            'elmas': 5
        };

        const userId = message.author.id;
        const ekonomiDosyası = path.join(__dirname, '..', 'ekonomi.json');
        const databaseDosyası = path.join(__dirname, '..', 'database.json');

        let ekonomi = JSON.parse(fs.readFileSync(ekonomiDosyası, 'utf8'));
        let database = JSON.parse(fs.readFileSync(databaseDosyası, 'utf8'));
        let işlemAralıkları = JSON.parse(fs.readFileSync(işlemAralıklarıDosyası, 'utf8'));
        let kullanıcıSüre = JSON.parse(fs.readFileSync(kullanıcıSüreDosyası, 'utf8'));

        if (!database[userId]) {
            database[userId] = { bakiye: 0, [varlık]: 0 };
        }

        const kullanıcı = database[userId];

        // Hükümdar ünvanı kontrolü ve limit artırımı
        if (Array.isArray(kullanıcı.unvan) && kullanıcı.unvan.includes("Hükümdar")) {
            varlıkLimitleri['btc'] = 6;
            varlıkLimitleri['dogecoin'] = 12000;
            varlıkLimitleri['altın'] = 60;
            varlıkLimitleri['ethereum'] = 12;
            varlıkLimitleri['euro'] = 6000;
            varlıkLimitleri['dolar'] = 6000;
            varlıkLimitleri['elmas'] = 6;
        }

        if (miktar <= 0) {
            return message.reply({ content: '❌ **Lütfen pozitif bir miktar girin.**' });
        }

        if (miktar > varlıkLimitleri[varlık]) {
            return message.reply({ content: `❌ **Tek seferde en fazla ${varlıkLimitleri[varlık]} ${emojis[varlık]} alabilirsiniz.**` });
        }

        const şuAn = Date.now();
        const beklemeSüresi = işlemAralıkları[varlık] || 0;

        if (!kullanıcıSüre[userId]) {
            kullanıcıSüre[userId] = {};
        }

        if (kullanıcıSüre[userId][varlık] && şuAn - kullanıcıSüre[userId][varlık] < beklemeSüresi) {
            const kalanSüre = Math.ceil((beklemeSüresi - (şuAn - kullanıcıSüre[userId][varlık])) / 1000);
            return message.reply({ content: `❌ **Bu varlıktan tekrar alım yapabilmek için ${kalanSüre} saniye beklemelisiniz.**` });
        }

        const fiyat = ekonomi[varlık] * miktar;

        if (isNaN(fiyat)) {
            return message.reply({ content: `❌ **${varlık} için geçerli bir fiyat bulunamadı.**` });
        }

        if (kullanıcı.bakiye < fiyat) {
            return message.reply({ content: '❌ **Yeterli bakiyeniz yok.**' });
        }

        kullanıcı.bakiye -= fiyat;
        kullanıcı[varlık] = (kullanıcı[varlık] || 0) + miktar;
        kullanıcıSüre[userId][varlık] = şuAn;

        fs.writeFileSync(databaseDosyası, JSON.stringify(database, null, 2));
        fs.writeFileSync(kullanıcıSüreDosyası, JSON.stringify(kullanıcıSüre, null, 2));

        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Satın Alma İşlemi Başarılı')
            .setDescription(`✅ **Başarıyla ${miktar} adet ${emojis[varlık]} ${varlık} satın aldınız.**`)
            .addField('Toplam Maliyet', `${fiyat.toFixed(2)} ${emojis.frost}`)
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    },
};