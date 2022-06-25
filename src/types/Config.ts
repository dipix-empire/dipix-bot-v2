import Discord from "discord.js"

export default interface Config {
	bot: {
		intents: Discord.BitFieldResolvable<Discord.IntentsString, number>,
		channels: {
			chatIntagration: string
		}
	},
	minecraft_server_api: {
		chat: {
			globalPrefix: string
		},
		uri: {
			ws: string
			http: string
		}
	}
	modules: {
		chat: {
			minecraftSendPattern: (user: string, message: string) => string
		}
	},
	bus: {
		messageTimeout: number
	}
}