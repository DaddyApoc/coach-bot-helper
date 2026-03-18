import {
  SlashCommandBuilder,
  EmbedBuilder
} from "discord.js";
import fs from "fs";

const filePath = "/data/coaches.json";

export default {
  data: new SlashCommandBuilder()
    .setName("coach-edit-schedule")
    .setDescription("Edit a coach's schedule.")
    .addUserOption(option =>
      option.setName("coach")
        .setDescription("The coach to edit")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("schedule")
        .setDescription("New schedule (e.g. Weekdays 5-9 PM)")
        .setRequired(true)
    ),

  async execute(interaction) {
    const coachUser = interaction.options.getUser("coach");
    const newSchedule = interaction.options.getString("schedule");

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

    coach.schedule = newSchedule;

    fs.writeFileSync(filePath, JSON.stringify(coaches, null, 2));

    const embed = new EmbedBuilder()
      .setTitle("Coach Schedule Updated")
      .setDescription(`Schedule updated for **${coachUser.username}**`)
      .addFields({ name: "New Schedule", value: newSchedule })
      .setColor("Orange");

    return interaction.reply({ embeds: [embed] });
  }
};
