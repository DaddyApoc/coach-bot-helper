const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("admin-dashboard")
    .setDescription("View admin dashboard stats"),

  async execute(interaction) {
    try {
      const coaches = JSON.parse(fs.readFileSync("data/coaches.json", "utf8"));
      const sessions = JSON.parse(fs.readFileSync("data/sessions.json", "utf8"));
      const wallets = JSON.parse(fs.readFileSync("data/wallets.json", "utf8"));

      const embed = new EmbedBuilder()
        .setTitle("📊 Admin Dashboard")
        .addFields(
          { name: "Coaches", value: `${coaches.length}`, inline: true },
          { name: "Sessions", value: `${sessions.length}`, inline: true },
          { name: "Wallet Accounts", value: `${Object.keys(wallets).length}`, inline: true }
        )
        .setColor("Blue");

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.reply("❌ Error loading dashboard.");
    }
  }
};
