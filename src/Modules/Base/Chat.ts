import { Message, EmbedBuilder, TextChannel } from "discord.js";
import { EventEmitter } from "stream";
import App from "../../App";
import { newLineData } from "../../Clients/LegacyMinecraft";
import AppBusModuleComponent from "../../types/AppBus/ModuleComponent";
import Logger from "../../types/Logger";
import Module from "../../types/Module";
import DiscordEvent from "../../types/ModuleEvent/DiscordEvent";
import MinecraftEvent from "../../types/ModuleEvent/MinecraftEvent";

export default new Module(
	"chat", (app: App, appBusModule: AppBusModuleComponent, logger: Logger) => {
		return [ 
			new DiscordEvent("messageCreate", async (msg: Message) => {
				if (msg.channel.id != app.config.bot.channels.chatIntagration) return
				let user = await app.prisma.user.findUnique({where: {id: msg.author.id}, select: {nickname: true}})
				if (!user) return logger.Error(new Error("Undefined user."))
				if (!msg.content) return logger.Debug(`Ignoring empty message content `)
				app.minecraft.sendToConsole(`tellraw @a ${app.config.modules.chat.minecraftSendPattern(user.nickname, msg.content)}`)
			}),
			new MinecraftEvent("PlayerChat", async (ctx: any) => {
				try {
					if (!ctx.message.startsWith("!")) return
					let user = await app.prisma.user.findFirst({where: {nickname: ctx.player}})
					if (!user) return logger.Error(new Error("Undefined user."))
					let dUser = await app.bot.users.fetch(user.discord)
					await (app.bot.channels.cache.get(app.config.bot.channels.chatIntagration) as TextChannel)
						.send({embeds: [
							new EmbedBuilder()
								.setDescription(`<@${dUser.id}> **->** ${ctx.message}`)
						]})
				} catch(err) {
					logger.Error(err)
				}
			})
		]
	}
)
