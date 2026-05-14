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

function pickWordByLetter(wordlist, letter) {
  const allWords = buildWordPool(wordlist);
  if (allWords.length === 0) {
    return null;
  }
  const matchedWords = allWords.filter((word) => startsWithLetter(word, letter));
  return pickRandom(matchedWords);
}

function pickThreeWords(wordlist) {
  const first = pickWordByLetter(wordlist, "I");
  const second = pickWordByLetter(wordlist, "T");
  const third = pickWordByLetter(wordlist, "F");

  return [first, second, third].filter(Boolean);
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
