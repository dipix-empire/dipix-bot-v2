import { PlanDetail } from "./src/types/PlanDetail";

// 
// 3.2 (-12% от 1)*
// 9 (-17% от 1)*
// 2
// 3.2 (-20% от 4)*
// 16 (-33% от 4)*



export default [
	{
		plan: "default",
		cost: 0.9,
		duration: 30,
		name: "Стандартный"
	}, {
		plan: "default4",
		name: "Стандартный (4 мес.)",
		duration: 30 * 4,
		cost: 3.2
	}, {
		plan: "default12",
		name: "Стандартный (год)",
		duration: 365,
		cost: 9
	}, {
		plan: "sponsor",
		cost: 2,
		duration: 30,
		name: "Cпонсорский"
	}, {
		plan: "sponsor2",
		cost: 3.2,
		duration: 30 * 2,
		name: "Спонсорский (2 мес.)"
	}, {
		plan: "sponsor12",
		cost: 16,
		duration: 365,
		name: "Спонсорский (год)"
	}
] as PlanDetail[]
