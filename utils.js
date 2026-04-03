function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function formatNumber(value) {
  return value.toLocaleString("en-US");
}

function createAudio(src, { loop = false, volume = 1 } = {}) {
  const audio = new Audio(src);
  audio.loop = loop;
  audio.preload = "auto";
  audio.volume = volume;
  return audio;
}