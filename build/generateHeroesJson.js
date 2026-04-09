import fs from 'node:fs/promises';
const HEROES_URL = 'https://raw.githubusercontent.com/odota/dotaconstants/refs/heads/master/build/heroes.json';
const rawHeroes = await fetchJSON(HEROES_URL);
const formattedHeroes = Object.values(rawHeroes).map(hero => formatHero(hero));
await writeJSON('heroes.json', formattedHeroes);
var Attribute;
(function (Attribute) {
    Attribute["Strength"] = "str";
    Attribute["Agility"] = "agi";
    Attribute["Intelligence"] = "int";
    Attribute["Universal"] = "all";
})(Attribute || (Attribute = {}));
function formatHero(rawHero) {
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
            primary: rawHero.primary_attr,
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
    };
}
async function fetchJSON(url) {
    console.log(`Fetching ${url}...`);
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}!`);
    }
    console.log(`Got ${url}!`);
    return response.json();
}
async function writeJSON(filePath, data) {
    try {
        console.log(`Writing ${filePath}...`);
        await fs.writeFile(`dist/data/${filePath}`, JSON.stringify(data, null, '\t'));
        console.log(`Wrote ${filePath}!`);
    }
    catch (error) {
        throw new Error(`Could not write ${filePath}: ${error}`);
    }
}
//# sourceMappingURL=generateHeroesJson.js.map