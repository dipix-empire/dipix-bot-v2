import Discord from "discord.js"

export default interface Config {
	bot: {
		intents: Discord.BitFieldResolvable<Discord.IntentsString, number>,
		channels: {
			chatIntagration: string
		}
	},
	servertap: {
		chat: {
			globalPrefix: string
		},
		uri: {
			ws: string
		}
	}
}