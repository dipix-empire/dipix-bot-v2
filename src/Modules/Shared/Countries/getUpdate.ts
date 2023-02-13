import { GuildMember } from "discord.js";
import { CRoles } from "./resolveRoles";
import App from "../../../App";

export default (app: App, newMember: GuildMember, oldMember: GuildMember, roles: CRoles): { add?: UpdateState[], remove?: UpdateState[] } => {
	let add: UpdateState[] = [], remove: UpdateState[] = []
	//! Complex and horrible checks
	newMember.roles.cache.has(roles.citizen.id)	&& !oldMember.roles.cache.has(roles.citizen.id)	&& add.push("citizen")
	newMember.roles.cache.has(roles.mayor.id)	&& !oldMember.roles.cache.has(roles.mayor.id)	&& add.push("mayor")
	newMember.roles.cache.has(roles.police.id)	&& !oldMember.roles.cache.has(roles.police.id)	&& add.push("police")
	newMember.roles.cache.has(roles.judge.id)	&& !oldMember.roles.cache.has(roles.judge.id)	&& add.push("judge")
	oldMember.roles.cache.has(roles.citizen.id)	&& !newMember.roles.cache.has(roles.citizen.id)	&& remove.push("citizen")
	oldMember.roles.cache.has(roles.mayor.id)	&& !newMember.roles.cache.has(roles.mayor.id)	&& remove.push("mayor")
	oldMember.roles.cache.has(roles.police.id)	&& !newMember.roles.cache.has(roles.police.id)	&& remove.push("police")
	oldMember.roles.cache.has(roles.judge.id)	&& !newMember.roles.cache.has(roles.judge.id)	&& remove.push("judge")
	
	return {
		add, remove
	}
}

export type UpdateState = "citizen" | "police" | "judge" | "mayor"
