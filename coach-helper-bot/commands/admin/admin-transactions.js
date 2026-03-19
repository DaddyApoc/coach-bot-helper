import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import fs from "fs";
import path from "path";

export default {
  data: new SlashCommandBuilder()
    .setName("admin-transactions")
    .setDescription("View all admin transactions")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const filePath = path.join(process.cwd(), "data", "admin.json");
    const admin = JSON.parse(fs.readFileSync(filePath, "utf8"));

    const refunds = admin.refunds.slice(-10).reverse();
    const adjustments = admin.adjustments.slice(-10).reverse();

    let msg = "**Recent Admin Transactions**\n\n";

    msg += "**Refunds:**\n";
    msg += refunds.length
      ? refunds.map(r => `• $${r.amount} to ${r.userId} — ${r.reason}`).join("\n")
      : "None\n";

    msg += "\n\n**Adjustments:**\n";
    msg += adjustments.length
      ? adjustments.map(a => `• $${a.amount} for ${a.userId} — ${a.reason}`).join("\n")
      : "None";

    await interaction.reply({
      content: msg,
      ephemeral: true,
    });
  },
};
