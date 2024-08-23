const Discord = require('discord.js');
const fs = require('fs');
const { miningCooldown } = require('../config.json');

// Gezegen ve element tanımlamaları
const PLANETS = [
    { name: "Mars", emoji: "🔴", difficulty: 1 },
    { name: "Venüs", emoji: "🟠", difficulty: 2 },
    { name: "Jüpiter", emoji: "🟤", difficulty: 3 },
    { name: "Satürn", emoji: "🟨", difficulty: 4 },
    { name: "Uranüs", emoji: "🔵", difficulty: 5 },
    { name: "Neptün", emoji: "🟦", difficulty: 6 }
];

const ELEMENTS = [
    { name: "Demir", value: 10, rarity: 0.5 },
    { name: "Bakır", value: 20, rarity: 0.3 },
    { name: "Gümüş", value: 50, rarity: 0.15 },
    { name: "Altın", value: 100, rarity: 0.05 },
    { name: "Platin", value: 200, rarity: 0.02 },
    { name: "İridyum", value: 500, rarity: 0.005 },
    { name: "Nötronium", value: 1000, rarity: 0.001 },
    { name: "Uranyum", value: 25000, rarity: 0.0001 }
];

const lastMiningTime = new Map();

module.exports = {
    name: 'mine',
    description: 'Galaktik madencilik yap',
    async execute(message, args) {
        const userId = message.author.id;
        const currentTime = Date.now();
        const cooldownTime = (lastMiningTime.get(userId) || 0) + miningCooldown * 1000;

        if (currentTime < cooldownTime) {
            const remainingTime = Math.ceil((cooldownTime - currentTime) / 1000);
            return message.reply(`Uzay gemini şarj etmen gerekiyor! ${remainingTime} saniye sonra tekrar madencilik yapabilirsin.`);
        }

        let database;
        try {
            database = JSON.parse(fs.readFileSync('./database.json', 'utf8'));
        } catch (error) {
            console.error("Database okuma hatası:", error);
            database = {}; // Varsayılan boş nesne
        }

        if (!database[userId]) {
            database[userId] = { bakiye: 1000, miningLevel: 1 }; // Varsayılan değerler
        }

        const playerLevel = database[userId].miningLevel || 1; // Eğer level yoksa 1 olarak ayarla
        const availablePlanets = PLANETS.filter(planet => planet.difficulty <= playerLevel);
        const chosenPlanet = availablePlanets[Math.floor(Math.random() * availablePlanets.length)];

        let totalValue = 0;
        let minedElements = [];

        for (let element of ELEMENTS) {
            if (Math.random() < element.rarity * playerLevel / chosenPlanet.difficulty) {
                const quantity = Math.floor(Math.random() * 3) + 1;
                totalValue += element.value * quantity;
                minedElements.push(`${quantity}x ${element.name}`);
            }
        }

        database[userId].bakiye += totalValue;
        lastMiningTime.set(userId, currentTime);

        // Level up mekanizması
        if (Math.random() < 0.1 && playerLevel < PLANETS.length) {
            database[userId].miningLevel = playerLevel + 1;
        }

        try {
            fs.writeFileSync('./database.json', JSON.stringify(database, null, 2));
        } catch (error) {
            console.error("Database yazma hatası:", error);
        }

        const embed = new Discord.MessageEmbed()
            .setColor('#00CED1')
            .setTitle(`🚀 Galaktik Madencilik Raporu`)
            .setDescription(`${chosenPlanet.emoji} ${chosenPlanet.name} gezegeninde madencilik yaptın!`)
            .addField('Bulunan Elementler', minedElements.length > 0 ? minedElements.join(', ') : 'Maalesef bir şey bulamadın.')
            .addField('Kazanılan Değer', `${totalValue} <:frost:1268960986560331786>`)
            .addField('Yeni Bakiye', `${database[userId].bakiye} <:frost:1268960986560331786>`)
            .addField('Madenci Seviyesi', `${database[userId].miningLevel}`)
            .setFooter(`${miningCooldown} saniye sonra tekrar madencilik yapabilirsin.`);

        if (database[userId].miningLevel > playerLevel) {
            embed.addField('🎉 Seviye Atladın!', `Tebrikler! Madencilik seviyen ${database[userId].miningLevel} oldu.`);
        }

        message.reply({ embeds: [embed] });
    },
};