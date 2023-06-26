import { Module } from "../../../types/Module";

export default (module: Module) => {
	module.app.rest.inner("/subscription/update", async (data) => {
		try {
			let id = data?.id
			if (!id) {
				module.logger.Verbose(`Update requested but no id was provided.`)
				return { status: 400 }
			}
			let user = await module.app.prisma.user.findUnique({
				where: { id }
			})
			if (!user) {
				module.logger.Verbose(`Update requested but no user matched id.`)
				return { status: 404 }
			}
			module.logger.Log(`Update for user ${id}/${(await module.app.bot.users.fetch(user.discord)).tag} requested.`)
			return { status: 501 }
		} catch(err) {
			module.logger.Error(err, "Error while routing update")
			return { status: 500 }
		}
	})
}
