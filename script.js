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
  currentWords = words.filter(Boolean);
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

function buildShareText(words) {
  return `ITF Maker で\n「${words.join(" ")}」\nを生成しました！\n#ITF\n\n${SHARE_URL}`;
}

function shareOnTwitter(words) {
  if (words.length === 0) {
    return;
  }

  const shareText = buildShareText(words);
  const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
  window.open(intentUrl, "_blank", "noopener,noreferrer");
}

function downloadResultImage(words) {
  if (words.length === 0) {
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "#111111";
  context.font = "bold 56px 'Anton', 'Yu Gothic', sans-serif";
  context.fillText("ITF Maker", 80, 100);

  context.fillStyle = "aqua";
  context.font = "bold 78px 'Anton', 'Yu Gothic', sans-serif";
  words.forEach((word, index) => {
    context.fillText(word, 80, 220 + index * 120);
  });

  context.fillStyle = "#111111";
  context.font = "36px 'Yu Gothic', sans-serif";
  context.fillText("#ITF", 80, 560);
  context.fillText(SHARE_URL, 220, 560);

  const link = document.createElement("a");
  link.download = `itf-maker-${Date.now()}.png`;
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
