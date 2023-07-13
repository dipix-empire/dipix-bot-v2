import { SlashCommandBuilder, Interaction, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { ErrorEmbed, InfoEmbed } from "../../../../Data/Embeds";
import { Module } from "../../../../types/Module";
import DiscordEvent from "../../../../types/ModuleEvent/DiscordEvent";
import { getPlanDetail } from "../util/plans";

export default (module: Module) => {
	module.logger.Verbose(module.app.bot.uploadSlashCommand("main", (slashCommand: SlashCommandBuilder) => slashCommand
		.setName("subscription")
		.setDescription("Управление подпиской.")
	))
	module.addEvent(new DiscordEvent("interactionCreate", async (interaction: Interaction) => {
		if (!interaction.isCommand()) return
		if (interaction.commandName != "subscription") return
		try {
			await interaction.deferReply({ ephemeral: true })
			
			let result = InfoEmbed("Подписка", `Меню управления подпиской:`)
				.addFields(
					{ name: "🔄 Обновить", value: "Обновить период подписки" },
					{ name: "📝 Изменить", value: "Сменить тариф подписки" },
					{ name: "📃 История", value: "Посмотреть предыдущие периоды" },
				)
			
			let buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder()
					.setLabel("Обновить")
					.setStyle(ButtonStyle.Primary)
					.setCustomId("sub:button:update")
					.setEmoji({ name: '🔄' }),
				new ButtonBuilder()
					.setLabel("Изменить")
					.setStyle(ButtonStyle.Secondary)
					.setCustomId("sub:button:change")
					.setEmoji({ name: '📝' }),
				new ButtonBuilder()
					.setLabel("История")
					.setStyle(ButtonStyle.Secondary)
					.setCustomId("sub:button:history")
					.setEmoji({ name: '📃' }),
			)
			await interaction.editReply({ embeds: [result], components: [buttons] })
			// module.logger.Debug("Update response", await module.app.rest.send("/subscription/update", { id: user.id }))
		} catch (err) {
			module.logger.Error(err);
			(interaction.replied || interaction.deferred) ?
				await interaction.editReply({ embeds: [ErrorEmbed()] }) :
				await interaction.reply({ embeds: [ErrorEmbed()], ephemeral: true })
		}
	}))
}
