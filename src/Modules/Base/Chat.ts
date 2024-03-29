import { Message, EmbedBuilder, TextChannel, Emoji, Colors } from "discord.js";
import Logger from "../../types/Logger";
import ModuleBuilder, { Module } from "../../types/Module";
import DiscordEvent from "../../types/ModuleEvent/DiscordEvent";
import MinecraftEvent from "../../types/ModuleEvent/MinecraftEvent";
import { ErrorEmbed } from "../../Data/Embeds";
import { Sleep } from "../../types/Util";

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
					try {
						await module.app.minecraft.sendChatMessage(user.nickname, data[0])
						data.shift()
						await msg.react("✅")
						// if (data.length == 0) return
						for (let i = 0; i < data.length; i++) {
							await Sleep(200)
							module.app.minecraft.sendChatMessage(user.nickname, data[i])
						}
					} catch(err) {
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
			new MinecraftEvent("message", async (msg: { sender: string, content: string }) => {
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
								.setDescription(module.app.config.modules.chat.discord.playerMessage(user.discord, msg.content) || `**[💬]** <@${user.discord}> **->** ${msg.content}`)
						]
					})
					// await channel.send(`<@${user.discord}> **->** ${msg.content}`)
				} catch (err) {
					module.logger.Error(err)
				}
			}),
			new MinecraftEvent("status", async (status: { online: boolean }) => {
				try {
					module.logger.Debug("Recieved status:", status)
					let channel = (module.app.bot.channels.cache.get(module.app.config.bot.channels.chatIntagration)) as TextChannel
					await channel.send({
						embeds: [
							new EmbedBuilder()
								.setDescription(module.app.config.modules.chat.discord.serverOnline(status.online))
						]
					})
				} catch (err) {
					module.logger.Error(err)
				}
			}),
			new MinecraftEvent("player", async (player: { name: string, online: boolean }) => {
				try {
					// if (!msg.content.startsWith("!")) return
					module.logger.Debug("Recieved player status:", player)
					let user = await module.app.prisma.user.findFirst({ where: { nickname: player.name } })
					if (!user) return module.logger.Error(new Error("Undefined user."))
					// let dUser = await module.app.bot.users.fetch(user.discord)
					let channel = (module.app.bot.channels.cache.get(module.app.config.bot.channels.chatIntagration)) as TextChannel
					await channel.send({
						embeds: [
							new EmbedBuilder()
								// .setDescription(`<@${user.discord}> **${player.online ? "присоединился к игре" : "покинул игру"}.**`)
								// .setDescription(`**[${player.online ? "🟢" : "🔴" }]** <@${user.discord}>`)
								// .setDescription(`**[${player.online ? "🔹" : "🔸" }]** <@${user.discord}>`)
								.setDescription(module.app.config.modules.chat.discord.playerJoined(user.discord, player.online))
								.setColor(player.online ? Colors.Green : Colors.Red)
						]
					})
					// await channel.send(`<@${user.discord}> **->** ${msg.content}`)
				} catch (err) {
					module.logger.Error(err)
				}
			}),
		)
		return module
	}
)
