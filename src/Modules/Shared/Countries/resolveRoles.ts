import { Country } from "@prisma/client";
import App from "../../../App";
import { Role } from "discord.js";

export default async (app: App, country: Country) => {
	let res = {} as CRoles
	let guild = await app.bot.guilds.fetch(country.discord)
	let mainGuild = await app.bot.mainGuild()
	let citizen = await guild.roles.fetch(country.citizenRoleId),
		mayor = await guild.roles.fetch(country.mayorRoleId),
		police = await guild.roles.fetch(country.policeRoleId),
		judge = await guild.roles.fetch(country.judgeRoleId),
		mainGuildRole = await mainGuild.roles.fetch(country.citizenRoleId)

	if (!citizen || !mayor || !police || !judge || !mainGuildRole) throw new Error(`Missing Roles. (C-Id: ${country.id})`)
	res = { citizen, mayor, police, judge, mainGuildRole }
	return res
}

export type CRoles = { citizen: Role, police: Role, mayor: Role, judge: Role, mainGuildRole: Role }
