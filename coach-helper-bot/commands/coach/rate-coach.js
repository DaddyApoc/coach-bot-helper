import {
  SlashCommandBuilder,
  EmbedBuilder
} from "discord.js";
import fs from "fs";

const feedbackPath = "/data/feedback.json";
const coachesPath = "/data/coaches.json";

export default {
  data: new SlashCommandBuilder()
    .setName("rate-coach")
    .setDescription("Submit feedback for a coach.")
    .addUserOption(option =>
      option.setName("coach")
        .setDescription("The coach you are rating")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName("rating")
        .setDescription("Rating from 1 to 5")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("comment")
        .setDescription("Your feedback")
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName("tags")
        .setDescription("Comma-separated tags (aim, movement, communication)")
        .setRequired(false)
    ),

  async execute(interaction) {
    const coachUser = interaction.options.getUser("coach");
    const studentUser = interaction.user;
    const rating = interaction.options.getInteger("rating");
    const comment = interaction.options.getString("comment") || "No comment";
    const tags = interaction.options.getString("tags")?.split(",").map(t => t.trim()) || [];

    if (rating < 1 || rating > 5) {
      return interaction.reply({ content: "❌ Rating must be between 1 and 5.", ephemeral: true });
    }

    let feedback = JSON.parse(fs.readFileSync(feedbackPath, "utf8"));
    let coaches = JSON.parse(fs.readFileSync(coachesPath, "utf8"));

    const entry = {
      id: Date.now().toString(),
      coachId: coachUser.id,
      coachName: coachUser.username,
      studentId: studentUser.id,
      studentName: studentUser.username,
      rating,
      comment,
      tags,
      created: new Date().toISOString()
    };

    feedback.push(entry);

    // Update coach rating
    const coach = coaches.find(c => c.id === coachUser.id);
    if (coach) {
      const coachFeedback = feedback.filter(f => f.coachId === coachUser.id);
      const avg = coachFeedback.reduce((a, b) => a + b.rating, 0) / coachFeedback.length;
      coach.rating = Number(avg.toFixed(2));
    }

    fs.writeFileSync(feedbackPath, JSON.stringify(feedback, null, 2));
    fs.writeFileSync(coachesPath, JSON.stringify(coaches, null, 2));

    return interaction.reply({
      content: `⭐ Thank you! Your feedback for **${coachUser.username}** has been submitted.`,
      ephemeral: true
    });
  }
};
