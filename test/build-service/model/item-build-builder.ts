import { Position } from '../../../src/common/model/position';
import { Trinket } from '../../../src/common/model/trinket';

export class ItemBuildBuilder {
    private matchId = '1';
    private position = 'SUPPORT';
    private participantId = 1;
    private championId = 111;
    private items = [3862];
    private trinket = 0;

    public build() {
        return {
            matchId: this.matchId,
            position: this.position,
            participantId: this.participantId,
            championId: this.championId,
            items: this.items,
            trinket: this.trinket,
        };
    }

    public withMatchId(matchId: string) {
        this.matchId = matchId;
        return this;
    }

    public withPosition(position: Position) {
        this.position = position;
        return this;
    }

    public withParticipantId(participantId: number) {
        this.participantId = participantId;
        return this;
    }

    public withChampionId(championId: number) {
        this.championId = championId;
        return this;
    }

    public withItems(items: number[]) {
        this.items = items;
        return this;
    }

    public withTrinket(trinket: Trinket) {
        this.trinket = trinket;
        return this;
    }
}
