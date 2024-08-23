const { MessageAttachment } = require('discord.js');
const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'premium',
  async execute(message, args) {
    const userId = message.author.id;
    const premiumPath = path.join(__dirname, '..', 'premium.json');
    let premiumData = {};

    if (fs.existsSync(premiumPath)) {
      const data = fs.readFileSync(premiumPath, 'utf8');
      premiumData = JSON.parse(data);
    }

    if (!premiumData[userId]) {
      return message.reply('❌ Üzgünüm, premium üyeliğiniz bulunmamaktadır.');
    }

    const endDate = new Date(premiumData[userId].endDate);
    const totalDays = 30; // Örnek olarak 30 günlük premium süresi
    const remainingDays = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
    const progress = (remainingDays / totalDays) * 100;

    const image = await createPremiumImage(message.author, remainingDays, progress);
    const attachment = new MessageAttachment(image, 'premium-status.png');

    await message.reply({ files: [attachment] });
  },
};

async function createPremiumImage(user, remainingDays, progress) {
  const image = await Jimp.read(path.join(__dirname, '..', 'premium-template.png'));
  const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);

  // Yuvarlak profil resmi ekleme
  const avatarUrl = user.displayAvatarURL({ format: 'png', size: 128 });
  const avatar = await Jimp.read(avatarUrl);
  avatar.resize(80, 80);
  avatar.circle();
  image.composite(avatar, 20, 20);

  // Kullanıcı adı ve kalan gün
  image.print(font, 120, 30, user.username);
  image.print(font, 120, 70, `Kalan ${remainingDays} gün`);

  // İlerleme çubuğu
  const barWidth = 500;
  const barHeight = 20;
  const barX = 120;
  const barY = 120;

  // Arka plan çubuğu
  image.scan(barX, barY, barWidth, barHeight, function(x, y, idx) {
    this.bitmap.data[idx + 0] = 100; // R
    this.bitmap.data[idx + 1] = 100; // G
    this.bitmap.data[idx + 2] = 100; // B
    this.bitmap.data[idx + 3] = 255; // A
  });

  // İlerleme çubuğu
  const progressWidth = Math.floor(barWidth * (progress / 100));
  image.scan(barX, barY, progressWidth, barHeight, function(x, y, idx) {
    this.bitmap.data[idx + 0] = 255; // R
    this.bitmap.data[idx + 1] = 215; // G
    this.bitmap.data[idx + 2] = 0;   // B
    this.bitmap.data[idx + 3] = 255; // A
  });

  return await image.getBufferAsync(Jimp.MIME_PNG);
}