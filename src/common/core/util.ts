import chalk from 'chalk';
import Fuse from 'fuse.js';
import { Position } from '../model/position';

export const printError = (errorMessage: string) => console.error(chalk.red(errorMessage));

export const findClosestPosition = (position: string) => {
    const positionsFuse = new Fuse<Position>(Object.values(Position));
    const results = positionsFuse.search(position);
    if (!results || !results.length) {
        return undefined;
    }
    return results[0].item;
};