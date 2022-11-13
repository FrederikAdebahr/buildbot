export const getRuneTreeColor = (runeTreeId: number) => {
    switch (runeTreeId) {
        // Precision
        case 8000:
            return '#bfa470';
        // Domination
        case 8100:
            return '#a81243';
        // Sorcery
        case 8200:
            return '#414fbc';
        // Inspiration
        case 8300:
            return '#399aa9';
        // Resolve
        case 8400:
            return '#168927';
        default:
            return null;
    }
};
