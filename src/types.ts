export interface RawHero {
	id: number,
	name: string,
	primary_attr: 'agi' | 'str' | 'int' | 'all',
	attack_type: 'Melee' | 'Ranged',
	roles: string[],
	img: string,
	icon: string,
	base_health: number,
	base_health_regen: number,
	base_mana: number,
	base_mana_regen: number,
	base_armor: number,
	base_mr: number,
	base_attack_min: number,
	base_attack_max: number,
	base_str: number,
	base_agi: number,
	base_int: number,
	str_gain: number,
	agi_gain: number,
	int_gain: number,
	attack_range: number,
	projectile_speed: number,
	attack_rate: number,
	base_attack_time: number,
	attack_point: number,
	move_speed: number,
	turn_rate: number | null,
	cm_enabled: boolean,
	legs: number,
	day_vision: number,
	night_vision: number,
	localized_name: string
}

 export interface FormattedHero {
	id: number,
	name: {
		static: string,
		localized: string
	}
	roles: string[],
	base_health: Resource,
	base_mana: Resource,
	base_armor: number,
	base_magic_resist: number,
	base_attack: Attack,
	attributes: {
		primary: Attribute,
		base: AttributeSet,
		gain: AttributeSet
	},
	movement: Movement,
	vision: Vision,
	legs: number,
	is_in_captains_mode: boolean
}

export interface Resource {
	size: number,
	regen: number
}

export enum Attribute {
	Strength = 'str',
	Agility = 'agi',
	Intelligence = 'int',
	Universal = 'all'
}

export interface AttributeSet {
	strength: number,
	agility: number,
	intelligence: number
}

export interface Range {
	min: number,
	max: number
}

export interface Attack {
	damage: Range,
	speed: number,
	rate: number,
	point: number,
	range: number,
	projectile_speed: number
}

export interface Movement {
	speed: number,
	turnRate: number | null
}

export interface Vision {
	day: number,
	night: number
}

export interface Match {
	hero_id: number,
	seconds: number,
	side: 'radiant' | 'dire',
	result: 'win' | 'loss'
}
