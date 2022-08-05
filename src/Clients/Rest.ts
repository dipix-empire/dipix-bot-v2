import express, { Request, Response } from "express"
import Logger from "../types/Logger"

export default class REST {
	
	private readonly logger: Logger
	private readonly api: express.Application
	public addRoute(path: string, type: "get" | "post" | "put" | "delete", handler: (req: Request, res: Response) => any) {
		this.api[type](path, handler)
	}
	constructor(port: number, logger: Logger) {
		this.api = express()
		this.logger = logger
		this.api.listen(port, () => {
			logger.Log(`REST server started at ${port}`)
		})
	}
}