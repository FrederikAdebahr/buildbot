export enum Stat {
    ATTACK_SPEED = 5005,
    ADAPTIVE_FORCE = 5008,
    ARMOR = 5002,
    MAGIC_RESIST = 5003,
    COOLDOWN_REDUCTION = 5007
}

export const getStatName = (stat: Stat) => {
    switch (stat) {
        case Stat.ATTACK_SPEED:
            return 'Attack Speed';
        case Stat.ADAPTIVE_FORCE:
            return 'Adaptive Force';
        case Stat.ARMOR:
            return 'Armor';
        case Stat.MAGIC_RESIST:
            return 'Magic Resist';
        case Stat.COOLDOWN_REDUCTION:
            return 'Cooldown Reduction';
    }
};
