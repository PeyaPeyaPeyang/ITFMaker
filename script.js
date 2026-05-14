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
const WORD_HIGHLIGHT_COLOR = "#00ffff";
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

function pickEntry(wordlist, primaryCategories, letter, fallbackCategories = []) {
  const primaryEntries = listEntries(wordlist, primaryCategories);
  const fallbackEntries = listEntries(wordlist, fallbackCategories);
  const allEntries = listEntries(wordlist, ALL_CATEGORIES);
  const priorityGroups = [
    primaryEntries.filter((entry) => startsWithLetter(entry.word, letter)),
    fallbackEntries.filter((entry) => startsWithLetter(entry.word, letter)),
    primaryEntries,
    fallbackEntries,
    allEntries,
  ];

  for (const group of priorityGroups) {
    const picked = pickRandom(group);
    if (picked) {
      return picked;
    }
  }

  return null;
}

function pickThreeWords(wordlist) {
  const first = pickEntry(wordlist, ["nouns", "verbs"], "I");
  if (!first) {
    return [];
  }

  const second =
    first.category === "nouns"
      ? pickEntry(wordlist, ["others", "verbs"], "T", ["conjs"])
      : pickEntry(wordlist, ["conjs"], "T", ["others", "verbs"]);
  if (!second) {
    return [first.word];
  }

  let third;
  if (second.category === "conjs") {
    third = pickEntry(wordlist, ["verbs"], "F", ["nouns", "others"]);
  } else if (second.category === "others") {
    third = pickEntry(wordlist, ["others", "nouns"], "F", ["verbs"]);
  } else {
    third = pickEntry(wordlist, ["nouns", "verbs", "others"], "F", ["conjs"]);
  }

  if (!third) {
    return [first.word, second.word];
  }

  return [first.word, second.word, third.word];
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

  context.fillStyle = PRIMARY_TEXT_COLOR;
  context.font = TITLE_FONT;
  context.fillText("ITF Maker", 80, 100);

  context.fillStyle = WORD_HIGHLIGHT_COLOR;
  context.font = WORD_FONT;
  normalizedWords.forEach((word, index) => {
    context.fillText(word, 80, 220 + index * 120);
  });

  context.fillStyle = PRIMARY_TEXT_COLOR;
  context.font = FOOTER_FONT;
  context.fillText("#ITF", 80, 560);
  context.fillText(SHARE_URL, 220, 560);

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
