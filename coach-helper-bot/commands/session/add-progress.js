import {
  SlashCommandBuilder
} from "discord.js";
import fs from "fs";

const progressPath = "/data/studentProgress.json";

export default {
  data: new SlashCommandBuilder()
    .setName("add-progress")
    .setDescription("Add improvement notes to a student's progress entry.")
    .addStringOption(option =>
      option.setName("entryid")
        .setDescription("Progress entry ID")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName("improvement")
        .setDescription("Improvement score (1–10)")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("tags")
        .setDescription("Skill tags (aim, movement, etc.)")
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName("comments")
        .setDescription("Coach comments")
        .setRequired(false)
    ),

  async execute(interaction) {
    const entryId = interaction.options.getString("entryid");
    const improvement = interaction.options.getInteger("improvement");
    const tags = interaction.options.getString("tags")?.split(",").map(t => t.trim()) || [];
    const comments = interaction.options.getString("comments") || null;

    let progress = JSON.parse(fs.readFileSync(progressPath, "utf8"));
    const entry = progress.find(p => p.id === entryId);

    if (!entry) {
      return interaction.reply({ content: "❌ Progress entry not found.", ephemeral: true });
    }

    if (entry.coachId !== interaction.user.id) {
      return interaction.reply({ content: "❌ You can only edit your own sessions.", ephemeral: true });
    }

    entry.improvementScore = improvement;
    entry.skillTags = tags;
    entry.coachComments = comments;

    fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));

    return interaction.reply({
      content: "✅ Progress updated.",
      ephemeral: true
    });
  }
};
