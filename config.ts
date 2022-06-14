import Config from "./src/types/Config";
import Discord from "discord.js"

export default {
	bot: {
		channels: {
			chatIntagration: "986284398347419728"
		},
		intents: [
			Discord.Intents.FLAGS.GUILDS,
			Discord.Intents.FLAGS.GUILD_MESSAGES,
			Discord.Intents.FLAGS.GUILD_MEMBERS,
			Discord.Intents.FLAGS.DIRECT_MESSAGES,
		]
	},
	servertap: {
		chat: {
			globalPrefix: "[GC]"
		},
		uri: {
			ws: "ws://localhost:4567/v1/ws/console"
		}
	},
	modules: {
		chat: {
			minecraftSendPattern: (user, message) => `[DC] ${user} >> ${message}`
		}
	}
} as Config