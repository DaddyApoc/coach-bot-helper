import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import fs from "fs";

const strikesPath = "data/strikes.json";

export default {
  data: new SlashCommandBuilder()
    .setName("admin-strikes")
    .setDescription("View all strikes for a coach.")
    .addUserOption(option =>
      option.setName("coach")
        .setDescription("Coach to view")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const coachUser = interaction.options.getUser("coach");

    if (!fs.existsSync(strikesPath)) {
      return interaction.reply({ content: "❌ No strikes recorded.", ephemeral: true });
    }

    const strikes = JSON.parse(fs.readFileSync(strikesPath, "utf8"))
      .filter(s => s.coachId === coachUser.id);

    if (strikes.length === 0) {
      return interaction.reply({
        content: `${coachUser} has no strikes.`,
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(`⚠️ Strikes for ${coachUser.username}`)
      .setColor("Orange")
      .setTimestamp();

    strikes.forEach((s, i) => {
      embed.addFields({
        name: `Strike #${i + 1}`,
        value: `**Reason:** ${s.reason}\n**Issued by:** <@${s.issuedBy}>\n**Date:** ${new Date(s.timestamp).toLocaleString()}`
      });
    });

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
