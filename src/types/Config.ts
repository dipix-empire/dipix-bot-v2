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
		uri: string,
		port: number,
	}
	rest: {
		port: number
	},
	modules: {
		chat: {
			minecraftSendPattern: (user: string, message: string) => string,
			discord: {
				serverOnline: (online: boolean) => string,
				playerJoined: (player: string, online: boolean) => string,
				playerMessage: (player: string, message: string) => string
			}
		},
		profiles: {
			skinDirectory: string
		},
		payments: {
			botlink: string,
			updateTimes: {
				reminder: string,
				renewal: string,
				ping: string
			},
			updateRange: number,
			noPaymentRole: string,
			checkOnStart?: boolean
		},
		connect: {
			java: {
				ip: string,
				version: string
			},
			bedrock: {
				ip: string,
				port: string,
				version: string
			}
		},
		names: {
			emoji: string,
			enabled: true,
			content: string[],
			rule: string
		},
		join: {
			channels: {
				panel: string,
				discuss: string
			},
			playerRole: string,
			guestRole: string
		},
		goodmorning: {
			emojis: string[],
			regex: RegExp
		}
	}
}
