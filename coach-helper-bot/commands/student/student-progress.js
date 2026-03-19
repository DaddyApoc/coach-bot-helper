const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("student-progress")
    .setDescription("View your coaching progress"),

  async execute(interaction) {
    try {
      const file = "data/progress.json";
      if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify([]));

      const progress = JSON.parse(fs.readFileSync(file, "utf8")); 
      const entries = progress.filter(p => p.studentId === interaction.user.id);

      if (entries.length === 0) {
        return interaction.reply("📭 You have no recorded progress yet.");
      }

      const embed = new EmbedBuilder()
        .setTitle(`📘 Progress Report — ${interaction.user.username}`)
        .setColor("Blue");

      entries.slice(-10).reverse().forEach((p, i) => {
        embed.addFields({
          name: `Entry ${i + 1}`,
          value:
            `**Coach:** <@${p.coachId}>\n` +
            `**Weapon:** ${p.weapon}\n` +
            `**Improvement:** ${p.improvement}\n` +
            `**Notes:** ${p.notes}\n` +
            `**Date:** ${p.date}`
        });
      });

      await interaction.reply({ embeds: [embed] });

    } catch (err) {
      console.error(err);
      await interaction.reply("❌ Error loading progress.");
    }
  }
};
