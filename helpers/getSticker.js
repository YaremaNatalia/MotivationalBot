import stickers from "./stickers.js";
const getRandomSticker = () => {
  const stickerKeys = Object.keys(stickers);
  const randomStickerKey =
    stickerKeys[Math.floor(Math.random() * stickerKeys.length)];
  return stickers[randomStickerKey];
};

export default getRandomSticker;
