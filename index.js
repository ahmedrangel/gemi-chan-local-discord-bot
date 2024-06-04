import { Client, GatewayIntentBits } from "discord.js";
import express from "express";
import "dotenv/config";
import * as C from "./commands/index.js";
import CharacterAI from "node_characterai";

const server = express();
const characterAI = new CharacterAI();
await characterAI.authenticateWithToken(process.env["CHARACTERAI_TOKEN"]);
const chat = await characterAI.createOrContinueChat("T5s3KtNBl_YKnKqPyivSkYiXupGceuq8Qxpcgc4o0Qg");

server.all("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.write("<p>Hosting Active</p>");
  res.end();
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildMembers,
  ]
});

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (interaction) => {
  const split = interaction.content.split(" "); // Split on spaces
  const command = split[0].toLowerCase(); // Extract command no case sensitive
  const text = split.slice(1).join(" "); // Slice command and rejoin the rest of the array
  const { username } = interaction.author;
  switch (command) {
  // Comando ia
  case "!ia":
    await C.IA(interaction, text, username);
    break;
  case "!zihnee":
    await C.Zihnee(interaction, chat, text, username);
    break;
  }
});

/*
client.on("guildMemberAdd", async (member) => {
  const zihne_guild = client.guilds.cache.get("1058558693001658448");
  const join_rol = zihne_guild.roles.cache.get("1059712226623230044");
  console.log(`Nuevo miembro: ${member.user.tag} se unió al servidor "${member.guild.name}"`);

  if (join_rol) {
    member.roles.add(join_rol)
      .then(() => {
        console.log(`Rol "${join_rol.name}" asignado a ${member.user.tag}`);
      })
      .catch((error) => {
        console.error(`Error al asignar el rol: ${error}`);
      });
  }
});
*/

client.login(process.env["DISCORD_TOKEN"]);

server.listen(3001, () => { console.log("Server is online! PORT 3001"); });