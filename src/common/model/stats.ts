export enum Stats {
    ATTACK_SPEED = 5005,
    ADAPTIVE_FORCE = 5008,
    ARMOR = 5002,
    MAGIC_RESIST = 5003,
    COOLDOWN_REDUCTION = 5007
}

export const getStatName = (stat: Stats) => {
    switch (stat) {
        case Stats.ATTACK_SPEED:
            return 'Attack Speed';
        case Stats.ADAPTIVE_FORCE:
            return 'Adaptive Force';
        case Stats.ARMOR:
            return 'Armor';
        case Stats.MAGIC_RESIST:
            return 'Magic Resist';
        case Stats.COOLDOWN_REDUCTION:
            return 'Cooldown Reduction';
    }
};
