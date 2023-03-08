import { User } from "discord.js"

export default class Conversation {
	public readonly user: User
	public readonly startMessage: string
	public readonly questions: {question: string, answerRegExp: RegExp}[]
	public readonly module: string
	public readonly uuid: string
	public answers: string[]
	public step: number = 0
	public incorrects: number = 0
	public currentQuestion() {
		return this.questions[this.step]
	}
	constructor(
        user: User, 
        startMessage: string, 
        questions: {question: string, answerRegExp: RegExp}[],
		module: string,
		uuid: string
    ){
        this.user = user
        this.startMessage = startMessage
        this.questions = questions
        this.answers = new Array<string>()
		this.module = module
		this.uuid = uuid
    }
}