import Conversation from "../../../types/Conversation"
import { User } from "discord.js"


export default (user: User, module: string, uuid: string) => new Conversation(user,
	'Вы начали заявку на присоединение к серверу DiPix.\nОбязательные вопросы помечены *, на необязательные вопросы можно ответить -\n**Ответы будут опубликованы**', [
	{ question: 'Вы принимаете правила сервера? * ', answerRegExp: /^(y|д)/ },
	{ question: 'Ваш ник в Майнкрафт? * ', answerRegExp: /^\w+$/ },
	{ question: 'Ваш возраст? * ', answerRegExp: /^[1-9]\d+$/ },
	{ question: 'Ваш клиент (Java, Bedrock, Оба)? * ', answerRegExp: /^(java|bedrock|оба)$/ },
	{ question: 'Биография вашего персонажа?', answerRegExp: /^/ },
	{ question: 'Что вы планируете делать на сервере?', answerRegExp: /^/ },
	{ question: 'Кто вас пригласил / ваш промокод?', answerRegExp: /^/ },
	{ question: 'Ваш пол?', answerRegExp: /^(м|ж|-)/ }
],
	module,
	uuid
)