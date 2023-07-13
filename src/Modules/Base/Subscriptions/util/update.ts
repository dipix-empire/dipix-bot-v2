import { Module } from "../../../../types/Module";
import { getPlanDetail } from "./plans";
import { Sub } from "./util";

export default async function Update(module: Module, s: Sub): Promise<[UpdateResult, number | undefined]> {
	try {
		/**
		 * *	Outdate current sub
		 * *	Make sure user sub procceded
		 * *	Notify if not and exit
		 * *	Proceed
		 * *	Notify user and logger
		 */
		await module.app.prisma.subscription.update({
			where: { id: s.id },
			data: { status: "expired" }
		})
		if (s.balance < getPlanDetail(s.nextPlan).cost)
			return [UpdateResult.notEnoughBalance, s.balance]
		let newSub = await module.app.prisma.subscription.create({
			data: {
				userId: s.uid,
				plan: s.nextPlan,
				started: new Date(),
				ends: new Date(Date.now() + getPlanDetail(s.nextPlan).duration),
				status: "active"
			}
		})
		let updatedUser = await module.app.prisma.user.update({
			where: {
				id: s.uid
			},
			data: {
				balance: {
					decrement: getPlanDetail(newSub.plan).cost
				}
			}
		})
		return [UpdateResult.successful, updatedUser.balance]
	} catch (err) {
		module.logger.Error(err, `Error during ${s.uid} / <@${s.discord}> subscription update`)
		return [UpdateResult.internalError, undefined]
	}
}

export enum UpdateResult {
	"successful" = 0,
	"internalError" = 1,
	"notEnoughBalance" = 2,
}
