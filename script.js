const wordInputs = [
  document.getElementById("word-1"),
  document.getElementById("word-2"),
  document.getElementById("word-3"),
];
const resultBox = document.getElementById("result");
const rerollButton = document.getElementById("reroll");
const shareTwitterButton = document.getElementById("share-twitter");
const downloadImageButton = document.getElementById("download-image");
const ALL_CATEGORIES = ["nouns", "conjs", "advs", "verbs", "others"];
const SHARE_URL = "https://peyapeyapeyang.github.io/ITFMaker/";
const TWITTER_INTENT_BASE_URL = "https://twitter.com/intent/tweet";
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 630;
const IMAGE_BG_COLOR = "#ffffff";
const PRIMARY_TEXT_COLOR = "#111111";
const WORD_HIGHLIGHT_COLOR = "#54bad7";
const TITLE_FONT = "bold 56px 'Anton', 'Yu Gothic', sans-serif";
const WORD_FONT = "bold 78px 'Anton', 'Yu Gothic', sans-serif";
const FOOTER_FONT = "36px 'Yu Gothic', sans-serif";
let currentWords = [];

function buildWordPool(wordlist) {
  return ALL_CATEGORIES.flatMap((category) => wordlist[category] || []);
}

function pickRandom(values) {
  if (values.length === 0) {
    return null;
  }
  return values[Math.floor(Math.random() * values.length)];
}

function listEntries(wordlist, categories) {
  return categories.flatMap((category) =>
    (wordlist[category] || []).map((word) => ({ word, category })),
  );
}

function startsWithLetter(word, letter) {
  return word.toUpperCase().startsWith(letter.toUpperCase());
}

function pickWordByLetter(wordlist, letter) {
  const allWords = buildWordPool(wordlist);
  if (allWords.length === 0) {
    return null;
  }
  const matchedWords = allWords.filter((word) => startsWithLetter(word, letter));
  if (matchedWords.length === 0) {
    return null;
  }
  return pickRandom(matchedWords);
}

function pickThreeWords(wordlist) {
  const first = pickWordByLetter(wordlist, "I");
  const second = pickWordByLetter(wordlist, "T");
  const third = pickWordByLetter(wordlist, "F");

  return [first, second, third].filter((word) => word != null);
}

function renderWords(words) {
  currentWords = [...words];
  wordInputs.forEach((input, index) => {
    input.value = words[index];
  });

  resultBox.innerHTML = "";
  words.forEach((word) => {
    const line = document.createElement("p");
    line.className = "result-line";
    line.textContent = word;
    resultBox.appendChild(line);
  });
}

function normalizeWords(words) {
  return words
    .map((word) => String(word).replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function buildShareText(words) {
  const normalizedWords = normalizeWords(words);
  return `ITF Maker で\n「${normalizedWords.join(" ")}」\nを生成しました！\n#ITF\n\n${SHARE_URL}`;
}

function shareOnTwitter(words) {
  if (normalizeWords(words).length === 0) {
    return;
  }

  const shareText = buildShareText(words);
  const intentUrl = `${TWITTER_INTENT_BASE_URL}?text=${encodeURIComponent(shareText)}`;
  window.open(intentUrl, "_blank", "noopener,noreferrer");
}

function downloadResultImage(words) {
  const normalizedWords = normalizeWords(words);
  if (normalizedWords.length === 0) {
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) {
    console.error("Failed to create canvas context for image download.");
    return;
  }

  context.fillStyle = IMAGE_BG_COLOR;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.textAlign = "left";
  context.textBaseline = "alphabetic";

  context.fillStyle = WORD_HIGHLIGHT_COLOR;
  context.font = WORD_FONT;
  normalizedWords.forEach((word, index) => {
    context.fillText(word, 80, 220 + index * 120);
  });

  const link = document.createElement("a");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  link.download = `itf-maker-${timestamp}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

async function setup() {
  try {
    const response = await fetch("./wordlist.json");
    if (!response.ok) {
      throw new Error(`Failed to load wordlist.json: ${response.status}`);
    }

    const wordlist = await response.json();
    if (buildWordPool(wordlist).length === 0) {
      throw new Error("Word pool is empty");
    }

    const reroll = () => renderWords(pickThreeWords(wordlist));
    shareTwitterButton.addEventListener("click", () => shareOnTwitter(currentWords));
    downloadImageButton.addEventListener("click", () => downloadResultImage(currentWords));
    rerollButton.addEventListener("click", reroll);
    reroll();
  } catch (error) {
    console.error(error);
    rerollButton.disabled = true;
    shareTwitterButton.disabled = true;
    downloadImageButton.disabled = true;
    resultBox.textContent = "単語リストの読み込みに失敗しました。ページを再読み込みしてください。";
  }
}

setup();
