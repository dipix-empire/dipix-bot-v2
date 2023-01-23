import { ChatInputCommandInteraction, Interaction, PermissionFlagsBits, SlashCommandBooleanOption, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandStringOption, SlashCommandSubcommandBuilder, SlashCommandUserOption } from "discord.js";
import App from "../../../../App";
import Logger from "../../../../types/Logger";
import ModuleEvent from "../../../../types/ModuleEvent";
import DiscordEvent from "../../../../types/ModuleEvent/DiscordEvent";
import { ErrorEmbed } from "../../../../Data/Embeds";
import addPromo from "./addPromo";

export default function promoManager(app: App, logger: Logger): ModuleEvent[] {
	app.bot.uploadCommand("main",
		(slashCommand: SlashCommandBuilder) => slashCommand
			.setName("promo")
			.setDescription("Управление промокодами.")
			.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
			.addSubcommand((input: SlashCommandSubcommandBuilder) => input
				.setName("add")
				.setDescription("Добавить промокод.")
				.addStringOption((input: SlashCommandStringOption) => input
					.setName("promo")
					.setDescription("Промокод.")
					.setRequired(true)
				)
				.addIntegerOption((input: SlashCommandIntegerOption) => input
					.setName("discount")
					.setDescription("Скидка (от 0 до 100 %)")
					.setRequired(true)
					.setMinValue(0)
					.setMaxValue(100)
				)
				.addIntegerOption((input: SlashCommandIntegerOption) => input
					.setName("lifetime")
					.setDescription("Срок использования промокода (дни, 0 = бессрочный)")
					.setRequired(true)
				)
				.addIntegerOption((input: SlashCommandIntegerOption) => input
					.setName("count")
					.setDescription("Количество использований промокода (0 = бесконечно)")
					.setRequired(true)
				)
				.addBooleanOption((input: SlashCommandBooleanOption) => input
					.setName("public")
					.setDescription("Публичный / приватный промокоД.")
					.setRequired(false)
				)
			)
			.addSubcommand((input: SlashCommandSubcommandBuilder) => input
				.setName("apply")
				.setDescription("Применить промокод к пользователю.")
				.addUserOption((input: SlashCommandUserOption) => input
					.setName("user")
					.setDescription("Пользователь.")
					.setRequired(true)
				)
				.addStringOption((input: SlashCommandStringOption) => input
					.setName("promo")
					.setDescription("Промокод.")
					.setRequired(true)
				)
			)
	)

	return [
		new DiscordEvent("interactionCreate", async (interaction: Interaction) => {
			if (!interaction.isChatInputCommand()) return
			if (interaction.commandName != "promo") return
			try {
				await interaction.deferReply({ ephemeral: true })
				switch (interaction.options.getSubcommand()) {
					case 'add':
						return await addPromo(app, logger, interaction)
				}

			} catch (err) {
				logger.Error(err)
				interaction.replied ? await interaction.editReply({ embeds: [ErrorEmbed()] }) : interaction.reply({ embeds: [ErrorEmbed()], ephemeral: true })
			}
		})
	]
}
