import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import fs from "fs";
import { logAdminEvent } from "../../utils/adminLogger.js";

const coachesPath = "data/coaches.json";
const verifiedRoleId = "1483922835901517975"; // The Generals

export default {
  data: new SlashCommandBuilder()
    .setName("admin-suspend")
    .setDescription("Suspend a coach from the platform.")
    .addUserOption(option =>
      option.setName("coach")
        .setDescription("Coach to suspend")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("reason")
        .setDescription("Reason for suspension")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const coachUser = interaction.options.getUser("coach");
    const reason = interaction.options.getString("reason");

    if (!fs.existsSync(coachesPath)) {
      return interaction.reply({ content: "❌ No coaches found.", ephemeral: true });
    }

    const coaches = JSON.parse(fs.readFileSync(coachesPath, "utf8"));
    const coach = coaches.find(c => c.id === coachUser.id);

    if (!coach) {
      return interaction.reply({ content: "❌ That user is not a coach.", ephemeral: true });
    }

    coach.suspended = true;
    coach.verified = false;

    fs.writeFileSync(coachesPath, JSON.stringify(coaches, null, 2));

    // Remove The Generals role
    const member = await interaction.guild.members.fetch(coachUser.id).catch(() => null);
    if (member) {
      await member.roles.remove(verifiedRoleId).catch(() => {});
    }

    // DM coach
    try {
      await coachUser.send(
        `⛔ You have been **suspended** from coaching.\n**Reason:** ${reason}\n` +
        "You may appeal to the admin team."
      );
    } catch {}

    // Log event
    logAdminEvent(
      interaction.client,
      "⛔ Coach Suspended",
      `**Coach:** ${coachUser}\n**Reason:** ${reason}\n**By:** ${interaction.user}`
    );

    return interaction.reply({
      content: `⛔ ${coachUser} has been suspended.`,
      ephemeral: true
    });
  }
};
