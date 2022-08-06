import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { Plan } from "@prisma/client"
import { CommandInteraction, Interaction, Message, MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu, User } from "discord.js"
import App from "../../App"
import Discord from "../../Clients/Discord"
import { ErrorEmbed, InfoEmbed, SuccesfulEmbed } from "../../Data/Embeds"
import AppBusModuleComponent from "../../types/AppBus/ModuleComponent"
import Logger from "../../types/Logger"
import Module from "../../types/Module"
import DiscordEvent from "../../types/ModuleEvent/DiscordEvent"
export default new Module(
	"payments",
	(app: App, appBusModule: AppBusModuleComponent, logger: Logger) => {
		app.bot.uploadCommand(app.config.bot.guildId, (slashCommandBuilder: SlashCommandBuilder) => 
			slashCommandBuilder
				.setName("payments")
				.setDescription("Управление балансом и подпиской.")
		)
		function getPlanName(plan: Plan) {
			switch(plan) {
				case 'default':
					return 'Стандартный'
				case 'sponsor':
					return 'Спонсорский'
			}
		}
		function toPlanID(name: string) {
			switch(name) {
				case 'sponsor':
					return Plan.sponsor
				default:
					return Plan.default
			}
		}
		let mainActionRow = (user: User) => new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setLabel("Пополнить счёт")
					.setStyle('LINK')
					.setURL(app.config.modules.payments.botlink),
				new MessageButton()
					.setLabel("Сменить план")
					.setStyle('SECONDARY')
					.setCustomId(`payments:updatePlan:${user.id}`),
				new MessageButton()
					.setLabel("Пожертвовать")
					.setStyle('SECONDARY')
					.setCustomId(`payments:donate:${user.id}`)
			)
		let updatePlanActionRow = (user: User, plan: Plan) => new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId(`payments:updatePlanMenu:${user.id}`)
					.setOptions([
						{label:'Стандартный', value: 'default', description:'Стандартный план ($1.8/мес)', default: plan == 'default'},
						{label:'Спонсорский', value: 'sponsor', description:'Спонсорский план ($1.8/мес)', default: plan == 'sponsor'}
					])
			)
		return [
			new DiscordEvent("interactionCreate", async (interaction: Interaction) => {
				if (!interaction.isCommand() || interaction.commandName != "payments") return
				try {
					await interaction.deferReply({ephemeral: true})
					let cmd = interaction as CommandInteraction		
					let user = await app.prisma.user.findFirst({where:{discord: interaction.user.id}})
					if (!user) return await cmd.editReply({embeds:[ErrorEmbed("Пользователь не найден.")]})		
					let donates = await app.prisma.donate.findMany({where:{userId: user.id}})
					let replyEmbed = InfoEmbed("Информация о Вашем счёте")
						.addField('Баланс', `$${user.balance}`)
						.addField('Тариф', getPlanName(user.plan), true)
						.addField("Следующее обновление подписки", user.nextUpdate.toLocaleString())
						.addField("Последнее обновление подписки", user.lastUpdate.toLocaleString())
					if (donates.length != 0) {
						replyEmbed
							.addField("Сумма донатов", `${donates.map(e => e.value).reduce((sum, a) => sum + a, 0)}$`)
					}

					await cmd.editReply({
						embeds: [ replyEmbed ],
						components: [ mainActionRow(interaction.user) ]
					})
				} catch (err) {
					logger.Error(err)
					interaction.replied || interaction.deferred ? await interaction.editReply({ embeds: [ErrorEmbed()] }) : interaction.reply({ embeds: [ErrorEmbed()], ephemeral: true })
				}
			}),
			new DiscordEvent("interactionCreate", async (interaction: Interaction) => {
				if (!interaction.isButton()) return
				if (!interaction.customId.startsWith("payments:")) return
				try {
					await interaction.deferReply({ephemeral: true})
					if (interaction.user.id != interaction.customId.split(':')[2]) return interaction.editReply({embeds:[ErrorEmbed("How did we get here?")]}) 
					let operation = interaction.customId.split(":")[1]
					let user = await app.prisma.user.findFirst({where: {discord: interaction.user.id}})
					if (!user) return await interaction.editReply({embeds:[ErrorEmbed("How did we get here?")]})
					if (operation == "updatePlan") {
						await interaction.editReply({
							embeds:[InfoEmbed("Выберите план")],
							components: [ updatePlanActionRow(interaction.user, user.plan) ]
						})
					}
				} catch(err) {
					logger.Error(err)
					interaction.replied || interaction.deferred ? await interaction.editReply({ embeds: [ErrorEmbed()] }) : interaction.reply({ embeds: [ErrorEmbed()], ephemeral: true })
				}
			}),
			new DiscordEvent("interactionCreate", async (interaction: Interaction) => {
				if (!interaction.isSelectMenu()) return
				if (!interaction.customId.startsWith('payments:')) return
				try {
					await interaction.deferReply({ephemeral: true})
					if (interaction.user.id != interaction.customId.split(':')[2]) 
						return interaction.editReply({embeds:[ErrorEmbed("How did we get here?")]})
					let choose = interaction.values[0]
					if (['default', 'sponsor'].indexOf(choose) == -1) return await interaction.editReply({embeds:[ErrorEmbed("Тарифный план не найден")]})
					await app.prisma.user.update({where:{discord: interaction.user.id}, data:{plan: toPlanID(choose)}})
					await interaction.editReply({embeds:[SuccesfulEmbed("План обновлён!").setDescription(`Новый план: ${getPlanName(toPlanID(choose))}`)]})
				} catch(err) {
					logger.Error(err)
					interaction.replied || interaction.deferred ? await interaction.editReply({ embeds: [ErrorEmbed()] }) : interaction.reply({ embeds: [ErrorEmbed()], ephemeral: true })
				}
			})
		]
	}
)