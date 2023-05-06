import { APIEmbedField, ActionRowBuilder, ButtonBuilder, ButtonStyle, Interaction, InteractionReplyOptions, MessageResolvable, SlashCommandBuilder, SlashCommandStringOption, User } from "discord.js";
import App from "../../App";
import AppBusModuleComponent from "../../types/AppBus/ModuleComponent";
import ModuleBuilder, { Module } from "../../types/Module";
import DiscordEvent from "../../types/ModuleEvent/DiscordEvent";
import Logger from "../../types/Logger";
import { ErrorEmbed, InfoEmbed } from "../../Data/Embeds";

export default new ModuleBuilder("connect",
	(module: Module) => {
		async function getReply(user: User,): Promise<InteractionReplyOptions> {
			let userClient = await module.app.prisma.user.findFirst({ where: { discord: user.id }, select: { client: true } })
			if (!userClient) return { embeds: [ErrorEmbed("Пользователь не найден!")], ephemeral: true }
			let javaFields: APIEmbedField[] = [{
				name: "Java",
				value: "━━━━━━━━━━━━━━━━━━━━━━━━━━"
			}, {
				name: "IP",
				value: module.app.config.modules.connect.java.ip,
				inline: true
			}, {
				name: "Версия",
				value: module.app.config.modules.connect.java.version,
				inline: true
			}]
			let bedrockFields: APIEmbedField[] = [{
				name: "Bedrock",
				value: "━━━━━━━━━━━━━━━━━━━━━━━━━━"
			}, {
				name: "IP",
				value: module.app.config.modules.connect.bedrock.ip,
				inline: true
			}, {
				name: "Порт",
				value: module.app.config.modules.connect.bedrock.port,
				inline: true
			}, {
				name: "Версия",
				value: module.app.config.modules.connect.bedrock.version,
				inline: true
			}]
			let client = userClient?.client || "both"
			let fields: APIEmbedField[] = [
				...(client == "java" || client == "both" ? javaFields : []),
				...(client == "bedrock" || client == "both" ? bedrockFields : [])
			]
			return { embeds: [InfoEmbed("IP для подключения").addFields(fields)], ephemeral: true }
		}
		let commandBuilder = (command: SlashCommandBuilder) => command
			.setName("connect")
			.setDescription("Получить IP для подключения.")
		module.logger.Verbose(module.app.bot.uploadSlashCommand("main", commandBuilder))
		module.logger.Verbose(module.app.bot.uploadSlashCommand("shared", commandBuilder))

		module.addEvent(new DiscordEvent("interactionCreate", async (interaction: Interaction) => {
			if (
				(!interaction.isCommand() || interaction.commandName != "connect") &&
				(!interaction.isButton() || interaction.customId != "common:connect")
			) return
			try {
				await interaction.reply(await getReply(interaction.user))
			} catch (err) {
				module.logger.Error(err)
				interaction.isRepliable() &&
					interaction.replied ?
					await interaction.editReply({ embeds: [ErrorEmbed()] }) :
					await interaction.reply({ embeds: [ErrorEmbed()], ephemeral: true })
			}
		}))
		return module
	}
)

export const connectButton = new ActionRowBuilder<ButtonBuilder>()
	.addComponents(new ButtonBuilder()
		.setCustomId("common:connect")
		.setStyle(ButtonStyle.Success)
		.setLabel("Подключится!")
	)
