import App from "../../../App";
import AppBusModuleComponent from "../../../types/AppBus/ModuleComponent";
import Logger from "../../../types/Logger";
import MinecraftEvent from "../../../types/ModuleEvent/MinecraftEvent";

export default (app: App, appBusModule: AppBusModuleComponent, logger: Logger) => new MinecraftEvent("PlayerJoin", async (ctx: any) => {
	let user = await app.prisma.user.findFirst({where:{nickname: ctx.nickname}}) //TODO: Check nickname
	if (user) return
	else {
		app.minecraft.sendToConsole(`whitelist remove ${ctx.nickname}`)
		app.minecraft.sendToConsole(`minecraft:kick ${ctx.nickname}`)
	}
})