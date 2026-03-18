import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import fs from "fs";

const coachesPath = "data/coaches.json";

export default {
  data: new SlashCommandBuilder()
    .setName("coach-profile")
    .setDescription("View a coach's profile.")
    .addUserOption(option =>
      option.setName("coach")
        .setDescription("Coach to view")
        .setRequired(true)
    ),

  async execute(interaction) {
    const coachUser = interaction.options.getUser("coach");

    if (!fs.existsSync(coachesPath)) {
      return interaction.reply({ content: "❌ No coaches registered yet.", ephemeral: true });
    }

    const coaches = JSON.parse(fs.readFileSync(coachesPath, "utf8"));
    const coach = coaches.find(c => c.id === coachUser.id);

    if (!coach) {
      return interaction.reply({ content: "❌ That coach has not set up a profile yet.", ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle(`🎓 Coach Profile — ${coach.username || coachUser.username}`)
      .setColor("Gold")
      .setDescription(coach.about || "No About Me set yet.")
      .addFields(
        { name: "Specialties", value: (coach.specialties || []).join(", ") || "None", inline: true },
        { name: "Weapons", value: (coach.weapons || []).join(", ") || "None", inline: true },
        { name: "Experience", value: coach.experience || "None", inline: false }
      );

    if (coach.banner) {
      embed.setImage(coach.banner);
    }

    return interaction.reply({ embeds: [embed] });
  }
};

import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import fs from "fs";

const coachesPath = "data/coaches.json";

export default {
  data: new SlashCommandBuilder()
    .setName("coach-profile")
    .setDescription("View a coach's profile.")
    .addUserOption(option =>
      option.setName("coach")
        .setDescription("Coach to view")
        .setRequired(true)
    ),

  async execute(interaction) {
    const coachUser = interaction.options.getUser("coach");

    if (!fs.existsSync(coachesPath)) {
      return interaction.reply({ content: "❌ No coaches registered yet.", ephemeral: true });
    }

    const coaches = JSON.parse(fs.readFileSync(coachesPath, "utf8"));
    const coach = coaches.find(c => c.id === coachUser.id);

    if (!coach) {
      return interaction.reply({ content: "❌ That coach has not set up a profile yet.", ephemeral: true });
    }

    if (!coach.verified) {
      return interaction.reply({
        content: "❌ That coach is not verified yet and their profile is not public.",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(`🎓 Coach Profile — ${coach.username || coachUser.username}`)
      .setColor("Gold")
      .setDescription(coach.about || "No About Me set yet.")
      .addFields(
        { name: "Specialties", value: (coach.specialties || []).join(", ") || "None", inline: true },
        { name: "Weapons", value: (coach.weapons || []).join(", ") || "None", inline: true },
        { name: "Experience", value: coach.experience || "None", inline: false }
      );

    if (coach.banner) embed.setImage(coach.banner);

    return interaction.reply({ embeds: [embed] });
  }
};

if (coach.suspended) {
  return interaction.reply({
    content: "⛔ This coach is suspended and cannot be booked or viewed.",
    ephemeral: true
  });
}
