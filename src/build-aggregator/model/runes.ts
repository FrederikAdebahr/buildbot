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
        offense: number,
        defense: number,
        flex: number
    };
}