import join from "./join"
import { User } from "discord.js"
import Conversation from "../../../types/Conversation"

export default {
	join
} as {[key:string]: (user: User, module: string, uuid: string) => Conversation}