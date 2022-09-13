const config = require("./config.json");
const Hypixel = require("hypixel-api-reborn");
const mineflayer = require("mineflayer");
const { MessageEmbed } = require("discord.js");
const hypixel = new Hypixel.Client(config["hypixelapikey"]);
const { Client, Intents } = require("discord.js");
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

const options = {
  host: "mc.hypixel.net",
  port: 25565,
  version: "1.8.9",
  auth: "mojang",
  username: config["minecraft-username"],
  password: config["minecraft-password"],
};

let mc;
(function init() {
  console.log("Logging in.");
  mc = mineflayer.createBot(options);
  mc._client.once("session", (session) => (options.session = session));
  mc.once("end", () => {
    process.exit();
  });
})();

let uuid;
let name;
mc.on("login", () => {
  uuid = mc._client.session.selectedProfile.id;
  name = mc._client.session.selectedProfile.name;
});

mc.on("message", (chatMsg) => {
  const msg = chatMsg.toString();

  // Says Welcome to a player when they join Hypixel
  if (msg.endsWith(" joined.") && msg.includes("Guild >")) {
    let var1 = msg.split(" ");

    setTimeout(() => {
      mc.chat("/gc Welcome Back " + var1[2] + "!");
    }, 1000);
  }

  // Sends the message to the discord channel when a player talks in Guild Chat
  if (msg.startsWith("Guild >") && msg.includes(":")) {
    if (msg.includes(name.toString())) return;

    let splitMsg = msg.split(" ");
    let i = msg.indexOf(":");
    let splitMsg2 = [msg.slice(0, i), msg.slice(i + 1)];

    let sender, sentMsg;
    if (splitMsg[2].includes("[")) {
      sender = splitMsg[3].replace(":", "");
    } else {
      sender = splitMsg[2].replace(":", "");
    }
    sentMsg = splitMsg2[1];

    hypixel.getPlayer(sender).then((player) => {
      var membersender = player.uuid;
      const embed = new MessageEmbed()
        .setAuthor({
          name: sender + ": " + sentMsg,
          iconURL: "https://crafatar.com/avatars/" + membersender,
        })
        .setColor("GREEN");
      client.channels.cache
        .get(config["discord-channel"])
        .send({ embeds: [embed] });
    });
  }
});

// When a discord member sends a message in the bot chat channel it sends it to hypixel
client.on("message", (message) => {
  if (
    message.channel.id !== config["discord-channel"] ||
    message.author.bot ||
    message.content.startsWith("-")
  )
    return;
  mc.chat(
    "/gc d. " +
      message.author.username.replace(" ", "") +
      ": " +
      message.content
  );
});

client.login(config["bot-token"]);
