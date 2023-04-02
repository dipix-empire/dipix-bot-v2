import { Plan, Promo } from "@prisma/client";
import App from "../../../App";
import Logger from "../../../types/Logger";
import { getCost, getPlanDetail } from "./plans";

export default function updateSubscriptionBuilder(app: App, logger: Logger) {
	return async (s: sub) => {
		logger.Log(`Processing subscribe ${s.sid} for user ${(await app.bot.users.fetch(s.discord)).tag}`)
		logger.Log(`User: ${s.id} / ${s.discord}`)
		try {
			if (s.sid) await app.prisma.subscription.update({
				where: {
					id: s.sid
				},
				data: {
					status: "expired"
				}
			})
			if (s.proceeded) {
				await app.prisma.subscription.create({
					data: {
						started: s.start,
						userId: s.id,
						plan: s.nextPlan,
						status: "active",
						ends: new Date(s.start.getTime() + 1000 * 60 * 60 * 24 * getPlanDetail(s.nextPlan).duration)
					}
				})
				await app.prisma.user.update({
					where: {
						id: s.id,
					},
					data: {
						balance: {
							decrement: getCost(s.nextPlan, s.nextPromo || undefined)
						}
					}
				})
			}
		} catch (err) {
			logger.Error(`Error while processing subscription ${s.sid}`)
		}
	}
}
export type sub = {
	proceeded: boolean
	id: string
	discord: string
	balance?: number
	nextPlan: Plan
	nextPromo?: Promo | null
	sid?: string
	start: Date
}

export async function onChangeBalance(app: App, id: string, sub: sub, logger: Logger) {
	if (await app.prisma.subscription.findFirst({
		where: { user: { id }, status: "active" }
	})) return
	await updateSubscriptionBuilder(app, logger)(sub)
}
