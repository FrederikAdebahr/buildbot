export enum Position {
    TOP = 'TOP',
    JUNGLE = 'JUNGLE',
    MID = 'MID',
    SUPPORT = 'SUPPORT',
    BOT = 'BOT',
}

export interface ChampionBuildInformation {
    championId: number;
    position: Position | undefined;
    builds: Array<Build>;
}

export interface Build {
    itemIds: Array<number | undefined>;
    trinket: number | undefined;
}
