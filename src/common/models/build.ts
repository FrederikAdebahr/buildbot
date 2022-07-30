import { ObjectId } from "mongodb";

export type Position = 'TOP' | 'JUNGLE' | 'MID' | 'SUPPORT' | 'BOTTOM';

export default class Build {
  constructor(
    public championName: string,
    public position: Position,
    public item0: number,
    public item1: number,
    public item2: number,
    public item3: number,
    public item4: number,
    public item5: number,
    public item6: number,
    public _id?: ObjectId
  ) {}
}
