import { ChannelType, Message } from "discord.js";
import App from "../../App";
import AppBusModuleComponent from "../../types/AppBus/ModuleComponent";
import Conversation from "../../types/Conversation";
import ModuleBuilder, { Module } from "../../types/Module";
import DiscordEvent from "../../types/ModuleEvent/DiscordEvent";
import Presets from "./Presets";

export default new ModuleBuilder(
	"conversation",
	(module: Module) => {
		let conversations = {} as {[key: string]: Conversation}
		module.appBusModule.onMessage(async (msg) => {
			if (!(msg.data.type in Presets)) return module.appBusModule.send(msg.sender, {code: 1, id: msg.data.id})
			if (conversations[msg.data.user.id]) return module.appBusModule.send(msg.sender, {code: 2, id: msg.data.id})
			conversations[msg.data.user.id] = Presets[msg.data.type](msg.data.user, msg.sender, msg.data.id)
			let conversation = conversations[msg.data.user.id]
			await conversation.user.send(conversation.startMessage)
			await conversation.user.send(conversation.currentQuestion().question)
		})

		module.addEvent(
			new DiscordEvent('messageCreate', async (msg: Message) => {
				if (!(msg.author.id in conversations)) return
				if (msg.channel.type != ChannelType.DM) return
				let conversation = conversations[msg.author.id]
				if (!conversation.currentQuestion().answerRegExp.test(msg.content.toLowerCase())) {
					await msg.reply("Некорректный ответ")
					conversation.incorrects++
					if (conversation.incorrects > 5) {
						module.appBusModule.send(conversation.module, {code: 3})
						delete conversations[msg.author.id]
					}
					return
				}
				conversation.incorrects = 0
				conversation.answers.push(msg.content)
				conversation.step++
				if (conversation.step >= conversation.questions.length) {
					delete conversations[msg.author.id]
					return module.appBusModule.send(conversation.module, {code: 0, conversation, id: conversation.uuid})
				}
				await msg.author.send(conversation.currentQuestion().question)
			})
		)
		return module
	}
)
