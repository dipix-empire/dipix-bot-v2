import { Message, EmbedBuilder, TextChannel, Emoji } from "discord.js";
import Spp from "../../App";
import AppBusModuleComponent from "../../types/AppBus/ModuleComponent";
import Logger from "../../types/Logger";
import ModuleBuilder, { Module } from "../../types/Module";
import DiscordEvent from "../../types/ModuleEvent/DiscordEvent";
import MinecraftEvent from "../../types/ModuleEvent/MinecraftEvent";
import { ErrorEmbed } from "../../Data/Embeds";

export default new ModuleBuilder(
	"chat", (module: Module) => {
		module.addEvent(
			new DiscordEvent("messageCreate", async (msg: Message) => {
				try {
					if (msg.channel.id != module.app.config.bot.channels.chatIntagration) return
					if (msg.author.bot) return
					let user = await module.app.prisma.user.findUnique({ where: { discord: msg.author.id }, select: { nickname: true } })
					if (!user) {
						await msg.react('❌')
						return module.logger.Error(new Error("Undefined user."))
					}
					if (!msg.content) return module.logger.Debug(`Ignoring empty message content `)
					let data = msg.content.split("\n")
					let res = module.app.minecraft.sendChatMessage(user.nickname, data[0])
					data.shift()
					if (res) {
						await msg.react("✅")
						for (let i = 0; i < data.length; i++) {
							module.app.minecraft.sendChatMessage(user.nickname, data[i])
						}
					}
					else {
						await msg.react('❌')
						let reply = await msg.reply({ embeds: [ErrorEmbed("No server connection available.")] })
						setTimeout(async (msg: Message, logger: Logger) => {
							try {
								msg.deletable && await msg.delete()
							} catch (err) {
								logger.Error(err)
							}
						}, 5_000, reply, module.logger)
					}
				} catch (err) {
					module.logger.Error(err)
				}

			}),
			new MinecraftEvent("msg", async (msg: { sender: string, content: string }) => {
				try {
					// if (!msg.content.startsWith("!")) return
					module.logger.Debug("Recieved message:", msg)
					let user = await module.app.prisma.user.findFirst({ where: { nickname: msg.sender } })
					if (!user) return module.logger.Error(new Error("Undefined user."))
					// let dUser = await module.app.bot.users.fetch(user.discord)
					let channel = (module.app.bot.channels.cache.get(module.app.config.bot.channels.chatIntagration)) as TextChannel
					await channel.send({
						embeds: [
							new EmbedBuilder()
								.setDescription(`<@${user.discord}> **->** ${msg.content}`)
						]
					})
					// await channel.send(`<@${user.discord}> **->** ${msg.content}`)
				} catch (err) {
					module.logger.Error(err)
				}
			})
		)
		return module
	}
)
