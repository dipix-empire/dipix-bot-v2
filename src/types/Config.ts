import Discord from "discord.js"
import { logLevel } from "./Logger"

export default interface Config {
	logLevel: logLevel,
	bot: {
		intents: Discord.BitFieldResolvable<Discord.IntentsString, number>,
		guildId: string
		clientId: string,
		channels: {
			chatIntagration: string,
			manageChannel: string
		},
		roles: {
			administration: string
		}
	},
	minecraft_server_api: {
		web: {
			ws: string
			http: string,
			port: number
		}
	},
	rest: {
		port: number
	},
	modules: {
		chat: {
			minecraftSendPattern: (user: string, message: string) => string
		},
		profiles: {
			skinDirectory: string
		},
		payments: {
			botlink: string
		}
	}
}