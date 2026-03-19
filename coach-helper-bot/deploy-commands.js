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
  nameCounts[cmd.name].push(cmd
