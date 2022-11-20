import { Client } from 'discord.js';

const extractImageId = (imageUrl: string) => {
    const regex = /(.+\/)*(?<imageName>[^.]+).*/;
    const result = regex.exec(imageUrl);
    if (!result?.groups) {
        return;
    }
    return result.groups['imageName'];
};

export const getEmojiFromUrl = (imageUrl: string, client: Client) => {
    return client.emojis.cache.find((emoji) => emoji.name === extractImageId(imageUrl))?.toString() ?? '';
};

export const getBlankEmoji = (client: Client) => {
    return client.emojis.cache.find((emoji) => emoji.name === 'Blank')?.toString() ?? '';
};
