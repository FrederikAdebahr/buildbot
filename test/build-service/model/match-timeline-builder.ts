import { RiotAPITypes } from '@fightmegg/riot-api';
import { MatchParticipant } from '../../../src/build-aggregator/model/match-participant';

export class MatchTimelineBuilder {
    private matchId = '1';
    private participants: MatchParticipant[] = [];
    private frames: RiotAPITypes.MatchV5.FrameDTO[] = [];

    public build() {
        return {
            matchId: this.matchId,
            participants: this.participants,
            frames: this.frames,
        };
    }

    public withParticipants(participants: MatchParticipant[]) {
        this.participants = participants;
        return this;
    }

    public withFrames(frames: RiotAPITypes.MatchV5.FrameDTO[]) {
        this.frames = frames;
        return this;
    }
}
