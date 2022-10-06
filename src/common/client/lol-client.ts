import {PlatformId, RiotAPI, RiotAPITypes} from '@fightmegg/riot-api';
import axios from 'axios';
import 'dotenv/config';
import Fuse from 'fuse.js';
import {exit} from 'process';
import {printError} from '../core/util';

export default class LolClient {
    private readonly REGION = PlatformId.EUW1;
    private readonly CLUSTER = PlatformId.EUROPE;
    private readonly QUEUE = RiotAPITypes.QUEUE.RANKED_SOLO_5x5;
    private readonly QUEUE_ID = 420;

    private static instance?: LolClient;
    private readonly rAPI: RiotAPI;
    private items?: RiotAPITypes.DDragon.DDragonItemWrapperDTO;
    private champions?: RiotAPITypes.DDragon.DDragonChampionListDTO;
    private championNamesFuse?: Fuse<RiotAPITypes.DDragon.DDragonChampionListDataDTO>;

    private constructor() {
        if (!process.env.RIOT_TOKEN) {
            printError('Please provide the RIOT_TOKEN environment variable');
            exit(1);
        }
        this.rAPI = new RiotAPI(process.env.RIOT_TOKEN);
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new LolClient();
        }
        return this.instance;
    }

    public async init() {
        await this.validateToken();

        this.items = await this.rAPI.ddragon.items();
        this.champions = await this.rAPI.ddragon.champion.all();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.championNamesFuse = new Fuse(Object.values(this.champions!.data), {keys: ['name']});
    }

    private async validateToken() {
        try {
            await axios.get('https://euw1.api.riotgames.com/lol/status/v4/platform-data', {
                method: 'get',
                headers: {
                    'X-Riot-Token': this.rAPI.token,
                },
            });
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 403) {
                printError('Invalid Riot API token');
                exit(1);
            }
        }
    }

    public getItem(itemId: number) {
        const item = this.items?.data[itemId];
        if (!item) {
            throw new Error(`Item with ID ${itemId} not found`);
        }
        return item;
    }

    public searchChampion(championSearchString: string): number | undefined {
        const results = this.championNamesFuse?.search(championSearchString);
        if (!results) {
            return undefined;
        }
        return parseInt(results[0].item.key);
    }

    public getChampion(championId: number) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const champion = Object.entries(this.champions!.data).find(
            (entry) => entry[1].key === championId.toString()
        )?.[1];
        if (!champion) {
            throw new Error(`Champion with ID ${championId} not found`);
        }
        return champion;
    }

    public async fetchChallengerPlayers() {
        return await this.rAPI.league.getChallengerByQueue({
            region: this.REGION,
            queue: this.QUEUE,
        });
    }

    public async fetchMatchHistoryForPlayer(player: RiotAPITypes.League.LeagueItemDTO) {
        let summoner = await this.rAPI.summoner.getBySummonerId({
            region: this.REGION,
            summonerId: player.summonerId,
        });
        return await this.rAPI.matchV5.getIdsbyPuuid({
            cluster: this.CLUSTER,
            puuid: summoner.puuid,
            params: {
                queue: this.QUEUE_ID
            }
        });
    }

    public async fetchMatchTimelineById(matchId: string) {
        return await this.rAPI.matchV5.getMatchTimelineById({
            cluster: this.CLUSTER,
            matchId,
        });
    }

    public async fetchMatchById(matchId: string) {
        return await this.rAPI.matchV5.getMatchById({
            cluster: this.CLUSTER,
            matchId: matchId,
        });
    }
}
