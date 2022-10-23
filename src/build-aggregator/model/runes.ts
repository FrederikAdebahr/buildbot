export interface Runes {
    primaryTree: {
        id: number;
        perks: number[];
    },
    secondaryTree: {
        id: number;
        perks: number[];
    }
    stats: {
        offense: Stats,
        defense: Stats,
        flex: Stats
    };
}

export enum Stats {
    ATTACK_SPEED = 5005,
    ADAPTIVE_FORCE = 5008,
    ARMOR = 5002,
    MAGIC_RESIST = 5003,
    COOLDOWN_REDUCTION = 5007
}