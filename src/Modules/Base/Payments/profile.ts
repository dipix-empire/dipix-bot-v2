import { Interaction, SlashCommandBuilder } from "discord.js";
import App from "../../../App";
import Logger from "../../../types/Logger";
import DiscordEvent from "../../../types/ModuleEvent/DiscordEvent";
import { ErrorEmbed, InfoEmbed } from "../../../Data/Embeds";
import { getName } from "../Subscriptions/plans"

export default (app: App, logger: Logger) => {
	logger.Verbose(app.bot.uploadCommand("main", (slashCommandBuilder: SlashCommandBuilder) =>
		slashCommandBuilder
			.setName("payments")
			.setDescription("Управление подпиской")
	))
	return new DiscordEvent(
		"interactionCreate",
		async (interaction: Interaction) => {
			if (!interaction.isCommand()) return
			if (interaction.commandName != "payments") return
			try {
				await interaction.deferReply({ ephemeral: true })
				let user = await app.prisma.user.findFirst({
					where: {
						discord: interaction.user.id,
					},
					select: {
						balance: true,
						nextPlan: true,
						subscriptions: {
							where: {
								status: "active"
							},
							select: {
								ends: true,
								plan: true,
								started: true
							}
						}
					}
				})
				if (!user) return await interaction.editReply({
					embeds: [
						ErrorEmbed("Пользователь не найден.")
					]
				})
				if (user.subscriptions.length == 0) return await interaction.editReply({
					embeds: [InfoEmbed("Информация о Вашем счёте.", "Нет активной подписки, доступ к серверу приостановлен.")
						.addFields([
							{ name: "Баланс", value: `$${user.balance}` },
							{ name: "План", value: getName(user.nextPlan) }
						])
					]
				})
				let subscription = user.subscriptions[0]
				await interaction.editReply({
					embeds: [InfoEmbed("Информация о вашем счёте.", "Подписка активна.")
						.addFields([
							{ name: "Баланс", value: `$${user.balance}` },
							{ name: "План", value: getName(subscription.plan), inline: true },
							...(user.nextPlan != subscription.plan ? [{ name: "Следующий план", value: getName(user.nextPlan), inline: true }] : []),
							{ name: "Дата следующего списания:", value: `<t:${Math.floor(subscription.ends.getTime() / 1000)}:R> (<t:${Math.floor(subscription.ends.getTime() / 1000)}>)` },
							{ name: "Дата последнего списания:", value: `<t:${Math.floor(subscription.started.getTime() / 1000)}:R> (<t:${Math.floor(subscription.started.getTime() / 1000)}>)` }
						])
					]
				})
			} catch (err) {
				logger.Error(err)
				interaction.replied ? await interaction.editReply({ embeds: [ErrorEmbed()] }) : await interaction.reply({ embeds: [ErrorEmbed()], ephemeral: true })
			}
		}
	)
}
