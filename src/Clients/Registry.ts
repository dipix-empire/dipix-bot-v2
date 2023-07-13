import App from "../App";
import { Registry as Reg } from "@prisma/client";
export default class Registry {

	private id?: string

	public async start() {
		let registry = await this.app.prisma.registry.findMany()
		if (registry.length == 0) {
			this.id = (await this.app.prisma.registry.create({ data: {} })).id
		} else if (registry.length > 1) {
			this.id = registry.sort((a, b) => (a.created.getTime() - b.created.getTime()))[0].id
		} else {
			this.id = registry[0].id
		}
	}

	public async get<T extends keyof Reg>(key: T) {
		if (!this.id) throw new Error("Get accessed before initialization.")
		let data = (await this.app.prisma.registry.findUnique({ where: { id: this.id } }))
		if (!data) throw new Error("Incorrect id.")
		return data[key]
	}
	public async set<T extends keyof Reg>(key: T, val: Reg[T]) {
		if (!this.id) throw new Error("Set accessed before initialization.")
		let data = (await this.app.prisma.registry.findUnique({ where: { id: this.id } }))
		if (!data) throw new Error("Incorrect id.")
		let update: {[key: string]: Reg[T]} = {}
		update[key] = val
		await this.app.prisma.registry.update({
			where: {
				id: data.id
			},
			data: {
				...update
			}
		})
	}

	constructor(
		private readonly app: App
	) { }
}
