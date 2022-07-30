import { ObjectId } from "mongodb";

export default class Build {
  constructor(
    public championName: string,
    public item0: number,
    public item1: number,
    public item2: number,
    public item3: number,
    public item4: number,
    public item5: number,
    public id?: ObjectId
  ) {}
}
