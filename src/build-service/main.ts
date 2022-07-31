import ItemBuildsExtractor from './core/item-builds-extractor';

updateItemBuilds();

async function updateItemBuilds() {
    let itemBuildsExtractor = new ItemBuildsExtractor();
    let itemBuilds = itemBuildsExtractor.getItemBuildsForAllMatches();
}
