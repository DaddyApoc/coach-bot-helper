import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits
} from "discord.js";
import fs from "fs";

const filePath = "/data/coaches.json";

export default {
  data: new SlashCommandBuilder()
    .setName("coach-edit-availability")
    .setDescription("Edit a coach's availability.")
    .addUserOption(option =>
      option.setName("coach")
        .setDescription("The coach to edit")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("availability")
        .setDescription("New availability (Online, Offline, Busy, etc.)")
        .setRequired(true)
    ),

  async execute(interaction) {
    const coachUser = interaction.options.getUser("coach");
    const newAvailability = interaction.options.getString("availability");

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

    coach.availability = newAvailability;

    fs.writeFileSync(filePath, JSON.stringify(coaches, null, 2));

    const embed = new EmbedBuilder()
      .setTitle("Coach Availability Updated")
      .setDescription(`Availability updated for **${coachUser.username}**`)
      .addFields({ name: "New Availability", value: newAvailability })
      .setColor("Aqua");

    return interaction.reply({ embeds: [embed] });
  }
};
