const wordInputs = [
  document.getElementById("word-1"),
  document.getElementById("word-2"),
  document.getElementById("word-3"),
];
const resultBox = document.getElementById("result");
const rerollButton = document.getElementById("reroll");
const ALL_CATEGORIES = ["nouns", "conjs", "advs", "verbs", "others"];

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
    rerollButton.addEventListener("click", reroll);
    reroll();
  } catch (error) {
    console.error(error);
    rerollButton.disabled = true;
    resultBox.textContent = "単語リストの読み込みに失敗しました。ページを再読み込みしてください。";
  }
}

setup();
