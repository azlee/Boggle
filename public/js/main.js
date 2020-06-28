'use strict';

const LETTER_POINTS = {
  'A': 1,
  'B': 3,
  'C': 3,
  'D': 2,
  'E': 1,
  'F': 4,
  'G': 2,
  'H': 4,
  'I': 1,
  'J': 8,
  'K': 5,
  'L': 1,
  'M': 3,
  'N': 1,
  'O': 1,
  'P': 3,
  'Q': 10,
  'R': 1,
  'S': 1,
  'T': 1,
  'U': 1,
  'V': 4,
  'W': 4,
  'X': 8,
  'Y': 4,
  'Z': 10
}

const DICTIONARY = new Trie();

/**
 * Get a random cell on board
 */
function getRandomCell() {
  var width = 3;
  return {
    x: Math.round(Math.random() * width),
    y: Math.round(Math.random() * width),
  };
}

/**
 * Get random letter by how probable the letters are in the alphabet.
 */
function getRandomLetter() {
  var num = Math.random();
  if (num < .11162) {
    return 'E';
  } else if (num < .19659) {
    return 'A';
  } else if (num < .27205) {
    return 'I';
  } else if (num < .34712) {
    return 'O';
  } else if (num < .41461) {
    return 'N';
  } else if (num < .42953) {
    return 'B'
  } else if (num < .45155) {
    return 'C';
  } else if (num < .49408) {
    return 'D';
  } else if (num < .51636) {
    return 'F';
  } else if (num < .53651) {
    return 'G';
  } else if (num < .59745) {
    return 'H';
  } else if (num < .59898) {
    return 'J';
  } else if (num < .6119) {
    return 'K';
  } else if (num < .65215) {
    return 'L';
  } else if (num < .67621) {
    return 'M';
  } else if (num < .6955) {
    return 'P';
  } else if (num < .705) {
    return 'Q';
  } else if (num < .78087) {
    return 'R';
  } else if (num < .84414) {
    return 'S';
  } else if (num < .9377) {
    return 'T';
  } else if (num < .96528) {
    return 'U';
  } else if (num < .97506) {
    return 'V';
  } else if (num < .98506) {
    return 'W';
  } else if (num < .98656) {
    return 'X';
  } else if (num < .999) {
    return 'Y';
  } else if (num <= 1) {
    return 'Z';
  }
}

var NUM_CELLS = 4;

var GameState = {
  board: [[], [], [], []],
  mouseDown: false,
  wordSoFar: [],
  wordsSoFar: new Map(),
  score: 0,
}

function isCellEqual(cell1, cell2) {
  if (cell1.x.toString() === cell2.x.toString() && cell1.y.toString() === cell2.y.toString()) {
    return true;
  }
  return false;
}

function initGameState() {
  // init board
 for (var i = 0; i < NUM_CELLS; i++) {
   for (var j = 0; j < NUM_CELLS; j++) {
     GameState.board[i][j] = getRandomLetter();
   }
 } 
 // init double words and triple
 GameState.doubles = [];
 GameState.triples = [];
 var double = getRandomCell();
 GameState.doubles.push(double);

 var triple = getRandomCell();
 while (isCellEqual(triple, double)) {
   triple = getRandomCell();
 }
 GameState.triples.push(triple);
}

function getPositionOfTarget(id) {
  var strs = id.split("-");
  return {
    x: strs[1],
    y: strs[2],
  };
}

function getIndexOfCell(cell) {
  var i = 0;
  for (var letter of GameState.wordSoFar) {
    if (isCellEqual(cell, letter)) {
      return i;
    }
    i++;
  }
  return -1;
}

function initDict() {
  fetch('https://gist.githubusercontent.com/wchargin/8927565/raw/d9783627c731268fb2935a731a618aa8e95cf465/words')
    .then(response => response.text())
    .then(function(text) {
      var words = text.split('\n');
      for (var word of words) {
        DICTIONARY.insert(word);
      }
    });
}

function checkIfWord(wordCellCords) {
  // check if a word is formed, if so return the points for the word
  var points = 0;
  var word = '';
  var double = false;
  var triple = false;
  for (var pos of wordCellCords) {
    var letter = GameState.board[pos.x][pos.y];
    word += letter;
    points += LETTER_POINTS[letter];
    if (isCellEqual(pos, GameState.doubles[0])) {
      double = true;
    }
    if (isCellEqual(pos, GameState.triples[0])) {
      triple = true;
    }
  }
  if (word.length === 0) {
    return ['', 0];
  }
  // if word already made then don't add
  if (GameState.wordsSoFar.get(word.toLowerCase())) {
    return ['', 0];
  }
  if (DICTIONARY.contains(word.toLowerCase())) {
    if (triple) {
      points *= 3;
    } else if (double) {
      points *= 2;
    }
    return [word.toLowerCase(), points];
  }
  return ['', 0];
}

function setPreviewWord() {
  var previewWord = document.getElementById('previewWord');
  var word = '';

  for (var pos of GameState.wordSoFar) {
    word += GameState.board[pos.x][pos.y];
  }
  previewWord.innerHTML = word;
}

function clearPreviewWord() {
  var previewWord = document.getElementById('previewWord');
  previewWord.innerHTML = '&nbsp;';
  previewWord.style.backgroundColor = '';
}

function highlightCorrectWord() {
  const wordSoFar = GameState.wordSoFar;
  for (var pos of GameState.wordSoFar) {
    var cell = document.getElementById('cell-' + pos.x + '-' + pos.y);
    cell.setAttribute('fill', '#00ff00');
  }
  setTimeout(function() { resetCellColors(wordSoFar) }, 180);
}

function resetCellColors(wordSoFar) {
  for (var pos of wordSoFar) {
    var cell = document.getElementById('cell-' + pos.x + '-' + pos.y);
    // reset to previous color
    if (isCellEqual(pos, GameState.doubles[0])) {
      cell.setAttribute('fill', "#c0ffa2");
    } else if (isCellEqual(pos, GameState.triples[0])) {
      cell.setAttribute('fill', "#ffaaa2");
    } else {
      cell.setAttribute('fill', "#f3f3f3");
    }
  }
}

function redPreviewWord() {
  var previewWord = document.getElementById('previewWord');
  previewWord.innerHTML = '<s>' + previewWord.innerHTML + '</s>';
  // previewWord.style.backgroundColor = '#e60000';
  setTimeout(clearPreviewWord, 400);
}

function greenPreviewWord(points) {
  var previewWord = document.getElementById('previewWord');
  previewWord.style.backgroundColor = '#6ce534';
  var wordPoints = document.createElement('sup');
  wordPoints.innerHTML = points;
  previewWord.appendChild(wordPoints)
  setTimeout(clearPreviewWord, 400);
}

/**************************************************************************
 * 
 * 
 * Window on load function
 * 
 * 
 **************************************************************************/
window.onload = function() {

  // initialize trie
  this.initDict();

  var w = window.innerWidth;
  var h = window.innerHeight;

  // board width
  var bw = 0.75 * Math.min(w, h);
  
  // cell width
  var padding = 25;
  var cellWidth = (bw - (5 * padding)) / 4;

  var ph = (h - bw) / 2;
  var pw = (w - bw) / 2;
  var [x, y] = [pw, ph];

  var cellX = x + cellWidth/2;
  var cellY = y;
    // Make an instance of two and place it on the page.
  var params = { width: w, height: h };
  var two = new Two(params).appendTo(document.getElementById('board'));

  // init game state
  this.initGameState();

  var letterCountFont = { weight: 500, size: '1.5rem', fill: "#353335", userSelect: 'none' };
  var headerFont = { weight: 500, size: '1.5rem', fill: "#ffffff" };
  // two has convenience methods to create shapes.
  for (var i = 0; i < NUM_CELLS; i++) {
    for (var j = 0; j < NUM_CELLS; j++) {
      var cell = two.makeRoundedRectangle(cellX, cellY, cellWidth, cellWidth, 20);
      var id = '-' + i + '-' + j;
      cell.id = "cell" + id;
      var letter = GameState.board[i][j];
      var text = two.makeText(letter, cellX-1, cellY + padding*0.5, { weight: 5, size: '7rem', fill: "#353335"});
      var point = two.makeText(LETTER_POINTS[letter], cellX - 15 + cellWidth/2, cellY + 15 - cellWidth/2, letterCountFont);
      text.id = 'letter' + id;
      point.id = 'point' + id;

      // if double
      if (isCellEqual({x: i, y: j}, GameState.doubles[0])) {
        cell.fill = "#c0ffa2";
        var header = two.makeRoundedRectangle(cellX + 15 - cellWidth/2, cellY + 15 - cellWidth/2, 50, 40, 5);
        header.fill = "#41cc00";
        header.noStroke();
        header.id = 'header' + id;
        var headerText = two.makeText('DW', cellX + 15 - cellWidth/2, cellY + 15 - cellWidth/2, headerFont);
        headerText.id = 'headerText' + id;
      } else if (isCellEqual({x: i, y: j}, GameState.triples[0])) {
        cell.fill = "#ffaaa2";
        var header = two.makeRoundedRectangle(cellX + 15 - cellWidth/2, cellY + 15 - cellWidth/2, 50, 40, 5);
        header.fill = "#ff5b4d";
        header.noStroke();
        header.id = 'header' + id;
        var headerText = two.makeText('TW', cellX + 15 - cellWidth/2, cellY + 15 - cellWidth/2, headerFont);
        headerText.id = 'headerText' + id;
      } else {
        cell.fill = '#f3f3f3';
      }
      cell.noStroke();
      cell.opactiy = 1.0;
      cellX += (cellWidth + padding);
    }
    cellX = x + cellWidth/2;
    cellY += cellWidth + padding;
  }

  two.update();
}

/**************************************************************************
 * 
 * 
 * Mouse event listeners
 * 
 * 
 **************************************************************************/
this.document.addEventListener('mousedown', function (event) {
  GameState.mouseDown = true;
  var cellPositionClicked = getPositionOfTarget(event.target.id);
  if (cellPositionClicked.x != undefined) {
    var cellClicked = document.getElementById('cell-' + cellPositionClicked.x + '-' + cellPositionClicked.y);
    cellClicked.setAttribute('fill', "#ffdd48");
    GameState.wordSoFar.push(cellPositionClicked);
    setPreviewWord();
  }
});

this.document.addEventListener('mouseup', function (event) {
  GameState.mouseDown = false;
  var [word, points] = checkIfWord(GameState.wordSoFar);
  if (points > 0) {
    // set cells to green temporarily
    highlightCorrectWord();
    greenPreviewWord(points);
    var score = document.getElementById('score');
    GameState.wordsSoFar.set(word, points);
    const finalScore = parseInt(score.innerHTML) + points;
    let start = score.innerHTML === '' ? 0 : parseInt(score.innerHTML);
    const step = function() {
      score.innerHTML = start++;
      if (score.innerHTML != finalScore) {
        setTimeout(step, 10);
      }
    }
    step();
  } else {
    redPreviewWord();
    resetCellColors(GameState.wordSoFar);
  }
  GameState.wordSoFar = [];
})

this.document.addEventListener('mousemove', function (event) {
  if (GameState.mouseDown) {
    if (event.target.id) {
      var cellPath = getPositionOfTarget(event.target.id);
      if (cellPath.x != undefined && getIndexOfCell(cellPath) === -1) {
        // add to word so far
        GameState.wordSoFar.push(cellPath);
        var cellClicked = document.getElementById('cell-' + cellPath.x + '-' + cellPath.y);
        cellClicked.setAttribute('fill', "#ffdd48");
        setPreviewWord();
      }
    }
  }
})