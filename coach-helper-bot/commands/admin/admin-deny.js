import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import fs from "fs";

const coachesPath = "data/coaches.json";
const deniedPath = "data/deniedCoaches.json";

export default {
  data: new SlashCommandBuilder()
    .setName("admin-deny")
    .setDescription("Deny a coach application and move it to deniedCoaches.")
    .addUserOption(option =>
      option.setName("coach")
        .setDescription("Coach to deny")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("reason")
        .setDescription("Reason for denial")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const coachUser = interaction.options.getUser("coach");
    const reason = interaction.options.getString("reason");

    if (!fs.existsSync(coachesPath)) {
      return interaction.reply({ content: "❌ No coaches found.", ephemeral: true });
    }

    let coaches = JSON.parse(fs.readFileSync(coachesPath, "utf8"));
    const coachIndex = coaches.findIndex(c => c.id === coachUser.id);

    if (coachIndex === -1) {
      return interaction.reply({ content: "❌ That user does not have a coach profile.", ephemeral: true });
    }

    const coach = coaches[coachIndex];

    // Remove from active coaches
    coaches.splice(coachIndex, 1);
    fs.writeFileSync(coachesPath, JSON.stringify(coaches, null, 2));

    // Add to deniedCoaches
    let denied = [];
    if (fs.existsSync(deniedPath)) {
      denied = JSON.parse(fs.readFileSync(deniedPath, "utf8"));
    }

    coach.denied = true;
    coach.verified = false;
    coach.deniedReason = reason;
    coach.deniedAt = new Date().toISOString();

    denied.push(coach);
    fs.writeFileSync(deniedPath, JSON.stringify(denied, null, 2));

    // DM coach
    try {
      await coachUser.send(
        "❌ Your coach application has been **denied**.\n" +
        `**Reason:** ${reason}\n\n` +
        "You may improve your profile and reapply in the future."
      );
    } catch {}

    return interaction.reply({
      content: `✅ ${coachUser}'s coach application has been denied and moved to **deniedCoaches.json**.`,
      ephemeral: true
    });
  }
};
