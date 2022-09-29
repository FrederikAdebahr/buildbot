import { Position } from "../../common/model/position";

export interface BuildKey {
    championId: number;
    position: Position | undefined;
}
