import { Attribute, type FormattedHero, type Match } from './types.js';
import { sampleMatches } from './sample-data.js';

interface NamedElement {
	node: Element,
	name: string
}

interface HeroGrid {
	total: NamedElement,
	str: NamedElement,
	agi: NamedElement,
	int: NamedElement,
	uni: NamedElement
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
	sum_seconds_played: number,
	shortest_duration: number,
	longest_duration: number
	hero_stats: Record<number, HeroStats>
	role_counts: Record<string, number>,
	role_wins: Record<string, number>
}

// Top level
const IMG_PATH = './build/assets/img/';

const heroData: FormattedHero[] = await fetch('./build/assets/json/heroes.json').then(r => r.json());
const matches: Match[] = sampleMatches;
const mostPickedSection: NamedElement = { 
	node: tryGetElement('#most-picked-heroes'),
	name: 'mostPickedSection'
}
const mostWinsSection: NamedElement =  {
	node: tryGetElement('#most-wins-heroes'),
	name: 'mostWinsSection'
}
const mostPickedHeroFramesList = getHeroGridFromElementList(tryGetElements('.hero-stat-frame', mostPickedSection));
const mostWinsHeroFramesList = getHeroGridFromElementList(tryGetElements('.hero-stat-frame', mostWinsSection));
const textStats = {
	topRoles: {node: tryGetElement('#top-roles'), name: 'top-roles'} as NamedElement,
	winrate: {node: tryGetElement('#winrates'), name: 'winrate'} as NamedElement,
	gameTime: {node: tryGetElement('#game-time'), name: 'game-time'} as NamedElement
}
const addMatchSection: NamedElement = {
	node: tryGetElement('#add-match'),
	name: 'addMatchSection'
}
const addMatchForm = {
	form: assert(document.forms[0], 'document.forms[0]', 'Could not get form'),
	heroSelect: tryGetElement<HTMLSelectElement>('#hero-select', addMatchSection),
	gameLengthInput: tryGetElement<HTMLSelectElement>('#game-length', addMatchSection),
	radiantRadioBtn: tryGetElement<HTMLInputElement>('#radiant', addMatchSection),
	direRadioBtn: tryGetElement<HTMLInputElement>('#dire', addMatchSection),
	winRadioBtn: tryGetElement<HTMLInputElement>('#win', addMatchSection),
	lossRadioBtn: tryGetElement<HTMLInputElement>('#loss', addMatchSection),
	resetBtn: tryGetElement<HTMLInputElement>('button[type="reset"]', addMatchSection),
	submitBtn: tryGetElement<HTMLButtonElement>('button[type="submit"]', addMatchSection)
}
const matchList = tryGetElement<HTMLElement>('#match-list');

// Dashboard
let matchData: AnalyzedMatchData;
updateAnalysis();

// Form
setHeroSelectOptions(addMatchForm.heroSelect, heroData);
addMatchForm.gameLengthInput.addEventListener('input', () => {
	const input = addMatchForm.gameLengthInput;
	// Replace non-digits
	let value = input.value.replace(/\D/g, '');
	console.log(value);
	// Limit total length to 6 digits (HHMMSS)
	if(value.length > 6){
		value = value.slice(0, 6);
	}
	const length = value.length;
	// Format to HH:MM:SS.
	let formattedString = '';
	for(let i = 0; i < length; i++) {
		formattedString += value.charAt(i);
		if(i === length - 3 || i === length - 5) {
			formattedString += ':';
		}
	}
	console.log(formattedString);
	input.value = formattedString;
});
addMatchForm.form.addEventListener('submit', (e) => {
	e.preventDefault();
	matches.push({
		hero_id: parseInt(addMatchForm.heroSelect.value),
		seconds: secondsFromTimerString(addMatchForm.gameLengthInput.value),
		side: addMatchForm.form['side'].value,
		result: addMatchForm.form['result'].value
	});
	addMatchForm.form.reset();
	console.log(matches);
	updateAnalysis();
});


// Functions
function tryGetElement<T extends Element>(selector: string, root?: NamedElement): T {
	const rootNode = root? root.node : document;
	const fullSelector = `${root? root.name : 'document'} selector`;
	return assert(rootNode.querySelector(selector), fullSelector, 'Could not get element.') as T;
}

function tryGetElements(selector: string, root?: NamedElement): NodeListOf<Element> {
	const rootNode = root ? root.node : document;
	const fullSelector = `${root? root.name : 'document'} selector`;
	return assert(rootNode.querySelectorAll(selector), fullSelector, 'Could not get any elements.');
}

function getHeroGridFromElementList(elementList: NodeListOf<Element>): HeroGrid {
	const [total, str, agi, int, uni] = elementList;
	if(!(total && str && agi && int && uni)) {
		throw new Error(`Could not set hero grid. Element list was incomplete with a length of ${elementList.length}`);
	}
	return {
		total: {node: total, name: 'total'},
		str: {node: str, name: 'str'},
		agi: {node: agi, name: 'agi'},
		int: {node: int, name: 'int'},
		uni: {node: uni, name: 'uni'}
	}
}

function updateAnalysis(): void {
	matchData = analyzeMatches(matches);
	populateMostPickedFrames(Object.values(matchData.hero_stats), matchData.match_count.radiant + matchData.match_count.dire);
	populateTextStats(matchData);
	populateMostWinsFrames(Object.values(matchData.hero_stats), matchData.match_count.radiant + matchData.match_count.dire);
	redrawMatchList();

}

function analyzeMatches(matches: Match[]): AnalyzedMatchData {
	const matchData: AnalyzedMatchData = {
		match_count: {radiant: 0, dire: 0},
		match_wins: {radiant: 0, dire: 0},
		sum_seconds_played: 0,
		shortest_duration: 9999,
		longest_duration: 0,
		hero_stats: [],
		role_counts: {},
		role_wins: {}
	}
	matches.forEach(match => {
		const {hero_id, seconds, side, result} = match;
		matchData.sum_seconds_played+= seconds;
		if (matchData.shortest_duration > seconds) {
			matchData.shortest_duration = seconds;
		}
		if (matchData.longest_duration < seconds) {
			matchData.longest_duration = seconds;
		}
		const hero = assert(heroData.find(h => h.id === hero_id), `hero: ${hero_id}`, 'Could not find hero in heroData!');
		hero.roles.forEach(role => {
			matchData.role_counts[role] ??= 0;
			matchData.role_counts[role]++;
			if(result === 'win') {
				matchData.role_wins[role] ??= 0;
				matchData.role_wins[role]++;
			}
		})
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
		matchData.hero_stats[hero_id] ??= {id: hero_id, picks: 0, wins: 0};
		matchData.hero_stats[hero_id].picks++;
		if(result === 'win') {
			matchData.hero_stats[hero_id].wins++;
		}
	});
	return matchData;
}

function getMostPickedHero(heroes: HeroStats[]): HeroStats {
	heroes.sort((a, b) => b.picks - a.picks);
	// We throw explicitly instead of not-null asserting silently so that bugs are heard.
	if(!heroes[0]) {
		throw new Error('getMostPickedHero was handed an undefined HeroStats');
	}
	return heroes[0];
}

function getMostWinsHero(heroes: HeroStats[]): HeroStats {
	heroes.sort((a, b) => b.wins - a.wins);
	// We throw explicitly instead of not-null asserting silently so that bugs are heard.
	if (!heroes[0]) {
		throw new Error('getMostWinsHero was handed an undefined HeroStats');
	}
	return heroes[0];
}

function populateTextStats(matchData: AnalyzedMatchData): void {
	const {topRoles, winrate, gameTime} = textStats;
	const {match_count, match_wins, role_counts, role_wins, sum_seconds_played, shortest_duration, longest_duration} = matchData;
	const totalMatches = match_count.radiant + match_count.dire;
	const totalWins = match_wins.radiant + match_wins.dire;

	// Roles
	const partialErrorMsg = 'Could not get entry from match data!';
	const carryPicks = assert(role_counts['Carry'], 'role_counts["Carry"]', partialErrorMsg);
	const carryWins = assert(role_wins['Carry'], 'role_wins["Carry"]', partialErrorMsg);
	const supportPicks = assert(role_counts['Support'], 'role_counts["Support"]', partialErrorMsg);
	const supportWins = assert(role_wins['Support'], 'role_wins["Support"]', partialErrorMsg);
	
	delete role_counts['Carry'];
	delete role_counts['Support'];
	const minorRolesCount = Object.entries(role_counts);
	minorRolesCount.sort((a, b) => b[1] - a[1]);
	
	const carryOrSupport: NamedElement = {
		node: tryGetElement<HTMLDivElement>('div.flex', topRoles),
		name: 'carryOrSupport'
	}
	const otherRoles: NamedElement = {
		node: tryGetElement<HTMLDivElement>('div.grid', topRoles),
		name: 'otherRoles'
	}
	
	const [carrySection, supportSection]= tryGetElements('section', carryOrSupport);
	if(!(carrySection && supportSection)) {
		throw new Error('Could not get carry or support section in textStats');
	}
	const mainRoleSection = carryPicks > supportPicks ? carrySection: supportSection;
	const subRoleSection = carryPicks > supportPicks ? supportSection : carrySection;
	mainRoleSection.classList.add('main-role');
	mainRoleSection.classList.remove('sub-role');
	subRoleSection.classList.add('sub-role');
	subRoleSection.classList.remove('main-role');

	const [carryPick, carryWin, supportPick, supportWin] = tryGetElements('span', carryOrSupport);
	if(!(carryPick && carryWin && supportPick && supportWin)) {
		throw new Error('Could not get all elements for carryOrSupport div.')
	}
	carryPick.textContent = `Pick: ${carryPicks}`;
	carryWin.textContent = `Win: ${carryWins}`;
	supportPick.textContent = `Pick: ${supportPicks}`;
	supportWin.textContent = `Win: ${supportWins}`;
	
	const [role1, matches1, pick1, win1, role2, matches2, pick2, win2, role3, matches3, pick3, win3] = tryGetElements('span', otherRoles);
	const roles = [
		{
			name: role1,
			count: matches1,
			pick_rate: pick1,
			win_rate: win1
		},
		{
			name: role2,
			count: matches2,
			pick_rate: pick2,
			win_rate: win2
		},
		{
			name: role3,
			count: matches3,
			pick_rate: pick3,
			win_rate: win3
		}
	];
	roles.forEach((placement, i) => {
		const [roleName, roleCount] = assert(minorRolesCount[i], `minorRolesCount[${i}]`, 'Could not find sorted role.');
		placement.name!.textContent = roleName;
		placement.count!.textContent = `${roleCount} matches`;
		placement.pick_rate!.textContent = `Pick: ${Math.round(roleCount / totalMatches * 100)}%`;
		placement.win_rate!.textContent = `Pick: ${Math.round(role_wins[roleName]! / roleCount * 100)}%`;
	});
	
	// Winrate
	const  [totalWinrate, radiantWinrate, direWinrate] = tryGetElements('p', winrate);
	totalWinrate!.textContent = `${Math.round(totalWins / totalMatches * 100)}%`;
	radiantWinrate!.textContent = `Radiant: ${Math.round(match_wins.radiant / match_count.radiant * 100)}%`;
	direWinrate!.textContent = `Dire: ${Math.round(match_wins.dire / match_count.dire * 100)}%`;

	// Game-time
	const gamesPlayed = tryGetElement<HTMLElement>('p', gameTime);
	gamesPlayed.textContent = `Matches played: ${totalMatches}`;
	const [shortest, avg, longest] = tryGetElements('span', gameTime);
	shortest!.textContent = `Shortest: ${timerStringFromSeconds(shortest_duration)}`;
	avg!.textContent = `Avg: ${timerStringFromSeconds(sum_seconds_played / totalMatches)}`;
	longest!.textContent = `Longest: ${timerStringFromSeconds(longest_duration)}`;
}

function populateMostPickedFrames(heroes: HeroStats[], totalGames: number): void {
	const totalHero = getMostPickedHero(heroes);
	setHeroFrame(mostPickedHeroFramesList.total, totalHero, totalGames);
	const remainingHeroes = heroes.filter(hero => hero.id != totalHero.id);
	const strHero = getMostPickedHero(remainingHeroes.filter(h => heroData.find(hData => hData.id === h.id)!.attributes.primary === Attribute.Strength));
	setHeroFrame(mostPickedHeroFramesList.str, strHero, totalGames);
	const agiHero = getMostPickedHero(remainingHeroes.filter(h => heroData.find(hData => hData.id === h.id)!.attributes.primary === Attribute.Agility));
	setHeroFrame(mostPickedHeroFramesList.agi, agiHero, totalGames);
	const intHero = getMostPickedHero(remainingHeroes.filter(h => heroData.find(hData => hData.id === h.id)!.attributes.primary === Attribute.Intelligence));
	setHeroFrame(mostPickedHeroFramesList.int, intHero, totalGames);
	const uniHero = getMostPickedHero(remainingHeroes.filter(h => heroData.find(hData => hData.id === h.id)!.attributes.primary === Attribute.Universal));
	setHeroFrame(mostPickedHeroFramesList.uni, uniHero, totalGames);
}

function populateMostWinsFrames(heroes: HeroStats[], totalGames: number): void {
	const totalHero = getMostWinsHero(heroes);
	setHeroFrame(mostWinsHeroFramesList.total, totalHero, totalGames);
	const remainingHeroes = heroes.filter(hero => hero.id != totalHero.id);
	const strHero = getMostWinsHero(remainingHeroes.filter(h => heroData.find(hData => hData.id === h.id)!.attributes.primary === Attribute.Strength));
	setHeroFrame(mostWinsHeroFramesList.str, strHero, totalGames);
	const agiHero = getMostWinsHero(remainingHeroes.filter(h => heroData.find(hData => hData.id === h.id)!.attributes.primary === Attribute.Agility));
	setHeroFrame(mostWinsHeroFramesList.agi, agiHero, totalGames);
	const intHero = getMostWinsHero(remainingHeroes.filter(h => heroData.find(hData => hData.id === h.id)!.attributes.primary === Attribute.Intelligence));
	setHeroFrame(mostWinsHeroFramesList.int, intHero, totalGames);
	const uniHero = getMostWinsHero(remainingHeroes.filter(h => heroData.find(hData => hData.id === h.id)!.attributes.primary === Attribute.Universal));
	setHeroFrame(mostWinsHeroFramesList.uni, uniHero, totalGames);
}

function setHeroFrame(frame: NamedElement, heroStats: HeroStats, totalGames: number): void {
	const {id, picks, wins} = heroStats;
	const hero = assert(heroData.find(h => h.id === id), id.toString(), 'Failed to get hero from heroData!');
	const name = tryGetElement<HTMLHeadingElement>('h4', frame);
	const img = tryGetElement<HTMLImageElement>('img', frame);
	const pickRate = tryGetElement<HTMLElement>('.bottom-left', frame);
	const winRate = tryGetElement<HTMLElement>('.bottom-right', frame);
	
	name.textContent = hero.name.localized;
	name.classList.remove('str', 'agi', 'int', 'all');
	name.classList.add(hero.attributes.primary);
	img.src = IMG_PATH + hero.name.static + '.png';
	img.alt = hero.name.localized;
	pickRate.textContent = `${Math.round(picks / totalGames * 100)}%`;
	winRate.textContent = `${Math.round(wins / picks * 100)}%`;
}

function timerStringFromSeconds(duration: number): string {
	const wholeSeconds = Math.round(duration);
	const seconds = wholeSeconds % 60;
	const minutes = ((wholeSeconds - seconds) % 3600) / 60;
	const hours = Math.floor((wholeSeconds - seconds - minutes) / 3600);
	const hoursString = hours > 0 ? `${hours.toString().padStart(2, '0')}:` : '';
	return `${hoursString}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function secondsFromTimerString(duration: string): number {
	let seconds = 0;
	console.log(duration);
	const durations = duration.split(':');
	console.log(durations);
	durations.forEach((timeString, i) => {
		console.log(timeString);
		// Hours
		if(durations.length - i === 3) {
			seconds += parseInt(timeString) * 3600;
		}
		// Minutes
		else if(durations.length - i === 2) {
			seconds += parseInt(timeString) * 60;
		}
		else {
			seconds += parseInt(timeString);
		}
	});
	return seconds;
}

function redrawMatchList() {
	matchList.replaceChildren();
	matches.forEach((match, id) => {
		const hero = assert(heroData.find(h => h.id === match.hero_id), `heroData with id ${match.hero_id}`, 'Could not get hero when creating match entry');
		const entry = document.createElement('article');
		entry.dataset['match'] = id.toString();
		entry.classList.add('flex', 'horizontal');
		entry.style.justifyContent = 'start';
		entry.style.padding = '0.5rem 1rem';
		entry.style.gap = '1rem';
		
		const heroImg = document.createElement('img');
		heroImg.src = IMG_PATH + hero.name.static + '.png';
		heroImg.alt = hero.name.localized;
		heroImg.style.width = 'calc(var(--img-width) * 0.5)';
		
		const heroName = document.createElement('h4');
		heroName.textContent = hero.name.localized;
		heroName.classList.add('attribute', hero.attributes.primary);
		
		const duration = document.createElement('span');
		duration.textContent = `Game length: ${timerStringFromSeconds(match.seconds)}`;
		
		const side = document.createElement('span');
		side.textContent = match.side;
		
		const result = document.createElement('span');
		result.textContent = match.result;
		
		const editBtn = document.createElement('button');
		editBtn.classList.add('btn-change');
		
		const removeBtn = document.createElement('button');
		removeBtn.classList.add('btn-destructive');
		removeBtn.addEventListener('click', () => {
			matches.splice(id, 1);
			redrawMatchList();
		});
		
		const matchDetails = document.createElement('p');
		matchDetails.style.display = 'grid';
		matchDetails.style.gridTemplateColumns = 'repeat(5, 1fr)';
		matchDetails.style.width = '100%';
		matchDetails.style.alignItems = 'center';
		matchDetails.style.justifyItems = 'start';
		matchDetails.append(duration, side, result, editBtn, removeBtn);
		
		const verticalDiv = document.createElement('div');
		verticalDiv.classList.add('flex', 'vertical');
		verticalDiv.style.alignItems = 'start';
		verticalDiv.style.height = '100%';
		verticalDiv.style.width = '100%';
		verticalDiv.append(heroName, matchDetails);
		
		entry.append(heroImg, verticalDiv);
		matchList.append(entry);
	});
}

function assert<T>(object: T, objectName: string, partialErrorMsg: string): NonNullable<T> {
	if(!object) {
		throw new Error(`${partialErrorMsg}: ${objectName} is nullish!`)
	}
	return object;
}

function setHeroSelectOptions(select: HTMLSelectElement, heroes: FormattedHero[]) {
	const options: HTMLOptionElement[] = [];
	heroes.forEach(hero => {
		const option = document.createElement('option');
		option.label = hero.name.localized;
		option.value = hero.id.toString();
		options.push(option);
	});
	select.append(...options);
}
