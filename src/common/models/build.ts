import { ObjectId } from "mongodb";

export enum Position {
    TOP = 'TOP',
    JUNGLE = 'JUNGLE',
    MID = 'MID',
    SUPPORT = 'SUPPORT',
    BOT = 'BOT'
}

export default class Build {
    constructor(
        public champion: number,
        public position: Position,
        public item0: number | undefined,
        public item1: number | undefined,
        public item2: number | undefined,
        public item3: number | undefined,
        public item4: number | undefined,
        public item5: number | undefined,
        public item6: number | undefined,
        public _id?: ObjectId
    ) {}
}
