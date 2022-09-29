import { RiotAPITypes } from '@fightmegg/riot-api';
import { MatchParticipant } from '../model/match-participant';
import { MatchTimeline } from '../model/match-timeline';
import { calculatePosition } from './position-determiner';

export const toMatchTimelines = (
    matchDtos: RiotAPITypes.MatchV5.MatchDTO[],
    matchTimelineDtos: RiotAPITypes.MatchV5.MatchTimelineDTO[]
) => {
    let matchTimelines: MatchTimeline[] = [];
    matchDtos.forEach((matchDto) => {
        const matchTimelineDto = findMatchTimelineDtoFromMatchDto(matchDto, matchTimelineDtos);
        matchTimelines.push({
            matchId: matchTimelineDto.metadata.matchId,
            participants: toMatchParticipants(matchDto, matchTimelineDto),
            frames: matchTimelineDto.info.frames,
        });
    });
    return matchTimelines;
};

const toMatchParticipants = (
    matchDto: RiotAPITypes.MatchV5.MatchDTO,
    matchTimelineDto: RiotAPITypes.MatchV5.MatchTimelineDTO
) =>
    matchDto.info.participants.map((participantDto) =>
        toMatchParticipant(participantDto.participantId, matchDto, matchTimelineDto)
    );

const toMatchParticipant = (
    participantId: number,
    matchDto: RiotAPITypes.MatchV5.MatchDTO,
    matchTimelineDto: RiotAPITypes.MatchV5.MatchTimelineDTO
) => {
    const matchParticipantDto = matchDto.info.participants.find(
        (participant) => participant.participantId === participantId
    );
    if (!matchParticipantDto) {
        throw new Error(`No participant with ID ${participantId} found in ParticipantDTOs`);
    }

    return {
        participantId,
        championId: matchParticipantDto.championId,
        position: calculatePosition(matchTimelineDto.info.frames, matchParticipantDto),
    } as MatchParticipant;
};

const findMatchTimelineDtoFromMatchDto = (
    matchDto: RiotAPITypes.MatchV5.MatchDTO,
    matchTimelineDtos: RiotAPITypes.MatchV5.MatchTimelineDTO[]
) => {
    const matchTimelineDto = matchTimelineDtos.find(
        (matchTimelineDto) => matchTimelineDto.metadata.matchId === matchTimelineDto.metadata.matchId
    );
    if (!matchTimelineDto) {
        throw new Error(`No MatchDTO found for MatchTimelineDTO with ID ${matchDto.metadata.matchId}`);
    }
    return matchTimelineDto;
};
