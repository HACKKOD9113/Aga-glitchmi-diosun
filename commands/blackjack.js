const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const fs = require('fs');
const { betLimit } = require('../config.json');

function createDeck() {
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    let deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit, value });
        }
    }
    return deck;
}

function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function calculateHandValue(hand) {
    let value = 0;
    let aceCount = 0;
    for (let card of hand) {
        if (card.value === 'A') {
            aceCount++;
            value += 11;
        } else if (['J', 'Q', 'K'].includes(card.value)) {
            value += 10;
        } else {
            value += parseInt(card.value);
        }
    }
    while (value > 21 && aceCount > 0) {
        value -= 10;
        aceCount--;
    }
    return value;
}

module.exports = {
    name: 'blackjack',
    description: 'Blackjack oyunu oynar',
    async execute(message, args) {
        const userId = message.author.id;
        let database = JSON.parse(fs.readFileSync('./database.json', 'utf8'));
        
        if (!database[userId]) {
            database[userId] = { bakiye: 1000 };
        }
        
        let bet = parseInt(args[0]);
        if (isNaN(bet) || bet <= 0) {
            return message.reply(`Geçerli bir bahis miktarı girin (1-${betLimit} <:frost:1268960986560331786> arası).`);
        }

        if (bet > betLimit) {
            bet = betLimit; 
        }

        if (database[userId].bakiye < bet) {
            return message.reply('Yeterli bakiyeniz yok.');
        }
        
        let deck = shuffleDeck(createDeck());
        let playerHand = [deck.pop(), deck.pop()];
        let dealerHand = [deck.pop(), deck.pop()];
        
        let playerValue = calculateHandValue(playerHand);
        let dealerValue = calculateHandValue(dealerHand);
        
        const gameEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Blackjack')
            .addFields(
                { name: 'Dealer', value: `[${dealerHand[0].value}${dealerHand[0].suit}+?`, inline: true },
                { name: `${message.author.username}`, value: `[${playerValue}]`, inline: true },
                { name: '\u200B', value: `${playerHand.map(card => `${card.value}${card.suit}`).join(' ')}` }
            )
            .setFooter({ text: 'Hit veya Stand seçeneğini seçin' });

        const hitButton = new MessageButton()
            .setCustomId('hit')
            .setLabel('Hit')
            .setStyle('PRIMARY');

        const standButton = new MessageButton()
            .setCustomId('stand')
            .setLabel('Stand')
            .setStyle('DANGER');

        const row = new MessageActionRow()
            .addComponents(hitButton, standButton);

        const gameMessage = await message.reply({ embeds: [gameEmbed], components: [row] });

        const filter = i => ['hit', 'stand'].includes(i.customId) && i.user.id === message.author.id;
        const collector = gameMessage.createMessageComponentCollector({ filter, time: 30000 });

        collector.on('collect', async i => {
            await i.deferUpdate();

            if (i.customId === 'hit') {
                playerHand.push(deck.pop());
                playerValue = calculateHandValue(playerHand);
                gameEmbed.fields[1].value = `[${playerValue}]`;
                gameEmbed.fields[2].value = `${playerHand.map(card => `${card.value}${card.suit}`).join(' ')}`;
                
                if (playerValue > 21) {
                    collector.stop('bust');
                }
            } else if (i.customId === 'stand') {
                collector.stop('stand');
            }
            
            await gameMessage.edit({ embeds: [gameEmbed], components: [row] });
        });

        collector.on('end', async (collected, reason) => {
            hitButton.setDisabled(true);
            standButton.setDisabled(true);

            if (reason === 'bust') {
                database[userId].bakiye -= bet;
                gameEmbed.setDescription(`Battınız! Kaybettiniz. -${bet} coin`);
            } else if (reason === 'stand' || reason === 'time') {
                while (dealerValue < 17) {
                    dealerHand.push(deck.pop());
                    dealerValue = calculateHandValue(dealerHand);
                }
                
                gameEmbed.fields[0].value = `[${dealerValue}]\n${dealerHand.map(card => `${card.value}${card.suit}`).join(' ')}`;
                
                if (dealerValue > 21 || playerValue > dealerValue) {
                    database[userId].bakiye += bet;
                    gameEmbed.setDescription(`Kazandınız! +${bet} <:frost:1268960986560331786>`);
                } else if (playerValue < dealerValue) {
                    database[userId].bakiye -= bet;
                    gameEmbed.setDescription(`Kaybettiniz. -${bet} <:frost:1268960986560331786>`);
                } else {
                    gameEmbed.setDescription(`Berabere! Bahsiniz iade edildi.`);
                }
            }
            
            gameEmbed.setFooter({ text: `Yeni bakiye: ${database[userId].bakiye} coin` });
            await gameMessage.edit({ embeds: [gameEmbed], components: [row] });
            fs.writeFileSync('./database.json', JSON.stringify(database, null, 2));
        });
    },
};