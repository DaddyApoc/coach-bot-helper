const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");
require("dotenv").config();

const commands = [];
const commandFiles = [];
const commandsPath = path.join(__dirname, "commands");

console.log("Loading command files...\n");

function loadCommands(dir) {
  const folderPath = path.join(commandsPath, dir);
  const files = fs.readdirSync(folderPath).filter(f => f.endsWith(".js"));

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const command = require(filePath);

    if (!command.data || !command.data.name) {
      console.log(`Skipped invalid command file: ${filePath}`);
      continue;
    }

    const name = command.data.name;

    console.log(`Loaded: ${name} (${filePath})`);

    commands.push(command.data.toJSON());
    commandFiles.push({ name, filePath });
  }
}

const folders = fs.readdirSync(commandsPath);
folders.forEach(folder => loadCommands(folder));

console.log("\nFinal Command List:\n");
commands.forEach((cmd, index) => {
  console.log(`${index + 1}. ${cmd.name}`);
});
console.log("\n");

// Duplicate Detection
const nameCounts = {};
const duplicates = [];

for (const cmd of commandFiles) {
  if (!nameCounts[cmd.name]) nameCounts[cmd.name] = [];
  nameCounts[cmd.name].push(cmd.filePath);
}

for (const name in nameCounts) {
  if (nameCounts[name].length > 1) {
    duplicates.push({ name, files: nameCounts[name] });
  }
}

if (duplicates.length > 0) {
  console.log("Duplicate command names detected:\n");

  duplicates.forEach(dup => {
    console.log(`Duplicate name: "${dup.name}"`);
    dup.files.forEach(f => console.log(`  -> ${f}`));
    console.log("");
  });

  console.log("Deployment cancelled. Fix duplicates and try again.");
  process.exit(1);
}

// Deploy
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log(`Deploying ${commands.length} commands...\n`);

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );

    console.log("Commands deployed successfully.");
  } catch (error) {
    console.error("\nError deploying commands:");
    console.error(error);

    if (error.rawError?.errors) {
      console.log("\nDiscord Error Details:");
      console.log(JSON.stringify(error.rawError.errors, null, 2));
    }
  }
})();
