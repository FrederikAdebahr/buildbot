import { RiotAPITypes } from '@fightmegg/riot-api';

export class FrameDtoBuilder {
    private participantFrames = {};
    private events: RiotAPITypes.MatchV5.EventDTO[] = [];
    private timestamp = 1;

    public build() {
        return {
            participantFrames: this.participantFrames,
            events: this.events,
            timestamp: this.timestamp,
        };
    }

    public withParticipantFrames(participantFrames: { [key: string]: RiotAPITypes.MatchV5.ParticipantFrameDTO }) {
        this.participantFrames = participantFrames;
        return this;
    }

    public withEvents(events: RiotAPITypes.MatchV5.EventDTO[]) {
        this.events = events;
        return this;
    }
}
