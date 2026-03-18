import {
  SlashCommandBuilder,
  EmbedBuilder
} from "discord.js";
import fs from "fs";

const filePath = "/data/coaches.json";

export default {
  data: new SlashCommandBuilder()
    .setName("coach-edit-tags")
    .setDescription("Edit a coach's tags.")
    .addUserOption(option =>
      option.setName("coach")
        .setDescription("The coach to edit")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("tags")
        .setDescription("Comma-separated tags (e.g. aim, movement, rifles)")
        .setRequired(true)
    ),

  async execute(interaction) {
    const coachUser = interaction.options.getUser("coach");
    const newTags = interaction.options.getString("tags");

    let coaches = [];
    if (fs.existsSync(filePath)) {
      coaches = JSON.parse(fs.readFileSync(filePath, "utf8"));
    }

    const coach = coaches.find(c => c.id === coachUser.id);
    if (!coach) {
      return interaction.reply({
        content: "❌ That coach is not registered.",
        ephemeral: true,
      });
    }

    coach.tags = newTags.split(",").map(t => t.trim());

    fs.writeFileSync(filePath, JSON.stringify(coaches, null, 2));

    const embed = new EmbedBuilder()
      .setTitle("Coach Tags Updated")
      .setDescription(`Tags updated for **${coachUser.username}**`)
      .addFields({ name: "New Tags", value: coach.tags.join(", ") })
      .setColor("Pink");

    return interaction.reply({ embeds: [embed] });
  }
};
