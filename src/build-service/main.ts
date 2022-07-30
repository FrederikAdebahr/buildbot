import { RiotAPI, RiotAPITypes, PlatformId } from '@fightmegg/riot-api';
import "dotenv/config";

async function updateItemBuilds() {
    if (!process.env.RIOT_TOKEN) {
        throw Error("Could not find RIOT_TOKEN in your environment");
    }
    console.log(await getBySummonerName("Cyberse"));
}

async function getBySummonerName(summonerName: string) {
    const rAPI = new RiotAPI('RGAPI-KEY');

    const summoner = await rAPI.summoner.getBySummonerName({
        region: PlatformId.EUW1,
        summonerName: 'Cyberse',
    });
    return summoner;
}

await updateItemBuilds();