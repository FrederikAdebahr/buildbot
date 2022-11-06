export const getRuneTreeColor = (runeTreeId: number) => {
    switch (runeTreeId) {
        // Precision
        case 8000:
            return '#edc4a5';
        // Domination
        case 8100:
            return '#a81243';
        // Sorcery
        case 8200:
            return '#414fbc';
        // Inspiration
        case 8300:
            return '#159573';
        // Resolve
        case 8400:
            return '#399aa9';
        default:
            return null;
    }
};
