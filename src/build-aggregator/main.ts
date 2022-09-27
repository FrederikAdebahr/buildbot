import ItemBuildsExtractor from './core/item-builds-extractor';

async function updateItemBuilds() {
    const itemBuildsExtractor = new ItemBuildsExtractor();
    const itemBuilds = itemBuildsExtractor.getItemBuildsForAllMatches();
}

updateItemBuilds();
