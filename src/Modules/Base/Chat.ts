import { Message, MessageEmbed, TextChannel } from "discord.js";
import { EventEmitter } from "stream";
import App from "../../App";
import { newLineData } from "../../Clients/Minecraft";
import AppBusModuleComponent from "../../types/AppBus/ModuleComponent";
import Logger from "../../types/Logger";
import Module from "../../types/Module";
import DiscordEvent from "../../types/ModuleEvent/DiscordEvent";
import MinecraftEvent from "../../types/ModuleEvent/MinecraftEvent";

export default new Module(
	"chat", (app: App, appBusModule: AppBusModuleComponent, logger: Logger) => {
		return [ 
			new DiscordEvent("messageCreate", (msg: Message) => {
				if (msg.channel.id != app.config.bot.channels.chatIntagration) return
				
			}),
			new MinecraftEvent("PlayerChat", async (ctx: any) => {
				try {
					if (!ctx.message.startsWith("!")) return
					let user = await app.prisma.user.findFirst({where: {nickname: ctx.player}})
					if (!user) return logger.Error(new Error("Undefined user."))
					let dUser = await app.bot.users.fetch(user.discord)
					await (app.bot.channels.cache.get(app.config.bot.channels.chatIntagration) as TextChannel)
						.send({embeds: [
							new MessageEmbed()
								.setDescription(`<@${dUser.id}> **->** ${ctx.message}`)
						]})
				} catch(err) {
					logger.Error(err)
				}
			})
		]
	}
)