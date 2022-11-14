import { RiotAPITypes } from '@fightmegg/riot-api';
import { MatchTimeline } from '../model/match-timeline';
import { calculatePosition } from './position-determiner';
import { MatchParticipant } from '../model/match-participant';

export const toMatchTimeline = (
    matchDto: RiotAPITypes.MatchV5.MatchDTO,
    matchTimelineDto: RiotAPITypes.MatchV5.MatchTimelineDTO
) =>
    ({
        matchId: matchTimelineDto.metadata.matchId,
        participants: toMatchParticipants(matchDto, matchTimelineDto),
        frames: matchTimelineDto.info.frames
    } as MatchTimeline);

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
        perks: matchParticipantDto.perks,
        championId: matchParticipantDto.championId,
        position: calculatePosition(matchTimelineDto.info.frames, matchParticipantDto),
        summonerSpell1: matchParticipantDto.summoner1Id,
        summonerSpell2: matchParticipantDto.summoner2Id
    } as MatchParticipant;
};
