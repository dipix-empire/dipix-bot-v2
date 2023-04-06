import { GuildMember, PartialGuildMember } from "discord.js";
import App from "../../../App";
import AppBusModuleComponent from "../../../types/AppBus/ModuleComponent";
import Logger from "../../../types/Logger";
import ModuleBuilder, { Module } from "../../../types/Module";
import DiscordEvent from "../../../types/ModuleEvent/DiscordEvent";
import resolveRoles from "./resolveRoles";
import getUpdate, { UpdateState } from "./getUpdate";

export default new ModuleBuilder(
	"CountryLinking",
	async (module: Module) => {
		module.addEvent(
			new DiscordEvent("guildMemberUpdate", async (oldMember: GuildMember | PartialGuildMember, newMember: GuildMember) => {
				try {
					let country = await module.app.prisma.country.findUnique({ where: { discord: newMember.guild.id } })
					if (!country) return
					let roles = await resolveRoles(module.app, country)
					let updateStates: { add?: UpdateState[], remove?: UpdateState[] } = getUpdate(module.app, newMember, oldMember, roles)
					if (updateStates.add?.length) {
						for (let s in updateStates.add) {
							switch (s) {
								case "citizen":
									await module.app.prisma.user.update({
										where: { discord: oldMember.id },
										data: {
											countryId: country.id
										}
									})
									await (await (await module.app.bot.mainGuild()).members.fetch(newMember.id)).roles.add(roles.mainGuildRole)
							}
						}
					}
					if (updateStates.remove?.length) {
						for (let s in updateStates.remove) {
							switch (s) {
								case "citizen":
									await module.app.prisma.user.update({
										where: { discord: oldMember.id },
										data: {
											countryId: country.id
										}
									})
									await (await (await module.app.bot.mainGuild()).members.fetch(newMember.id)).roles.remove(roles.mainGuildRole)
							}
						}
					}
				} catch (err) {
					module.logger.Error(err)
				}
			})
		)
		return module
	}
)
