import join from "./join"
import { country as countryRegistration, organization as organizationRegistration } from "./registration"
import { User } from "discord.js"
import Conversation from "../../../types/Conversation"

export default {
	join,
	countryRegistration,
	organizationRegistration,
} as { [key: string]: (user: User, module: string, uuid: string) => Conversation }
