import { Message, TextChannel } from "discord.js";
import { EventEmitter } from "stream";
import App from "../App";
import Module from "../types/Module";
import DiscordEvent from "../types/ModuleEvent/DiscordEvent";
import ServertapEvent from "../types/ModuleEvent/ServertapEvent";

export default new Module(
	"chat", (app: App) => {
		return [ 
			new DiscordEvent("messageCreate", (msg: Message) => {
				if (msg.channel.id != app.config.bot.channels.chatIntagration) return
				
			}),
			new ServertapEvent("newline", async (line: string) => {
				if (!line.startsWith(app.config.servertap.chat.globalPrefix)) return
				await (app.bot.channels.cache.get(app.config.bot.channels.chatIntagration) as TextChannel).send(line)
			})
		]
	}
)