import { ObjectId } from "mongodb";

export type Position = 'TOP' | 'JUNGLE' | 'MID' | 'SUPPORT' | 'BOTTOM';

export default class Build {
    constructor(
        public championName: string,
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
