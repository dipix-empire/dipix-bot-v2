import Discord from "discord.js"
import { logLevel } from "./Logger"

export default interface Config {
	logLevel: logLevel,
	bot: {
		intents: Discord.GatewayIntentBits[]
		guildId: string
		clientId: string,
		channels: {
			chatIntagration: string,
			manageChannel: string,
			consoleIntegration: string
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
		},
	},
	minecraft: {
		uri: string
	}
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
			botlink: string,
			updateTimes: any[]
			updateRange: number,
			noPaymentRole: string,
			checkOnStart?: boolean
		}
	}
}
