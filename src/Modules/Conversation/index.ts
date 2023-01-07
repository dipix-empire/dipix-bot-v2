import { ChannelType, Message } from "discord.js";
import App from "../../App";
import AppBusModuleComponent from "../../types/AppBus/ModuleComponent";
import Conversation from "../../types/Conversation";
import Module from "../../types/Module";
import DiscordEvent from "../../types/ModuleEvent/DiscordEvent";
import Presets from "./Presets";

export default new Module(
	"conversation",
	(app: App, appBusModule: AppBusModuleComponent) => {
		let conversations = {} as {[key: string]: Conversation}
		appBusModule.onMessage(async (msg) => {
			if (!(msg.data.type in Presets)) return appBusModule.send(msg.sender, {code: 1, id: msg.data.id})
			if (conversations[msg.data.user.id]) return appBusModule.send(msg.sender, {code: 2, id: msg.data.id})
			conversations[msg.data.user.id] = Presets[msg.data.type](msg.data.user, msg.sender, msg.data.id)
			let conversation = conversations[msg.data.user.id]
			await conversation.user.send(conversation.startMessage)
			await conversation.user.send(conversation.currentQuestion().question)
		})

		return [
			new DiscordEvent('messageCreate', async (msg: Message) => {
				if (!(msg.author.id in conversations)) return
				if (msg.channel.type != ChannelType.DM) return
				let conversation = conversations[msg.author.id]
				if (!conversation.currentQuestion().answerRegExp.test(msg.content.toLowerCase())) {
					await msg.reply("Некорректный ответ")
					conversation.incorrects++
					if (conversation.incorrects > 5) {
						appBusModule.send(conversation.module, {code: 3})
						delete conversations[msg.author.id]
					}
					return
				}
				conversation.incorrects = 0
				conversation.answers.push(msg.content)
				conversation.step++
				if (conversation.step >= conversation.questions.length) {
					delete conversations[msg.author.id]
					return appBusModule.send(conversation.module, {code: 0, conversation, id: conversation.uuid})
				}
				await msg.author.send(conversation.currentQuestion().question)
			})
		]
	}
)
