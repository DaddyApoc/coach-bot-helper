const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

const filePath = "data/earnings.json";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("admin-adjust-earnings")
    .setDescription("Adjust a coach's earnings")
    .addUserOption(option =>
      option.setName("coach")
        .setDescription("Coach to adjust")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName("amount")
        .setDescription("Amount to adjust (+/-)")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const coach = interaction.options.getUser("coach");
      const amount = interaction.options.getInteger("amount");

      if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify({}));

      const earnings = JSON.parse(fs.readFileSync(filePath, "utf8"));
      earnings[coach.id] = (earnings[coach.id] || 0) + amount;

      fs.writeFileSync(filePath, JSON.stringify(earnings, null, 2));

      await interaction.reply(`💰 Adjusted **${coach.username}** by **${amount}** credits.`);
    } catch (err) {
      console.error(err);
      await interaction.reply("❌ Error adjusting earnings.");
    }
  }
}; 
