const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");

// Load JSON safely
function loadJSON(path) {
  if (!fs.existsSync(path)) return {};
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

// Save JSON safely
function saveJSON(path, data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("admin-payouts")
    .setDescription("View and process pending coach payouts")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    try {
      const earningsFile = "/data/earnings.json";
      const walletsFile = "/data/wallets.json";
      const coachesFile = "/data/coaches.json";

      const earnings = loadJSON(earningsFile);
      const wallets = loadJSON(walletsFile);
      const coaches = loadJSON(coachesFile);

      let pendingList = [];

      for (const coachId in earnings) {
        const coach = earnings[coachId];
        if (coach.pending > 0) {
          pendingList.push({
            coachId,
            amount: coach.pending
          });
        }
      }

      if (pendingList.length === 0) {
        return interaction.reply({
          content: "There are **no pending payouts**.",
          ephemeral: true
        });
      }

      // Build summary
      let summary = pendingList
        .map(p => `👤 <@${p.coachId}> — **$${p.amount}** pending`)
        .join("\n");

      const embed = new EmbedBuilder()
        .setTitle("💸 Pending Coach Payouts")
        .setDescription(summary)
        .setColor("Gold")
        .setFooter({ text: "Use /admin-payouts-confirm to process payouts." });

      return interaction.reply({ embeds: [embed], ephemeral: true });

    } catch (err) {
      console.error("ADMIN PAYOUTS ERROR:", err);
      return interaction.reply({
        content: "❌ An error occurred while loading payouts.",
        ephemeral: true
      });
    }
  }
};
