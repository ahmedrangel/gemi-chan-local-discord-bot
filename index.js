import { Client, GatewayIntentBits } from "discord.js";
import express from "express";
// import { getNotification } from "./kick-notificator.js";
import { diasFaltantes, birthdaysList } from "./functions.js";
const server = express();

server.all("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.write("<link href=\"https://fonts.googleapis.com/css?family=Roboto Condensed\" rel=\"stylesheet\"> <style> body {font-family: \"Roboto Condensed\";font-size: 22px;} <p>Hosting Active</p>");
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
  const zihne_guild = client.guilds.cache.get("1058558693001658448");
  const birthday_rol = zihne_guild.roles.cache.get("1131030143075373116");
  const channel_scheduled = await client.channels.fetch("1048659746137317498");
  /*
  // Chequear si está Live en Kick
  const checkKickLive = async() => {
    const notificator = await getNotification("Zihnee");
   ; notificator != null ? channel_notification.send(notificator) : null;
  }
  setInterval(await checkKickLive, 180000);
  */

  // Birthdays list
  let lista = await birthdaysList();
  console.log(lista);
  const actLista = (newLista) => {
    lista = newLista;
    console.log(lista);
  };

  // Update Birthdays list
  const updateBirthdays = async () => {
    let updtLista = [];
    updtLista = await birthdaysList();
    actLista(updtLista);
  };
  const birthdaysCheck = setInterval(updateBirthdays, 1800000);

  // Birthday role adder & remover
  const birthdayRoleRemover = async () => {
    const gmtM5time = new Date().getTime() - 18000000;
    const currentDate = new Date(gmtM5time);
    const currentDay = `${currentDate.getFullYear()}-${currentDate.getMonth()+1}-${currentDate.getDate()}`;
    console.log("Hoy: " + currentDay + ", Target: " + lista[0].day);
    for (const item of lista) {
      const targetDay = item.day;
      if (targetDay != currentDay && item.status == 1) {
        console.log("Se ha quitado el rol");
        await fetch(process.env["GEMIDOR_WORKER"] + "/birthdays/0/" + item.id);
        const member = await zihne_guild.members.fetch(item.id);
        member.roles.remove(birthday_rol);
        updateBirthdays();
      } else if (targetDay == currentDay && item.status == 0) {
        console.log("Se ha puesto el rol");
        const member = await zihne_guild.members.fetch(item.id);
        member.roles.add(birthday_rol);
        await fetch(process.env["GEMIDOR_WORKER"] + "/birthdays/1/"+ item.id);
        channel_scheduled.send({
          content: `✨ Hoy es el cumpleaños de <@${item.id}> (${item.username}), FELIZ CUMPLEAÑOS!! 🎂 🍰 🥳 🎉 🎈`
        });
        updateBirthdays();
      }
    }
  };
  const birthdayRoleCheck = setInterval(birthdayRoleRemover, 120000);
});

client.on("messageCreate", async (message) => {
  const split = message.content.split(" "); // Split on spaces
  const command = split[0].toLowerCase(); // Extract command no case sensitive
  const mensaje = split.slice(1).join(" "); // Slice command and rejoin the rest of the array
  const { username } = message.author;
  switch (command) {
  // Comando ia
  case "!ia":
    await message.channel.sendTyping();
    console.log(mensaje);
    try {
      const data = await fetch(`${process.env["AHMED_WORKER"]}/dc/ai/${encodeURIComponent(username)}/${encodeURIComponent(mensaje.replaceAll(/"/g, "").replaceAll(/\n/g, " "))}`);
      let respuesta = await data.text();
      if (respuesta.length > 1998) {
        respuesta = respuesta.slice(0, 1998);
        console.log("Respuesta supera los 1999 caracteres");
      }
      console.log(respuesta);
      message.reply(respuesta.replace("Gemi-chan: ", ""));
    } catch (error) {
      console.log(error);
    }
    break;
  }
});

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

client.login(process.env["DISCORD_TOKEN"]);

const keep = () => {
  console.log("keep");
};
setInterval(keep, 120000);

const keepAlive = () => {
  server.listen(3000, () => { console.log("Server is online!"); });
};
keepAlive();