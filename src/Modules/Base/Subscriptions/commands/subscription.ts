import { SlashCommandBuilder, Interaction } from "discord.js";
import { ErrorEmbed, InfoEmbed } from "../../../../Data/Embeds";
import { Module } from "../../../../types/Module";
import DiscordEvent from "../../../../types/ModuleEvent/DiscordEvent";
import { getPlanDetail } from "../plans";

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
			let user = await module.app.prisma.user.findUnique({
				where: {
					discord: interaction.user.id
				}
			})
			if (!user) return interaction.editReply({ embeds: [ErrorEmbed("Пользователь не найден. Воспользуйтесь /join для написания заявки или дождитесь решения по текущей.")] })
			let subs = await module.app.prisma.subscription.findMany({
				where: {
					userId: user.id
				}
			})
			let result = InfoEmbed("Подписка", "Ваша история подписки:")
			if (subs.length == 0) result.setDescription("История подписки пуста.")
			else {
				result.addFields(subs.sort((a, b) => a.started.getTime() - b.started.getTime()).slice(0, 4).map((s, k) => ({ name: getNameByIndex(k), value: `<t:${Math.floor(s.started.getTime() / 1000)}> - <t:${Math.floor(s.ends.getTime() / 1000)}>, ${getPlanDetail(s.plan).name} ($${getPlanDetail(s.plan).cost})` })))
			}
			await interaction.editReply({ embeds: [result] })
			module.logger.Debug("Update response", await module.app.rest.send("/subscription/update", { id: user.id }))
		} catch (err) {
			module.logger.Error(err)
			await (interaction.replied ? interaction.editReply({ embeds: [ErrorEmbed()] }) : interaction.reply({ embeds: [ErrorEmbed()] }))
		}
	}))
	module.app.rest.inner("/subscription/update", async (data) => {
		let id = data?.id
		if (!id) {
			module.logger.Verbose(`Update requested but no id was provided.`)
			return { status: 400 }
		}
		let user = await module.app.prisma.user.findUnique({
			where: { id }
		})
		if (!user) {
			module.logger.Verbose(`Update requested but no user matched id.`)
			return { status: 404 }
		}
		module.logger.Log(`Update for user ${id}/${(await module.app.bot.users.fetch(user.discord)).tag} requested.`)
		return { status: 501 }
	})
	function getNameByIndex(id: number) {
		return !id ? "Текущий период:" : `${id} период${id > 1 ? id > 4 ? "ов" : "a" : ""} назад:`
	}
}
