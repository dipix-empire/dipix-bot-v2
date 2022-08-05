import { SlashCommandAttachmentOption, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandNumberOption, SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { CommandInteraction, Interaction, TextChannel } from "discord.js"
import App from "../../App"
import { ErrorEmbed, ProcessingEmbed, SuccesfulEmbed } from "../../Data/Embeds"
import AppBusModuleComponent from "../../types/AppBus/ModuleComponent"
import Logger from "../../types/Logger"
import Module from "../../types/Module"
import DiscordEvent from "../../types/ModuleEvent/DiscordEvent"
import MinecraftEvent from "../../types/ModuleEvent/MinecraftEvent"
import path from "path"
import * as fs from "fs"
import axios from "axios"
import { v4 as uuid} from "uuid"
import { Request, Response } from "express"

export default new Module(
	"profiles",
	async (app: App, appBusModule: AppBusModuleComponent, logger: Logger) => {

		logger.Verbose(app.bot.uploadCommand(app.config.bot.guildId, (slashCommand: SlashCommandBuilder) =>
			slashCommand
				.setName("profile")
				.setDescription("Управление профилями пользователя")
				.addSubcommand((slashCommandSubcommand: SlashCommandSubcommandBuilder) =>
					slashCommandSubcommand
						.setName('set')
						.setDescription('Установить скин профиля')
						.addAttachmentOption((input: SlashCommandAttachmentOption) =>
							input
								.setName('skin')
								.setDescription('Файл скина')
								.setRequired(true)
						)
						.addIntegerOption((input: SlashCommandIntegerOption) =>
							input
								.setRequired(true)
								.setName('number')
								.setDescription('Номер профиля')
								.setMinValue(1)
						)
				)
		))
		app.rest.addRoute('/profile/skins/:id', 'get', (req: Request, res: Response) => {
			return res.sendFile(`${app.config.modules.profiles.skinDirectory}/${req.params.id}.png`)
		})
		async function DownloadImageByUrl(url: string): Promise<string> {
			let id = uuid()
			const filePath = path.resolve(`${app.config.modules.profiles.skinDirectory}/${id}.png`)
			const writer = fs.createWriteStream(filePath)

			const response = await axios({
				url,
				method: 'GET',
				responseType: 'stream'
			})

			response.data.pipe(writer)

			return new Promise<string>((resolve, reject) => {
				writer.on('finish', () => resolve(id))
				writer.on('error', reject)
			})
		}

		return [
			new DiscordEvent("interactionCreate", async (interaction: Interaction) => {
				if (!interaction.isCommand()) return
				if (interaction.commandName != "profile") return
				try {
					await interaction.deferReply({ ephemeral: true })
					let cmd = interaction as CommandInteraction
					let subcommand = cmd.options.getSubcommand()
					if (subcommand == "set") {
						let file = cmd.options.getAttachment("skin", true)
						let number = cmd.options.getInteger("number", true)
						if (file.height != 64 || file.width != 64 || file.contentType != 'image/png')
							return await interaction.editReply({ embeds: [ErrorEmbed("Некорректный файл! Требуемый тип файла: png, а размер: 64x64")] })
						let user = await app.prisma.user.findFirst({ where: { discord: cmd.user.id } })
						if (!user)
							return await interaction.editReply({ embeds: [ErrorEmbed()] })
						await interaction.editReply({embeds:[ProcessingEmbed("Файл скина загружается...")]})
						let imageId = await DownloadImageByUrl(file.url)
						let oldProfile = await app.prisma.profile.findFirst({ where: { user, number } })
						if (oldProfile) {
							fs.rmSync(`${app.config.modules.profiles.skinDirectory}/${oldProfile.file}.png`)
							await app.prisma.profile.update({where: {id: oldProfile.id}, data:{file: imageId}})
							return await interaction.editReply({ embeds: [SuccesfulEmbed(`Скин в профиле ${number} обновлён, вы можете сменить скин, зайдя на сервер и введя команду \`/profile ${number}\`.`)] })
						}
						await app.prisma.profile.create({data:{
							file:imageId,
							number,
							userId: user.id
						}})
						await interaction.editReply({embeds:[SuccesfulEmbed(`Скин установлен в профиль ${number}, вы можете сменить скин, зайдя на сервер и введя команду \`/profile ${number}\`.`)]})
					}
				} catch (err) {
					logger.Error(err)
					interaction.replied ? await interaction.editReply({ embeds: [ErrorEmbed()] }) : await interaction.reply({ ephemeral: true, embeds: [ErrorEmbed()] })
				}
			}),
			new MinecraftEvent("command", async (msg: any) => {
				logger.Debug("Checking command")
				if (msg.command != "profile") return
				logger.Debug('Getting user')
				let user = await app.prisma.user.findFirst({where: {nickname: msg.player}})
				if (!user) return app.minecraft.sendToConsole(`tellraw ${msg.player} {"text":"Ошибка.","color":"red"}`)
				logger.Debug("Getting profile data")
				let profile = await app.prisma.profile.findFirst({where:{number: parseInt(msg.args), userId: user.id}})
				if (!profile) return app.minecraft.sendToConsole(`tellraw ${msg.player} {"text":"Профиль не установлен.","color":"red"}`)
				logger.Debug("Updating skin")
				app.minecraft.sendToConsole(`skinsrestorer applyskin ${msg.player} http://localhost:${app.config.rest.port}/profile/skin/${profile.file} classic`)
				logger.Debug("Notify user")
				app.minecraft.sendToConsole(`tellraw ${msg.player} [{"text":"Профиль переключён на ","color":"green"},{"text":"${msg.args}","color":"aqua"}]`)
			}),
		]
	}
)