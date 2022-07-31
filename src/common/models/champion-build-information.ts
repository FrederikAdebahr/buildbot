import { ObjectId } from 'mongodb';

export enum Position {
    TOP = 'TOP',
    JUNGLE = 'JUNGLE',
    MID = 'MID',
    SUPPORT = 'SUPPORT',
    BOT = 'BOT',
}

export interface ChampionBuildInformation {
    championId: number;
    position: Position;
    builds: Build[];
    _id?: ObjectId;
}

interface Build {
    itemIds: number[];
}
