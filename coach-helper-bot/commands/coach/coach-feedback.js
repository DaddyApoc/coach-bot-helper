import {
  SlashCommandBuilder,
  EmbedBuilder
} from "discord.js";
import fs from "fs";

const feedbackPath = "/data/feedback.json";

export default {
  data: new SlashCommandBuilder()
    .setName("coach-feedback")
    .setDescription("View all feedback for a coach.")
    .addUserOption(option =>
      option.setName("coach")
        .setDescription("Coach to view feedback for")
        .setRequired(true)
    ),

  async execute(interaction) {
    const coachUser = interaction.options.getUser("coach");

    let feedback = JSON.parse(fs.readFileSync(feedbackPath, "utf8"));
    const entries = feedback.filter(f => f.coachId === coachUser.id);

    if (entries.length === 0) {
      return interaction.reply({
        content: "📭 This coach has no feedback yet.",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(`⭐ Feedback for ${coachUser.username}`)
      .setColor("Yellow");

    entries.slice(0, 10).forEach(f => {
      embed.addFields({
        name: `${f.rating}⭐ — ${f.studentName}`,
        value: `${f.comment}\nTags: ${f.tags.join(", ") || "None"}`
      });
    });

    return interaction.reply({ embeds: [embed] });
  }
};
