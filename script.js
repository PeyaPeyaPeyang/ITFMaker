const wordInputs = [
  document.getElementById("word-1"),
  document.getElementById("word-2"),
  document.getElementById("word-3"),
];
const resultBox = document.getElementById("result");
const rerollButton = document.getElementById("reroll");

function buildWordPool(wordlist) {
  return [wordlist.nouns, wordlist.conjs, wordlist.advs, wordlist.verbs, wordlist.others].flat();
}

function pickThreeWords(values) {
  const shuffled = [...values];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const picked = shuffled.slice(0, 3);
  while (picked.length < 3 && values.length > 0) {
    picked.push(values[Math.floor(Math.random() * values.length)]);
  }
  return picked;
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
    const pool = buildWordPool(wordlist);

    const reroll = () => renderWords(pickThreeWords(pool));

    rerollButton.addEventListener("click", reroll);
    reroll();
  } catch (error) {
    console.error(error);
    rerollButton.disabled = true;
    resultBox.textContent = "単語リストの読み込みに失敗しました。ページを再読み込みしてください。";
  }
}

setup();
