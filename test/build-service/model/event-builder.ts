import { EventType } from '../../../src/build-aggregator/model/event-type';

export class EventDtoBuilder {
    private timestamp = 0;
    private type = EventType.ITEM_PURCHASED;
    private itemId = 0;
    private participantId = 1;

    public build() {
        return {
            timestamp: this.timestamp,
            type: this.type,
            itemId: this.itemId,
            participantId: this.participantId,
        };
    }

    public withTimeStamp(timestamp: number) {
        this.timestamp = timestamp;
        return this;
    }

    public withType(type: EventType) {
        this.type = type;
        return this;
    }

    public withItemId(itemId: number) {
        this.itemId = itemId;
        return this;
    }

    public withParticipantId(participantId: number) {
        this.participantId = participantId;
        return this;
    }
}
