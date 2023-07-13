import { Colors, Interaction, PermissionFlagsBits, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandUserOption } from "discord.js";
import App from "../../../App";
import Logger from "../../../types/Logger";
import ModuleEvent from "../../../types/ModuleEvent";
import DiscordEvent from "../../../types/ModuleEvent/DiscordEvent";
import { ErrorEmbed, InfoEmbed, SuccesfulEmbed } from "../../../Data/Embeds";
// import { onChangeBalance } from "../Subscriptions/updateSubscribtion";

export default ((app: App, logger: Logger) => {
	app.bot.uploadCommand("main", (slashCommand: SlashCommandBuilder) => slashCommand
		.setName("changebalance")
		.setDescription("Управление балансом участника.")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addUserOption((input: SlashCommandUserOption) => input
			.setName("user")
			.setDescription("Пользователь")
			.setRequired(true)
		)
		.addIntegerOption((input: SlashCommandIntegerOption) => input
			.setName("value")
			.setDescription("Значение в $ на которое изменится баланс участника.")
			.setRequired(true)
		)
	)
	return [
		new DiscordEvent("interactionCreate", async (interaction: Interaction) => {
			if (!interaction.isChatInputCommand()) return
			if (interaction.commandName != "changebalance") return
			try {
				await interaction.deferReply({ ephemeral: true })
				let
					user = interaction.options.getUser("user", true),
					value = interaction.options.getInteger("value", true)
				let userRecord = await app.prisma.user.findUnique({ where: { discord: user.id }, select: { id: true, balance: true, discord: true } })
				if (!userRecord) return await interaction.editReply({ embeds: [ErrorEmbed("Пользователь не найден.")] })
				if (userRecord.balance + value < 0) return await interaction.editReply({ embeds: [ErrorEmbed(`Не удалось выполнить операцию, т.к. она приведёт к отрицательному балансу пользователя.`)] })
				let newUser = await app.prisma.user.update({
					where: {
						id: userRecord.id
					},
					data: {
						balance: userRecord.balance + value
					},
					select: {
						id: true,
						discord: true,
						balance: true,
						nextPlan: true,
						nextPromo: true
					}
				})
				let disUser = await app.bot.users.fetch(newUser.discord)
				logger.Log(`${interaction.user.tag} изменил баланс ${disUser.tag} на $${value}. Текущий баланс пользователя: ${newUser.balance}`)
				await interaction.editReply({ embeds: [SuccesfulEmbed(`Баланс обновлён, новый баланс <@${newUser.discord}>: $${newUser.balance}`)] });
				// await onChangeBalance(app, newUser.id, {
				// 	...newUser,
				// 	proceeded: true,
				// 	start: new Date(),
				// }, logger)
				if (!disUser) throw new Error("Undefined user.")
				let positive = value > 0
				await (await disUser.createDM()).send({
					embeds: [InfoEmbed(
						`Администратор ${interaction.user.tag} ${positive ? "увеличил" : "уменьшил"} ваш баланс на $${Math.abs(value)}.`,
						`**Ваш текущий баланс: $${newUser.balance}.\nЕсли вы считаете это ошибкой, свяжитесь с администрацией.**`
					).setColor(positive ? Colors.Green : Colors.Red)]
				})

			} catch (err) {
				logger.Error(err)
				interaction.replied ? await interaction.editReply({ embeds: [ErrorEmbed()] }) : await interaction.reply({ embeds: [ErrorEmbed()], ephemeral: true })
			}
		})
	] as ModuleEvent[]
})
