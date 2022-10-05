import { Position } from '../../../src/common/model/position';

export class MatchParticipantBuilder {
    private championId = 1;
    private participantId = 1;
    private position = Position.BOT;

    public build() {
        return {
            championId: this.championId,
            participantId: this.participantId,
            position: this.position,
        };
    }

    public withChampionId(championId: number) {
        this.championId = championId;
        return this;
    }

    public withParticipantId(participantId: number) {
        this.participantId = participantId;
        return this;
    }

    public withPosition(position: Position) {
        this.position = position;
        return this;
    }
}
