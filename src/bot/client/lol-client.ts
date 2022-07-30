import { RiotAPI, RiotAPITypes } from '@fightmegg/riot-api';

export async function getItemName(itemId?: number): Promise<string> {
    if (!itemId) {
        return 'UNDEFINED';
    }
    let rAPI = new RiotAPI(process.env.RIOT_TOKEN || '');
    let items = await rAPI.ddragon.items();
    return items.data[itemId].name;
}
