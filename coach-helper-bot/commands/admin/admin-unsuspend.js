import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import fs from "fs";
import { logAdminEvent } from "../../utils/adminLogger.js";

const coachesPath = "data/coaches.json";
const verifiedRoleId = "1483922835901517975";

export default {
  data: new SlashCommandBuilder()
    .setName("admin-unsuspend")
    .setDescription("Reinstate a suspended coach.")
    .addUserOption(option =>
      option.setName("coach")
        .setDescription("Coach to reinstate")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const coachUser = interaction.options.getUser("coach");

    if (!fs.existsSync(coachesPath)) {
      return interaction.reply({ content: "❌ No coaches found.", ephemeral: true });
    }

    const coaches = JSON.parse(fs.readFileSync(coachesPath, "utf8"));
    const coach = coaches.find(c => c.id === coachUser.id);

    if (!coach) {
      return interaction.reply({ content: "❌ That user is not a coach.", ephemeral: true });
    }

    coach.suspended = false;

    fs.writeFileSync(coachesPath, JSON.stringify(coaches, null, 2));

    // Restore The Generals role
    const member = await interaction.guild.members.fetch(coachUser.id).catch(() => null);
    if (member) {
      await member.roles.add(verifiedRoleId).catch(() => {});
    }

    // DM coach
    try {
      await coachUser.send("✅ Your coaching suspension has been lifted. Welcome back.");
    } catch {}

    // Log event
    logAdminEvent(
      interaction.client,
      "✅ Coach Reinstated",
      `**Coach:** ${coachUser}\n**By:** ${interaction.user}`
    );

    return interaction.reply({
      content: `✅ ${coachUser} has been reinstated.`,
      ephemeral: true
    });
  }
};
