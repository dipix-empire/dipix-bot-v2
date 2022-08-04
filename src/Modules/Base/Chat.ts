import { Message, TextChannel } from "discord.js";
import { EventEmitter } from "stream";
import App from "../../App";
import { newLineData } from "../../Clients/Minecraft";
import AppBusModuleComponent from "../../types/AppBus/ModuleComponent";
import Logger from "../../types/Logger";
import Module from "../../types/Module";
import DiscordEvent from "../../types/ModuleEvent/DiscordEvent";
import ServertapEvent from "../../types/ModuleEvent/MinecraftEvent";

export default new Module(
	"chat", (app: App, appBusModule: AppBusModuleComponent, logger: Logger) => {
		return [ 
			new DiscordEvent("messageCreate", (msg: Message) => {
				if (msg.channel.id != app.config.bot.channels.chatIntagration) return
				
			}),
			new ServertapEvent("newline", async (line: newLineData) => {
				try {
					if (!line.msg.startsWith(app.config.minecraft_server_api.chat.globalPrefix)) return
					await (app.bot.channels.cache.get(app.config.bot.channels.chatIntagration) as TextChannel).send(line.msg)
				} catch(err) {
					logger.Error(err)
				}
			})
		]
	}
)