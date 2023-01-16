import { PlanDetail } from "./src/types/PlanDetail";

export default [
	{
		plan: "default",
		cost: 0.3,
		duration: 30,
		name: "Стандартный"
	}, {
		plan: "default4",
		name: "Стандартный (4 мес.)",
		duration: 30 * 4,
		cost: 1.1
	}, {
		plan: "default12",
		name: "Стандартный (год)",
		duration: 365,
		cost: 3
	}, {
		plan: "sponsor",
		cost: 1.1,
		duration: 30,
		name: "Cпонсорский"
	}, {
		plan: "sponsor2",
		cost: 1.75,
		duration: 30 * 2,
		name: "Спонсорский (2 мес.)"
	}, {
		plan: "sponsor12",
		cost: 9.25,
		duration: 365,
		name: "Спонсорский (год)"
	}
] as PlanDetail[]
