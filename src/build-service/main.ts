import { RiotAPI, PlatformId } from '@fightmegg/riot-api';
import 'dotenv/config';

let rAPI: RiotAPI;

async function updateItemBuilds() {
    if (!process.env.RIOT_TOKEN) {
        throw Error('Could not find RIOT_TOKEN in your environment');
    }
    rAPI = new RiotAPI(process.env.RIOT_TOKEN);
    console.log(await getBySummonerName('Cyberse'));
}

async function getBySummonerName(summonerName: string) {

    const summoner = await rAPI.summoner.getBySummonerName({
        region: PlatformId.EUW1,
        summonerName: summonerName,
    });
    return summoner;
}

await updateItemBuilds();