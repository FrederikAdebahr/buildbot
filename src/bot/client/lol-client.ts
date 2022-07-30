import { RiotAPI, RiotAPITypes } from '@fightmegg/riot-api';
import { exit } from 'process';

export default class LolClient {
    private rAPI: RiotAPI;
    private items?: RiotAPITypes.DDragon.DDragonItemWrapperDTO;
    private champions?: RiotAPITypes.DDragon.DDragonChampionListDTO;

    constructor() {
        if (!process.env.RIOT_TOKEN) {
            console.error('Please provide the RIOT_TOKEN environment variable');
            exit(1);
        }
        this.rAPI = new RiotAPI(process.env.RIOT_TOKEN);
    }

    public async init() {
        this.items = await this.rAPI.ddragon.items();
        this.champions = await this.rAPI.ddragon.champion.all();
    }

    public getItemName(itemId?: number): string | undefined {
        if (!itemId) {
            return undefined;
        }
        return this.items?.data[itemId].name;
    }

    public getChampionName(championId?: number): string | undefined {
        if (!championId) {
            return undefined;
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return Object.entries(this.champions!.data).find((entry) => entry[1].key === championId.toString())?.[1].name;
    }
}
