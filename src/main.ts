import type { FormattedHero, Match } from './types.js';
import { sampleMatches } from './sample-data.js';

interface HeroGrid {
	total: Element,
	str: Element,
	agi: Element,
	int: Element,
	uni: Element
}

interface HeroStats {
	id: number,
	picks: number,
	wins: number,
}

interface AnalyzedMatchData {
	match_count: {
		radiant: number,
		dire: number
	},
	match_wins: {
		radiant: number,
		dire: number
	},
	totalSecondsPlayed: number,
	heroStats: Record<number, HeroStats>
}

const IMG_PATH = './build/assets/img/';
console.log(IMG_PATH);

const heroes: FormattedHero[] = await fetch('./build/assets/json/heroes.json').then(r => r.json());
console.log(heroes);
const matches: Match[] = sampleMatches;
console.log(matches);
const mostPickedSection: Element = tryGetElement('#most-picked-heroes');
const mostWinsSection: Element = tryGetElement('#most-wins-heroes');
const mostPickedHeroFramesList = getHeroGridFromElementList(tryGetElements('.hero-stat-frame', mostPickedSection));
console.log(mostPickedHeroFramesList);
const mostWinsHeroFramesList = getHeroGridFromElementList(tryGetElements('.hero-stat-frame', mostWinsSection));
console.log(mostWinsHeroFramesList);

function tryGetElement(selector: string, rootNode?: Element): Element {
	const root = rootNode ? rootNode : document;
	const element = root.querySelector(selector);
	if (!element) {
		throw new Error(`Could not get element: ${selector}`);
	}
	return element;
}

function tryGetElements(selector: string, rootNode?: Element): NodeListOf<Element> {
	const root = rootNode ? rootNode : document;
	const elementList = root.querySelectorAll(selector);
	if (!elementList) {
		throw new Error(`Could not get element: ${selector}`);
	}
	return elementList;
}

function getHeroGridFromElementList(elementList: NodeListOf<Element>): HeroGrid {
	const [total, str, agi, int, uni] = elementList;
	if(!(total && str && agi && int && uni)) {
		throw new Error(`Could not set hero grid. Element list was incomplete with a length of ${elementList.length}`);
	}
	return {
		total: total,
		str: str,
		agi: agi,
		int: int,
		uni: uni
	}
}

function sortByHero(a: Match, b: Match): number {
	return a.hero_id - b.hero_id;
}

function analyzeMatches(matches: Match[]) {
	const matchData: AnalyzedMatchData = {
		match_count: {radiant: 0, dire: 0},
		match_wins: {radiant: 0, dire: 0},
		totalSecondsPlayed: 0,
		heroStats: []
	}
	matches.forEach(match => {
		const {hero_id, seconds, side, result} = match;
		matchData.totalSecondsPlayed += seconds;
		if(side === 'radiant') {
			matchData.match_count.radiant++;
			if(result === 'win') {
				matchData.match_wins.radiant++;
			}
		}
		else {
			matchData.match_count.dire++;
			if(result === 'win') {
				matchData.match_wins.dire++;
			}
		}
		matchData.heroStats[hero_id] ??= {id: hero_id, picks: 0, wins: 0};
		matchData.heroStats[hero_id].picks++;
		if(result === 'win') {
			matchData.heroStats[hero_id].wins++;
		}
	});
	return matchData;
}

function getMostPickedHero(heroes: HeroStats[]) {
	heroes.sort((a, b) => b.picks - a.picks);
	if(!heroes[0]) {
		throw new Error('getMostPickedHero was handed an undefined HeroStats');
	}
	return heroes[0].id;
}
