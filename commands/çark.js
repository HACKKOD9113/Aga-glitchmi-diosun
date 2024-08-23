const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');

const config = require('../config.json');
const databasePath = path.join(__dirname, '../database.json');

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

const items = [
    { name: '5X Bitcoin', emoji: emojis.btc, chance: 0.002, reward: { btc: 5 }, special: true },
    { name: 'Ethereum', emoji: emojis.ethereum, chance: 0.01, reward: { ethereum: 1 }, special: true },
    { name: '5X Elmas', emoji: emojis.elmas, chance: 0.004, reward: { elmas: 5 }, special: true },
    { name: '100 Dolar', emoji: emojis.dolar, chance: 0.2, reward: { dolar: 100 } },
    { name: '5000 Dolar', emoji: emojis.dolar, chance: 0.1, reward: { dolar: 5000 } },
    { name: '1000 Dogecoin', emoji: emojis.dogecoin, chance: 0.4, reward: { dogecoin: 1000 } },
    { name: 'Hükümdar Ünvanı', emoji: '<:Hkmdar:1276266930822578267>', chance: 0.001, reward: {}, special: true },
    { name: 'Boş', emoji: '❌', chance: 0.283, reward: {} }
];

const specialGif = 'https://tenor.com/view/money-gif-7446644742773745607';
const normalGif = 'https://media.giphy.com/media/26uflOGXNlW9JPrDq/giphy.gif';

module.exports = {
    name: 'çark',
    description: 'Şans çarkını çevir!',
    async execute(message, args) {
        const userId = message.author.id;
        let database = JSON.parse(fs.readFileSync(databasePath, 'utf8'));
        if (!database[userId]) {
            database[userId] = { 
                kullaniciAdi: message.author.username,
                bakiye: 0,
                btc: 0,
                ethereum: 0,
                elmas: 0,
                dolar: 0,
                dogecoin: 0,
                altın: 0,
                euro: 0,
                miningLevel: 1,
                sonİşlem: Date.now(),
                unvan: []
            };
        }

        const singleSpinCost = 50000;
        const tenSpinCost = 450000;

        const embed = new Discord.MessageEmbed()
            .setColor('#FFA500')
            .setTitle('🎡 Lüks Şans Çarkı')
            .setDescription('Zenginliğin kapılarını aralayın! Çarkı çevirmek için aşağıdaki butonları kullanın.')
            .addField('💎 Tek Çevirme', `${singleSpinCost} ${emojis.frost}`, true)
            .addField('🔥 10x Çevirme', `${tenSpinCost} ${emojis.frost}`, true)
            .setImage(normalGif)
            .setFooter(`${message.author.username}`, message.author.displayAvatarURL())
            .setTimestamp();

        const row = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setCustomId('single')
                    .setLabel('Tek Çevirme')
                    .setStyle('PRIMARY')
                    .setEmoji('💎'),
                new Discord.MessageButton()
                    .setCustomId('ten')
                    .setLabel('10x Çevirme')
                    .setStyle('DANGER')
                    .setEmoji('🔥')
            );

        const sentMessage = await message.channel.send({ embeds: [embed], components: [row] });

        const filter = i => ['single', 'ten'].includes(i.customId) && i.user.id === message.author.id;
        const collector = sentMessage.createMessageComponentCollector({ filter, time: 30000 });

        collector.on('collect', async i => {
            await i.deferUpdate();
            const spinCount = i.customId === 'single' ? 1 : 10;
            const cost = i.customId === 'single' ? singleSpinCost : tenSpinCost;

            if (database[userId].bakiye < cost) {
                await sentMessage.edit({ content: 'Yeterli bakiyeniz yok!', embeds: [], components: [] });
                return;
            }

            database[userId].bakiye -= cost;
            fs.writeFileSync(databasePath, JSON.stringify(database, null, 2));

            const results = [];
            const wheelEmbed = new Discord.MessageEmbed()
                .setColor('#FFA500')
                .setTitle('🎡 Şans Çarkı Dönüyor')
                .setDescription('Heyecan dorukta! Çark dönüyor...')
                .setImage(normalGif)
                .setFooter(`${message.author.username}`, message.author.displayAvatarURL())
                .setTimestamp();

            await sentMessage.edit({ embeds: [wheelEmbed], components: [] });

            for (let spin = 0; spin < spinCount; spin++) {
                await new Promise(resolve => setTimeout(resolve, 3000));

                const result = weightedRandom(items);
                results.push(result);

                // Add rewards to user's account
                for (const [currency, amount] of Object.entries(result.reward)) {
                    database[userId][currency] = (database[userId][currency] || 0) + amount;
                }

                if (result.name === 'Hükümdar Ünvanı') {
                    if (!Array.isArray(database[userId].unvan)) {
                        database[userId].unvan = [];
                    }
                    if (!database[userId].unvan.includes('Hükümdar')) {
                        database[userId].unvan.push('Hükümdar');
                    }
                }

                const resultEmbed = new Discord.MessageEmbed()
                    .setColor('#FFA500')
                    .setTitle(`🎉 ${spin + 1}. Çevirme Sonucu`)
                    .setDescription(`**Kazanılan:** ${result.emoji} ${result.name}`)
                    .setImage(result.special ? specialGif : normalGif)
                    .setFooter(`${message.author.username}`, message.author.displayAvatarURL())
                    .setTimestamp();

                await sentMessage.edit({ embeds: [resultEmbed] });
                await new Promise(resolve => setTimeout(resolve, result.special ? 5000 : 3000));
            }

            // Save updated database
            fs.writeFileSync(databasePath, JSON.stringify(database, null, 2));

            const finalEmbed = new Discord.MessageEmbed()
                .setColor('#00FF00')
                .setTitle('🎉 Şans Çarkı Sonuçları 🎉')
                .setDescription('İşte kazandıklarınız!')
                .addField('💰 Harcanan', `${cost} ${emojis.frost}`, true)
                .addField('💼 Yeni Bakiye', `${database[userId].bakiye} ${emojis.frost}`, true)
                .setImage('https://media.giphy.com/media/3o6UB5RrlQuMfZp82Y/giphy.gif')
                .setFooter(`${message.author.username}`, message.author.displayAvatarURL())
                .setTimestamp();

            results.forEach((result, index) => {
                finalEmbed.addField(`${index + 1}. Çevirme`, `${result.emoji} ${result.name}`, true);
            });

            await sentMessage.edit({ embeds: [finalEmbed], components: [] });
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                sentMessage.edit({ content: 'Çark çevirme süresi doldu.', embeds: [], components: [] });
            }
        });
    },
};

function weightedRandom(items) {
    const totalWeight = items.reduce((sum, item) => sum + item.chance, 0);
    let random = Math.random() * totalWeight;

    for (let item of items) {
        if (random < item.chance) {
            return item;
        }
        random -= item.chance;
    }

    return items[items.length - 1];
}