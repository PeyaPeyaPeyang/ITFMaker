const wordInputs = [
  document.getElementById("word-1"),
  document.getElementById("word-2"),
  document.getElementById("word-3"),
];
const resultBox = document.getElementById("result");
const rerollButton = document.getElementById("reroll");

function pickRandom(values) {
  return values[Math.floor(Math.random() * values.length)];
}

function buildWordPool(wordlist) {
  return [wordlist.nouns, wordlist.conjs, wordlist.advs, wordlist.verbs].flat();
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
  const response = await fetch("/wordlist.json", { cache: "no-store" });
  const wordlist = await response.json();
  const pool = buildWordPool(wordlist);

  const reroll = () => renderWords([pickRandom(pool), pickRandom(pool), pickRandom(pool)]);

  rerollButton.addEventListener("click", reroll);
  reroll();
}

setup();
