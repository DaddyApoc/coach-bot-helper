// index.js
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client, Collection, GatewayIntentBits, Partials, Events } = require("discord.js");

const handleCoachSetupButtons = require("./interactions/coachSetupButtons");
const handleCoachSetupModals = require("./interactions/coachSetupModals");

const { TOKEN } = process.env;
if (!TOKEN) {
  console.error("❌ Missing TOKEN in environment.");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

client.commands = new Collection();

// Load commands from subfolders
const commandsPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
  const folderPath = path.join(commandsPath, folder);
  const commandFiles = fs
    .readdirSync(folderPath)
    .filter(file => file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(folderPath, file);
    const command = require(filePath);

    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.warn(
        `[WARNING] The command at ${filePath} is missing "data" or "execute".`
      );
    }
  }
}

client.once(Events.ClientReady, c => {
  console.log(`✅ Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  try {
    // Coach setup buttons & modals
    await handleCoachSetupButtons(interaction);
    await handleCoachSetupModals(interaction);

    // Slash commands
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
      console.warn(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    await command.execute(interaction);
  } catch (error) {
    console.error("❌ Error handling interaction:", error);

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "❌ There was an error while executing this command.",
        ephemeral: true
      });
    } else {
      await interaction.reply({
        content: "❌ There was an error while executing this command.",
        ephemeral: true
      });
    }
  }
});

client.login(TOKEN);
