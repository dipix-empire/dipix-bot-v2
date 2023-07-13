import ModuleBuilder, { Module } from "../../types/Module";

export default new ModuleBuilder("Sync", (module: Module) => {

	// module.addEvent(new MinecraftEvent())

	return module
})

async function Sync(module: Module) {
	module.logger.Log("Whitelist sync started.")
	try {
		let players = (await module.app.prisma.user.findMany({
			select: {
				id: true,
				nickname: true,
				discord: true
			}
		}))
		let playersNicknames = players.map(p => p.nickname)
		let whitelist = (await module.app.minecraft.sendCommand("whitelist list")).split(":")[1].trim().split(", ")
		let toAdd = players.filter(p => !whitelist.includes(p.nickname))
		let toRemove = whitelist.filter(n => !playersNicknames.includes(n))
		for (let i in toAdd) {
			await module.app.minecraft.sendCommand(`whitelist add ${i}`)
		}
		for (let i in toRemove) {
			await module.app.minecraft.sendCommand(`whitelist remove ${i}`)
			await module.app.minecraft.sendCommand(`kick ${i} Removed from whitelist.`)
		}
		module.logger.Log(`Whitelist sync finished. Added ${toAdd.length}, removed ${toRemove.length} players`)
	} catch (err) {
		module.logger.Error(err, "Error catched while whitelist sync.")
	}
}
