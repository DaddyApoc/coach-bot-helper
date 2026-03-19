const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("admin-strike")
    .setDescription("Issue a strike to a coach")
    .addUserOption(option =>
      option.setName("coach")
        .setDescription("Coach to strike")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("reason")
        .setDescription("Reason for strike")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const coach = interaction.options.getUser("coach");
      const reason = interaction.options.getString("reason");

      const strikes = JSON.parse(fs.readFileSync("data/strikes.json", "utf8"));
      strikes.push({
        coachId: coach.id,
        reason,
        date: new Date().toISOString()
      });

      fs.writeFileSync("data/strikes.json", JSON.stringify(strikes, null, 2));

      await interaction.reply(`⚠️ Strike issued to **${coach.username}**.`);
    } catch (err) {
      console.error(err);
      await interaction.reply("❌ Error issuing strike.");
    }
  }
};
