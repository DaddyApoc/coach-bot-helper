const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rate-coach")
    .setDescription("Rate a coach after a completed session")
    .addUserOption(option =>
      option.setName("coach")
        .setDescription("Coach you want to rate")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName("rating")
        .setDescription("Rating from 1 to 5")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("comment")
        .setDescription("Optional comment")
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName("tags")
        .setDescription("Optional comma-separated tags (e.g. aim, movement, game-sense)")
        .setRequired(false)
    ),

  async execute(interaction) {
    try {
      const coachUser = interaction.options.getUser("coach");
      const rating = interaction.options.getInteger("rating");
      const comment = interaction.options.getString("comment") || "";
      const tags = interaction.options.getString("tags")
        ? interaction.options.getString("tags").split(",").map(t => t.trim()) 
        : [];

      // Validate rating
      if (rating < 1 || rating > 5) {
        return interaction.reply("❌ Rating must be between **1** and **5**.");
      }

      // Load coach data
      const coachesFile = "data/coaches.json";
      const ratingsFile = "data/ratings.json";

      if (!fs.existsSync(coachesFile)) fs.writeFileSync(coachesFile, JSON.stringify([]));
      if (!fs.existsSync(ratingsFile)) fs.writeFileSync(ratingsFile, JSON.stringify([]));

      const coaches = JSON.parse(fs.readFileSync(coachesFile, "utf8"));
      const ratings = JSON.parse(fs.readFileSync(ratingsFile, "utf8"));

      const coach = coaches.find(c => c.id === coachUser.id);

      if (!coach) {
        return interaction.reply("❌ That user is not registered as a coach.");
      }

      if (coach.suspended) {
        return interaction.reply("⛔ This coach is currently suspended and cannot be rated.");
      }

      // Prevent self-rating
      if (coachUser.id === interaction.user.id) {
        return interaction.reply("❌ You cannot rate yourself.");
      }

      // Prevent rating without a completed session
      const sessions = JSON.parse(fs.readFileSync("data/sessions.json", "utf8"));
      const completed = sessions.find(
        s =>
          s.coachId === coachUser.id &&
          s.studentId === interaction.user.id &&
          s.status === "completed"
      );

      if (!completed) {
        return interaction.reply("❌ You can only rate a coach **after completing a session** with them.");
      }

      // Save rating
      ratings.push({
        coachId: coachUser.id,
        studentId: interaction.user.id,
        rating,
        comment,
        tags,
        date: new Date().toISOString()
      });

      fs.writeFileSync(ratingsFile, JSON.stringify(ratings, null, 2));

      // Recalculate coach average rating
      const coachRatings = ratings.filter(r => r.coachId === coachUser.id);
      const avg =
        coachRatings.reduce((sum, r) => sum + r.rating, 0) / coachRatings.length;

      coach.rating = Math.round(avg * 10) / 10; // round to 1 decimal place

      fs.writeFileSync(coachesFile, JSON.stringify(coaches, null, 2));

      await interaction.reply(
        `⭐ You rated **${coachUser.username}** **${rating}/5**.\n` +
        (comment ? `💬 Comment: *${comment}*\n` : "") +
        (tags.length ? `🏷️ Tags: ${tags.join(", ")}` : "")
      );

    } catch (err) {
      console.error(err);
      await interaction.reply("❌ Error submitting rating.");
    }
  }
};
