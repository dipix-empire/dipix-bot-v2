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
			.addFields([
				{ name: 'Баланс', value: `$${user.balance}` },
				{ name: 'Тариф', value: getPlanName(user.plan), inline: true },
				{ name: "Следующее обновление подписки", value: user.nextUpdate.toLocaleString() },
				{ name: "Последнее обновление подписки", value: user.lastUpdate.toLocaleString() }
			])
		if (donates.length != 0) {
			replyEmbed
				.addFields([{ name: "Сумма донатов", value: `$${donates.map(e => e.value).reduce((sum, a) => sum + a, 0)}` }])
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
