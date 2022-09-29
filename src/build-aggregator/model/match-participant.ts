import { Position } from "../../common/model/position";

export interface MatchParticipant {
    participantId: number;
    championId: number;
    position: Position | undefined;
}
