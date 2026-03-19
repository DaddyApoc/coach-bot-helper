import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import fs from "fs";
import { logAdminEvent } from "../../utils/adminLogger.js";

const strikesPath = "data/strikes.json";

function ensureFile() {
  if (!fs.existsSync("data")) fs.mkdirSync("data", { recursive: true });
  if (!fs.existsSync(strikesPath)) {
    fs.writeFileSync(strikesPath, JSON.stringify([]));
  }
}

export default {
  data: new SlashCommandBuilder()
    .setName("admin-strike")
    .setDescription("Issue a strike to a coach.")
    .addUserOption(option =>
      option.setName("coach")
        .setDescription("Coach to strike")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("reason")
        .setDescription("Reason for the strike")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const coachUser = interaction.options.getUser("coach");
    const reason = interaction.options.getString("reason");

    ensureFile();
    let strikes = JSON.parse(fs.readFileSync(strikesPath, "utf8"));

    const entry = {
      coachId: coachUser.id,
      reason,
      issuedBy: interaction.user.id,
      timestamp: new Date().toISOString()
    };

    strikes.push(entry);
    fs.writeFileSync(strikesPath, JSON.stringify(strikes, null, 2));

    // DM coach
    try {
      await coachUser.send(
        `⚠️ You have received a **strike**.\n**Reason:** ${reason}\n` +
        "Please maintain professionalism to avoid suspension."
      );
    } catch {}

    // Log to admin channel
    logAdminEvent(
      interaction.client,
      "⚠️ Strike Issued",
      `**Coach:** ${coachUser}\n**Reason:** ${reason}\n**Issued by:** ${interaction.user}`
    );

    // Auto-suspend at 3 strikes
    const coachStrikes = strikes.filter(s => s.coachId === coachUser.id);
    if (coachStrikes.length >= 3) {
      logAdminEvent(
        interaction.client,
        "⛔ Auto-Suspension Triggered",
        `${coachUser} has reached **3 strikes** and will be suspended.`
      );
    }

    return interaction.reply({
      content: `✅ Strike issued to ${coachUser}.`,
      ephemeral: true
    });
  }
};
