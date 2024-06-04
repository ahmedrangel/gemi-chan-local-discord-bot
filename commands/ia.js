export const IA = async (interaction, text, username) => {
  await interaction.channel.sendTyping();
  const response = await fetch(`${process.env["AHMED_WORKER"]}/dc/ai/${encodeURIComponent(username)}/${encodeURIComponent(text.replaceAll(/"/g, "").replaceAll(/\n/g, " "))}`);
  const data = await response.json();
  console.log(data);

  if (data.status !== 200) return interaction.reply("Error. No se ha podido generar una respuesta.");

  let msg = data.message;
  if (msg.length > 1998) {
    msg = msg.slice(0, 1998);
    console.log("Respuesta supera los 1999 caracteres");
  }
  interaction.reply(msg);
}