import { Interaction } from "discord.js"
import App from "../../../../App"
import { ErrorEmbed, SuccesfulEmbed } from "../../../../Data/Embeds"
import Logger from "../../../../types/Logger"
import DiscordEvent from "../../../../types/ModuleEvent/DiscordEvent"

export default (app: App, logger: Logger) => new DiscordEvent("interactionCreate", async (interaction: Interaction) => {
	if (!interaction.isCommand() || interaction.commandName != "autoaccept") return
	try {
		await interaction.deferReply({ ephemeral: true })
		if (!interaction.memberPermissions?.has("ManageGuild")) return await interaction.editReply({ embeds: [ErrorEmbed("Недостаточно полномочий.")] })
		let user = interaction.options.getUser('user', true)
		if (await app.prisma.user.findFirst({ where: { discord: user.id } }))
			return await interaction.editReply({ embeds: [ErrorEmbed(`Пользователь <@${user.id}> уже является игроком.`)] })
		if (await app.prisma.request.findFirst({ where: { discord: user.id } }))
			return await interaction.editReply({ embeds: [ErrorEmbed(`Пользователь <@${user.id}> уже написал заявку, вы можете просто принять её.`)] })
		let accepted = await app.prisma.autos.findFirst({ where: { discord: user.id } })
		if (accepted)
			return await interaction.editReply({ embeds: [ErrorEmbed(`<@${accepted.whoAccepted}> уже добавил <@${user.id}> в список автоматически принятых посетителей.`)] })
		await app.prisma.autos.create({ data: { discord: user.id, whoAccepted: interaction.user.id } })
		await interaction.editReply({ embeds: [SuccesfulEmbed(`Пользователь <@${user.id}> добавлен в список автоматически принимаемых посетителей.`)] })
	} catch (err) {
		logger.Error(err)
		interaction.replied ? await interaction.editReply({ embeds: [ErrorEmbed()] }) : await interaction.reply({ embeds: [ErrorEmbed()], ephemeral: true })
	}
})
