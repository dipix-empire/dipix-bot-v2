
import Config from "./src/types/Config";
import Discord from "discord.js"

export default {
	logLevel: 4,
	bot: {
		channels: {
			chatIntagration: "986284398347419728",
			consoleIntegration: "",
			manageChannel: "879413198846038026"
		},
		roles: {
			administration: "879289786597257216/"
		},
		guildId: "812993519177826365",
		clientId: "986328241042239508",
		intents: [
			Discord.GatewayIntentBits.Guilds,
			Discord.GatewayIntentBits.GuildMessages,
			Discord.GatewayIntentBits.GuildMembers,
			Discord.GatewayIntentBits.DirectMessages,
		]
	},
	minecraft_server_api: {
		web: {
			ws: "ws://localhost:4567/v1/ws/console",
			http: "http://localhost:4567/v1",
			port: 4568
		}
	},
	rest: {
		port: 3000
	},
	modules: {
		chat: {
			minecraftSendPattern: (user, message) => `[DC] ${user} >> ${message}`
		},
		profiles: {
			skinDirectory: process.cwd() + '/images/skins'
		},
		payments: {
			botlink: "https://t.me/philainel",
			updateRange: 24 * 60 * 60 * 1000,
			updateTimes: [{ hours: 10, minutes: 0 }],
			noPaymentRole: "1007353560746430616",
			checkOnStart: true
		}
	}
} as Config
