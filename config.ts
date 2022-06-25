import Config from "./src/types/Config";
import Discord from "discord.js"

export default {
	bot: {
		channels: {
			chatIntagration: "986284398347419728",
			consoleIntegration: ""
		},
		roles: {

		},
		intents: [
			Discord.Intents.FLAGS.GUILDS,
			Discord.Intents.FLAGS.GUILD_MESSAGES,
			Discord.Intents.FLAGS.GUILD_MEMBERS,
			Discord.Intents.FLAGS.DIRECT_MESSAGES,
		]
	},
	minecraft_server_api: {
		chat: {
			globalPrefix: "[GC]"
		},
		uri: {
			ws: "ws://localhost:4567/v1/ws/console",
			http: "http://localhost:4567/v1"
		}
	},
	modules: {
		chat: {
			minecraftSendPattern: (user, message) => `[DC] ${user} >> ${message}`
		}
	},
	bus: {
		messageTimeout: 10 * 1_000
	}
} as Config