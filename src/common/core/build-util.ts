import { Build } from '../model/build';

export const getTopThreeBuildsByPopularitySorted = (builds: Build[]) => builds.sort(buildComparator).slice(0, 3);

const buildComparator = (buildA: Build, buildB: Build) => {
    if (buildA.popularity > buildB.popularity) {
        return -1;
    }
    if (buildA.popularity < buildB.popularity) {
        return 1;
    }
    return 0;
};
