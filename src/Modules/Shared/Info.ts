import { Guild, Interaction, NonThreadGuildBasedChannel, PermissionFlagsBits, SlashCommandBuilder, SlashCommandSubcommandBuilder, TextChannel } from "discord.js";
import App from "../../App";
import AppBusModuleComponent from "../../types/AppBus/ModuleComponent";
import Logger from "../../types/Logger";
import ModuleBuilder, { Module } from "../../types/Module";
import DiscordEvent from "../../types/ModuleEvent/DiscordEvent";
import { UploadCommandType } from "../../types/TypeAlias";
import { ErrorEmbed, InfoEmbed } from "../../Data/Embeds";
import Message from "../../types/AppBus/Message";
import Conversation from "../../types/Conversation";

export default new ModuleBuilder(
	'SharedInfo',

	(module: Module) => {
		module.logger.Verbose(module.app.bot.uploadCommand("shared", (command: SlashCommandBuilder) => command
			.setName("s-info")
		))
		module.addEvent(
			new DiscordEvent("guildCreate", async (guild: Guild) => {
				module.app.bot.pushCommands(guild.id)
				let channel = (await guild.channels.fetch()).filter((channel: NonThreadGuildBasedChannel | null) => (channel?.isTextBased() && channel.manageable)).first() as TextChannel | null | undefined
				if ((await guild.members.fetchMe()).permissions.has(PermissionFlagsBits.Administrator)) {
					await (await guild.fetchOwner()).send({ embeds: [ErrorEmbed("Ошибка разрешений! Добавьте бота с параметрами по умолчанию.")] })
					await guild.leave()
				}
				(channel || await guild.fetchOwner()).send({ embeds: [InfoEmbed("Минутка настройки...", "Бот добавлен! Осталось его настроить. Для регистрации сервера используйте команду /registration, после следуйте шагам регистрации")] })
			}),
			new DiscordEvent("interactionCreate", async (interaction: Interaction) => {
				if (!interaction.isChatInputCommand()) return
				if (interaction.commandName != "s-info") return
				try {
					await interaction.deferReply({ ephemeral: true })
					await interaction.editReply({ embeds: [ErrorEmbed("Not Implemented.")] })
				} catch (err) {
					interaction.replied ? await interaction.editReply({ embeds: [ErrorEmbed()] }) : await interaction.reply({ embeds: [ErrorEmbed()], ephemeral: true })
				}
			})
		)
		return module
	}
)
