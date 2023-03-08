import { Interaction, SlashCommandBuilder, SlashCommandIntegerOption } from "discord.js";
import App from "../../../App";
import Logger from "../../../types/Logger";
import DiscordEvent from "../../../types/ModuleEvent/DiscordEvent";
import { ErrorEmbed, InfoEmbed, SuccesfulEmbed } from "../../../Data/Embeds";
import { getName } from "./plans"
export default (app: App, logger: Logger) => {
	logger.Verbose(app.bot.uploadCommand("main", (slashCommandBuilder: SlashCommandBuilder) =>
		slashCommandBuilder
			.setName("donate")
			.setDescription("Отправить пожертвование.")
			.addIntegerOption((input: SlashCommandIntegerOption) =>
				input
					.setName("sum")
					.setDescription("Сумма пожертвования")
					.setRequired(true)
			)
	))
	return new DiscordEvent(
		"interactionCreate",
		async (interaction: Interaction) => {
			if (!interaction.isCommand()) return
			if (interaction.commandName != "donate") return
			try {
				await interaction.deferReply({ ephemeral: true })
				let user = await app.prisma.user.findFirst({
					where: { discord: interaction.user.id },
					select: { balance: true, id: true }
				})
				let sum = interaction.options.get("sum", true)
				logger.Debug("Sum", sum)
				if (typeof sum.value != "number") throw new Error("Incorrect argument type.")
				if (!user) return await interaction.editReply({embeds: [ErrorEmbed("Пользователь не найден")]})
				if (user.balance < sum.value) return interaction.editReply({embeds: [ErrorEmbed("Сумма пожертвования меньше суммы на балансе.\nПополните баланс или измените сумму пожертвования.")]})
				await app.prisma.user.update({
					where: {id: user.id},
					data: {
						balance: {
							decrement: sum.value
						}
					}
				})
				await app.prisma.donate.create({
					data: {
						userId: user.id,
						value: sum.value,
						timestamp: new Date()
					}
				})
				await interaction.editReply({embeds: [SuccesfulEmbed(`Пожертвование на сумму $${sum.value} отправлено :heart:`)]})
			} catch (err) {
				logger.Error(err)
				interaction.replied ? await interaction.editReply({ embeds: [ErrorEmbed()] }) : await interaction.reply({ embeds: [ErrorEmbed()], ephemeral: true })
			}
		}
	)
}
