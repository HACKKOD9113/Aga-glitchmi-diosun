const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require('discord.js');
const { veritabaniniOku, cuzdanAl, varliklar } = require('../utils/ekonomi');

// Ünvanlar, açıklamaları ve emojileri içeren nesne
const unvanlar = {
  'Hükümdar': { aciklama: 'Kralların kralı!', emoji: '<:Hkmdar:1276266930822578267>' },
  'Savaşçı': { aciklama: 'Savaş meydanlarının efendisi!', emoji: '⚔️' },
  'Büyücü': { aciklama: 'Büyülü dünyanın koruyucusu!', emoji: '🧙‍♂️' },
  'Efendi': { aciklama: 'Herkesin saygı duyduğu lider!', emoji: '🎖️' }
  // Diğer ünvanlar, açıklamaları ve emojileri buraya eklenebilir
};

module.exports = {
  name: 'varlık',
  async execute(message, args) {
    let cuzdan = await cuzdanAl(message.author.id);

    if (!cuzdan || !cuzdan.kullaniciAdi) {
      // Hesap oluşturma kodu...
      await message.reply('Hesabınız bulunamadı. Lütfen önce bir hesap oluşturun.');
      return;
    }

    varliklar.forEach(varlik => {
      if (cuzdan[varlik.sembol] === undefined) {
        cuzdan[varlik.sembol] = 0;
      }
    });

    const embed = new MessageEmbed()
      .setTitle(`${cuzdan.kullaniciAdi}'nin Varlıkları`)
      .setColor('#FFD700')
      .setDescription(`**Bakiye:** ${cuzdan.bakiye.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<:frost:1268960986560331786>`)
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
      .setFooter('Varlık Portföyü', message.guild.iconURL())
      .setTimestamp();

    let varlikAlanlari = [];
    varliklar.forEach(varlik => {
      varlikAlanlari.push(`${varlik.emoji} \`${cuzdan[varlik.sembol].toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\``);
    });

    embed.addField('Varlıklar', varlikAlanlari.join(' | '), false);

    // Ünvanları bir dizi olarak alıyoruz
    const userUnvanlar = Array.isArray(cuzdan.unvan) ? cuzdan.unvan : (cuzdan.unvan ? [cuzdan.unvan] : []);

    const row = new MessageActionRow()
      .addComponents(
        new MessageSelectMenu()
          .setCustomId('view_select')
          .setPlaceholder('🔽 Genel veya Ünvanlar seçin 🔽')
          .addOptions([
            {
              label: '🪙 Genel',
              value: 'general',
            },
            {
              label: '🏆 Ünvanlar',
              value: 'titles',
            }
          ])
      );

    const response = await message.reply({ embeds: [embed], components: [row] });

    const filter = i => i.customId === 'view_select' && i.user.id === message.author.id;
    const collector = response.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {
      if (i.values[0] === 'titles') {
        const titleEmbed = new MessageEmbed()
          .setTitle('Ünvanlar')
          .setColor('#FFD700')
          .setDescription(formatUnvanlar(userUnvanlar))
          .setFooter('Ünvan Bilgisi', message.guild.iconURL())
          .setTimestamp();

        await i.update({ embeds: [titleEmbed], components: [row] });
      } else {
        await i.update({ embeds: [embed], components: [row] });
      }
    });
  }
};

function formatUnvanlar(userUnvanlar) {
  if (userUnvanlar.length === 0) {
    return 'Ünvan yok';
  }
  return userUnvanlar.map(unvan => {
    const unvanBilgisi = unvanlar[unvan];
    if (unvanBilgisi) {
      return `**${unvan}** ${unvanBilgisi.emoji}${unvanBilgisi.aciklama ? ` - ${unvanBilgisi.aciklama}` : ''}`;
    } else {
      return `**${unvan}**`;
    }
  }).join('\n');
}