import App from "../../../../App"
import Logger from "../../../../types/Logger"
import DiscordEvent from "../../../../types/ModuleEvent/DiscordEvent"

export default (app: App, logger: Logger) => new DiscordEvent("ready", async () => {
	try {
		await app.prisma.request.updateMany({ where: { locked: true }, data: { locked: false } })
	} catch (err) {
		logger.Error(err)
	}
})
