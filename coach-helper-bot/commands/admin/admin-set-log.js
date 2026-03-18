import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import fs from "fs";

const adminConfigPath = "data/adminConfig.json";

export default {
  data: new SlashCommandBuilder()
    .setName("admin-set-log")
    .setDescription("Set the admin moderation log channel.")
    .addChannelOption(option =>
      option.setName("channel")
        .setDescription("Channel to send moderation logs to")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");

    let config = {};
    if (fs.existsSync(adminConfigPath)) {
      config = JSON.parse(fs.readFileSync(adminConfigPath, "utf8"));
    }

    config.logChannel = channel.id;

    fs.writeFileSync(adminConfigPath, JSON.stringify(config, null, 2));

    return interaction.reply({
      content: `✅ Moderation log channel set to ${channel}.`,
      ephemeral: true
    });
  }
};
