import { expect } from 'chai';
import { generateItemBuildsFromMatch } from '../../../src/build-aggregator/core/item-build-creator';
import { EventType } from '../../../src/build-aggregator/model/event-type';
import LolClient from '../../../src/common/client/lol-client';
import { Position } from '../../../src/common/model/position';
import { EventDtoBuilder } from '../model/event-builder';
import { FrameDtoBuilder } from '../model/frame-dto-builder';
import { ItemBuildBuilder } from '../model/item-build-builder';
import { MatchParticipantBuilder } from '../model/match-participant-builder';
import { MatchTimelineBuilder } from '../model/match-timeline-builder';

describe('generateItemBuildsFromMatch', () => {
    it('should handle support items correctly', async () => {
        await LolClient.getInstance().init();
        const relicShieldId = 3862;
        const matchParticipantBuilder = new MatchParticipantBuilder();
        const frameDtoBuilder = new FrameDtoBuilder();
        const matchTimelineBuilder = new MatchTimelineBuilder();
        const eventDtoBuilder = new EventDtoBuilder();
        const itemBuildBuilder = new ItemBuildBuilder();

        const participant = matchParticipantBuilder.withPosition(Position.SUPPORT).withChampionId(111).build();
        const eventA = eventDtoBuilder
            .withItemId(relicShieldId)
            .withTimeStamp(1)
            .withType(EventType.ITEM_PURCHASED)
            .build();
        const eventB = eventDtoBuilder
            .withItemId(relicShieldId)
            .withTimeStamp(2)
            .withType(EventType.ITEM_DESTROYED)
            .build();
        const frames = [frameDtoBuilder.withEvents([eventA]).build(), frameDtoBuilder.withEvents([eventB]).build()];
        const matchTimeline = matchTimelineBuilder.withParticipants([participant]).withFrames(frames).build();

        const result = generateItemBuildsFromMatch(matchTimeline);
        const expected = [
            itemBuildBuilder.withChampionId(111).withItems([3862]).withPosition(Position.SUPPORT).build(),
        ];
        expect(result).to.eql(expected);
    });
});
