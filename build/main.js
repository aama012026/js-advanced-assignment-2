import { sampleMatches } from './sample-data.js';
const IMG_PATH = './build/assets/img/';
console.log(IMG_PATH);
const heroData = await getJSON('./build/assets/json/heroes.json');
console.log(heroData);
const matches = sampleMatches;
console.log(matches);
const mostPickedSection = tryGetElement('#most-picked-heroes');
const mostWinsSection = tryGetElement('#most-wins-heroes');
const mostPickedHeroFramesList = getHeroGridFromElementList(tryGetElements('.hero-stat-frame', mostPickedSection));
console.log(mostPickedHeroFramesList);
const mostWinsHeroFramesList = getHeroGridFromElementList(tryGetElements('.hero-stat-frame', mostWinsSection));
console.log(mostWinsHeroFramesList);
function tryGetElement(selector, rootNode) {
    const root = rootNode ? rootNode : document;
    const element = root.querySelector(selector);
    if (!element) {
        throw new Error(`Could not get element: ${selector}`);
    }
    return element;
}
function tryGetElements(selector, rootNode) {
    const root = rootNode ? rootNode : document;
    const elementList = root.querySelectorAll(selector);
    if (!elementList) {
        throw new Error(`Could not get element: ${selector}`);
    }
    return elementList;
}
function getHeroGridFromElementList(elementList) {
    const [total, str, agi, int, uni] = elementList;
    if (!(total && str && agi && int && uni)) {
        throw new Error(`Could not set hero grid. Element list was incomplete with a length of ${elementList.length}`);
    }
    return {
        total: total,
        str: str,
        agi: agi,
        int: int,
        uni: uni
    };
}
async function getJSON(path) {
    return await fetch(path).then(r => r.json());
}
//# sourceMappingURL=main.js.map