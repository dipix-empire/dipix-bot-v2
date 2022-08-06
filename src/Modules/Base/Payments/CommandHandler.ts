import App from "../../../App";
import AppBusModuleComponent from "../../../types/AppBus/ModuleComponent";
import Logger from "../../../types/Logger";
import DiscordEvent from "../../../types/ModuleEvent/DiscordEvent";
import { ErrorEmbed, InfoEmbed } from "../../../Data/Embeds";
import { getPlanName } from "./PlansManipulation";
import { Interaction } from "discord.js";
import { mainActionRow } from "./ActionRows";

export default (app: App, appBusModule: AppBusModuleComponent, logger: Logger) => new DiscordEvent("interactionCreate", async (interaction: Interaction) => {
	if (!interaction.isCommand() || interaction.commandName != "payments") return
	try {
		await interaction.deferReply({ ephemeral: true })
		let user = await app.prisma.user.findFirst({ where: { discord: interaction.user.id } })
		if (!user) return await interaction.editReply({ embeds: [ErrorEmbed("Пользователь не найден.")] })
		let donates = await app.prisma.donate.findMany({ where: { userId: user.id } })
		let replyEmbed = InfoEmbed("Информация о Вашем счёте")
			.addField('Баланс', `$${user.balance}`)
			.addField('Тариф', getPlanName(user.plan), true)
			.addField("Следующее обновление подписки", user.nextUpdate.toLocaleString())
			.addField("Последнее обновление подписки", user.lastUpdate.toLocaleString())
		if (donates.length != 0) {
			replyEmbed
				.addField("Сумма донатов", `${donates.map(e => e.value).reduce((sum, a) => sum + a, 0)}$`)
		}

		await interaction.editReply({
			embeds: [replyEmbed],
			components: [mainActionRow(interaction.user, app.config.modules.payments.botlink)]
		})
	} catch (err) {
		logger.Error(err)
		interaction.replied || interaction.deferred ? await interaction.editReply({ embeds: [ErrorEmbed()] }) : interaction.reply({ embeds: [ErrorEmbed()], ephemeral: true })
	}
})