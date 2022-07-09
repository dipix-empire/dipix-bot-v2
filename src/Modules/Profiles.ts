import { SlashCommandAttachmentOption, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandNumberOption, SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { CommandInteraction, Interaction } from "discord.js"
import App from "../App"
import { ErrorEmbed, SuccesfulEmbed } from "../Data/Embeds"
import AppBusModuleComponent from "../types/AppBus/ModuleComponent"
import Logger from "../types/Logger"
import Module from "../types/Module"
import DiscordEvent from "../types/ModuleEvent/DiscordEvent"
import MinecraftEvent from "../types/ModuleEvent/MinecraftEvent"

export default new Module(
	"profiles",
	async (app: App, appBusModule: AppBusModuleComponent, logger: Logger) => {
		
		logger.Verbose(app.bot.uploadCommand((slashCommand: SlashCommandBuilder) => 
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

		return [
			new DiscordEvent("interactionCreate", async (interaction: Interaction) => {
				if (!interaction.isCommand()) return
				if (interaction.commandName != "profile") return
				let cmd = interaction as CommandInteraction
				let subcommand = cmd.options.getSubcommand()
				if (subcommand == "set") {
					let file = cmd.options.getAttachment("skin", true)
					let number = cmd.options.getInteger("number", true)
					if (file.height != 64 || file.width != 64 || file.contentType != 'image/png')
						return await interaction.reply({ephemeral: true, embeds:[ErrorEmbed("Некорректный файл! Требуемый тип файла: png, а размер: 64x64")]})
					logger.Debug(`Setting skin for profile ${number} of ${interaction.user.tag}`, file)
					interaction.reply({embeds: [SuccesfulEmbed("Скин установлен.")],ephemeral: true})
				}
			}),
			new MinecraftEvent("command", (msg: any) => {
				if (msg.command != "profile") return
				logger.Debug("Changing skin:", msg)
				app.minecraft.sendToConsole(`tellraw ${msg.player} [{"text":"Профиль переключён на ","color":"green"},{"text":"${msg.args}","color":"aqua"}]`)
			}),
		]
	}
)