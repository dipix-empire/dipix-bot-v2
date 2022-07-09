export default class Logger {
	
	public readonly source: string
	public readonly level: logLevel
	public readonly template = (level: string, message: string) => `[${new Date().toLocaleTimeString()} ${level.toUpperCase()} from ${this.source.toUpperCase()}] > ${message}`
	
	public Error(err: Error | unknown) {
		if (this.level < 0) return
		console.log(this.template("ERROR","There is an error:"))
		console.log(err)
	}
	public Warn(msg: string) {
		if (this.level < 1) return
		console.log(this.template("WARN", msg))
	} 
	public Log(msg: string) {
		if (this.level < 2) return
		console.log(this.template("INFO", msg))
	}
	public Verbose(msg: string) {
		if (this.level < 3) return
		console.log(this.template("VERBOSE", msg))
	}
	public Debug(msg: string, ...data: any) {
		if (this.level < 4) return
		console.log(this.template("DEBUG", msg))
		if (data.length > 0) console.log(...data)
	}
	
	constructor(source: string, level: logLevel) {
		this.source = source
		this.level = level
	}
}
export enum logLevel {
	ERROR = 0,
	WARN = 1,
	INFO = 2,
	VERBOSE = 3,
	DEBUG = 4
}