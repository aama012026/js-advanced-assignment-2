import fs from 'node:fs/promises';
import type { RawHero, FormattedHero, Attribute } from './types.js';

const HEROES_URL = 'https://raw.githubusercontent.com/odota/dotaconstants/refs/heads/master/build/heroes.json';
const CDN_BASE = 'https://cdn.steamstatic.com/';
const rawHeroes = await fetchJSON(HEROES_URL) as Record<string, RawHero>;
const heroArray = Object.values(rawHeroes);
const formattedHeroes = heroArray.map(hero => formatHero(hero));
await writeJSON('heroes.json', formattedHeroes);
heroArray.forEach(async hero => {
	const img = await fetchImg(CDN_BASE + hero.img);
	await writeImg(`${hero.name}.png`, Buffer.from(img));
});



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
		await fs.writeFile(`build/assets/json/${filePath}`, JSON.stringify(data, null, '\t'));
		console.log(`Wrote ${filePath}!`);
	}
	catch (error) {
		throw new Error(`Could not write ${filePath}: ${error}`);
	}
}

async function fetchImg(url: string, logName?: string) {
	console.log(`Fetching ${logName ? logName : url}`);
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch img: ${logName ? logName + ': ' + url : url}`);
	}
	console.log(`Got ${logName ? logName + ': ' + url : url}`);
	return response.arrayBuffer();
}

async function writeImg(filePath: string, data: Buffer) {
	try {
		console.log(`Writing ${filePath}...`);
		await fs.writeFile(`build/assets/img/${filePath}`, data);
		console.log(`Wrote ${filePath}!`);
	}
	catch (error) {
		throw new Error(`Could not write ${filePath}: ${error}`);
	}
}
