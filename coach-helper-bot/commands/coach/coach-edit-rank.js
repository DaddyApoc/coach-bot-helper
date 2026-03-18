import {
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";
import fs from "fs";

const filePath = "/data/coaches.json";

export default {
  data: new SlashCommandBuilder()
    .setName("coach-edit-rank")
    .setDescription("Edit a coach's rank.")
    .addUserOption(option =>
      option.setName("coach")
        .setDescription("The coach to edit")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("rank")
        .setDescription("The new rank")
        .setRequired(true)
    ),

  async execute(interaction) {
    const coachUser = interaction.options.getUser("coach");
    const newRank = interaction.options.getString("rank");

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

    coach.rank = newRank;

    fs.writeFileSync(filePath, JSON.stringify(coaches, null, 2));

    const embed = new EmbedBuilder()
      .setTitle("Coach Rank Updated")
      .setDescription(`Rank updated for **${coachUser.username}**`)
      .addFields({ name: "New Rank", value: newRank })
      .setColor("Blue");

    return interaction.reply({ embeds: [embed] });
  }
};
