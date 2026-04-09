import fs from 'node:fs/promises';

const HEROES_URL = 'https://raw.githubusercontent.com/odota/dotaconstants/refs/heads/master/build/heroes.json';
const rawHeroes = await fetchJSON(HEROES_URL) as Record<string, RawHero>;
const formattedHeroes = Object.values(rawHeroes).map(hero => formatHero(hero));
await writeJSON('heroes.json', formattedHeroes);

interface RawHero {
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

interface FormattedHero {
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

interface Resource {
	size: number,
	regen: number
}

enum Attribute {
	Strength = 'str',
	Agility = 'agi',
	Intelligence = 'int',
	Universal = 'all'
}

interface AttributeSet {
	strength: number,
	agility: number,
	intelligence: number
}

interface Range {
	min: number,
	max: number
}

interface Attack {
	damage: Range,
	speed: number,
	rate: number,
	point: number,
	range: number,
	projectile_speed: number
}

interface Movement {
	speed: number,
	turnRate: number | null
}

interface Vision {
	day: number,
	night: number
}

function formatHero(rawHero: RawHero): FormattedHero {
	return {
		id: rawHero.id,
		name: {
			static: rawHero.name,
			localized: rawHero.localized_name
		},
		roles: rawHero.roles,
		base_health: {
			size: rawHero.base_health,
			regen: rawHero.base_health_regen
		},
		base_mana: {
			size: rawHero.base_mana,
			regen: rawHero.base_mana_regen
		},
		base_armor: rawHero.base_armor,
		base_magic_resist: rawHero.base_mr,
		base_attack: {
			damage: {
				min: rawHero.base_attack_min,
				max: rawHero.base_attack_max
			},
			speed: rawHero.base_attack_time,
			rate: rawHero.attack_rate,
			point: rawHero.attack_point,
			range: rawHero.attack_range,
			projectile_speed: rawHero.projectile_speed
		},
		attributes: {
			primary: rawHero.primary_attr as Attribute,
			base: {
				strength: rawHero.base_str,
				agility: rawHero.base_agi,
				intelligence: rawHero.base_int
			},
			gain: {
				strength: rawHero.str_gain,
				agility: rawHero.agi_gain,
				intelligence: rawHero.int_gain
			}
		},
		movement: {
			speed: rawHero.move_speed,
			turnRate: rawHero.turn_rate
		},
		vision: {
			day: rawHero.day_vision,
			night: rawHero.night_vision
		},
		legs: rawHero.legs,
		is_in_captains_mode: rawHero.cm_enabled
	}
}

async function fetchJSON(url: string) {
	console.log(`Fetching ${url}...`);
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch ${url}!`);
	}
	console.log(`Got ${url}!`);
	return response.json();
}

async function writeJSON(filePath: string, data: any) {
	try {
		console.log(`Writing ${filePath}...`);
		await fs.writeFile(`dist/data/${filePath}`, JSON.stringify(data, null, '\t'));
		console.log(`Wrote ${filePath}!`);
	}
	catch (error) {
		throw new Error(`Could not write ${filePath}: ${error}`);
	}
}