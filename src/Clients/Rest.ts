import express, { Request, Response } from "express"
import Logger from "../types/Logger"

export default class REST {

	private readonly api: express.Application
	public addRoute(path: string, type: "get" | "post" | "put" | "delete", handler: (req: Request, res: Response) => any) {
		this.api[type](path, handler)
	}
	public start() {
		this.api.listen(this.port, () => {
			this.logger.Log(`REST server started at ${this.port}`)
		})
	}
	constructor(
		private readonly port: number,
		private readonly logger: Logger
	) {
		this.api = express()
	}
}
