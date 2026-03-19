const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("history")
    .setDescription("View your session history"),

  async execute(interaction) {
    try {
      const sessions = JSON.parse(fs.readFileSync("data/sessions.json", "utf8"));
      const userId = interaction.user.id;

      const mine = sessions.filter(s => s.studentId === userId);

      if (mine.length === 0) {
        return interaction.reply("📭 You have no session history.");
      }

      const embed = new EmbedBuilder()
        .setTitle(`📜 Session History — ${interaction.user.username}`)
        .setColor("Purple");

      mine.slice(-10).reverse().forEach(s => {
        embed.addFields({
          name: `Session ${s.id}`,
          value:
            `**Coach:** <@${s.coachId}>\n` +
            `**Date:** ${s.date}\n` +
            `**Time:** ${s.time}\n` +
            `**Status:** ${s.status}`
        });
      });

      await interaction.reply({ embeds: [embed] });

    } catch (err) {
      console.error(err);
      await interaction.reply("❌ Error loading history.");
    }
  }
};
