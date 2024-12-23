
const MAX_FILAS = 6;
const MAX_COLUMNAS = 5;
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; 
const borrado = "⌫";
const intro = "Enter"
const bankOfWords = [ 
    "apple", "table", "grape", "chair", "plane",
    "water", "light", "night", "music", "stone",
    "cloud", "green", "brick", "swirl", "watch",
    "liver", "shoes", "vowel", "brush", "drink",
    "piano", "lemon", "bingo", "flame", "scale",
    "pearl", "jolly", "vivid", "sight", "clash",
    "breeze", "flint", "frame", "skate", "reach",
    "straw", "tease", "grape", "actor", "march",
    "blaze", "lucky", "thick", "roast", "creek"
];
const secondsToDisplayDialog = 3;

let word = "";
let enterKeyPressed = false;
let currentfilasIndex = 0;
let currentColumnasIndex = 0;
let lastElementInserted = 0;
let gameWon;
let gameLost;
let lettersTypedCorrectly = []
let lettersTypedWrong = []
let lettersTypedWrongPosition = []

function makeBoard(){
    let tablero = "<table id='board'>"
    for(let i=0; i<MAX_FILAS; i++){
        tablero += "<tr class='row'>"
        for(let j=0; j<MAX_COLUMNAS; j++){
            tablero += "<td class='tile'></td>"
        }
        tablero += "</tr>"
    }
    tablero += "</table>"
    document.getElementsByClassName('game-board')[0].innerHTML = tablero
}

function wordOfTheDay(){
    const maxRandom = bankOfWords.length-1
    word = bankOfWords[Math.floor(Math.random() * maxRandom)].toUpperCase();
    word = 'chart'.toUpperCase()
}

function initializeArrays(){
    lettersTypedCorrectly = []
    lettersTypedWrong = []
    lettersTypedWrongPosition = []
}

window.onload = function(){ 
    gameWon = false;
    gameLost = false;
    initializeArrays();
    makeBoard();
    wordOfTheDay();
    console.log("word: ", word)
    document.querySelectorAll(".key").forEach((key) => key.addEventListener("click", (event) => writeOnBoard(event)))
    document.getElementById('remove').addEventListener("click", () => removeOnBoard());
    document.getElementById('enter').addEventListener("click", () =>{
        checkIfExistWord()
    });
}

function getKeyFromKeyboard(letter, lettersTyped){
    const keys = document.querySelectorAll('.key')
    if(keys){
        keys.forEach((value, key ) =>{
            if(value.innerText === letter){
                lettersTyped.push(value)
            }
        })
    }
}

function remarKeyOnKeyboard(keysToRemark, className){
    if(keysToRemark){
        keysToRemark.forEach(keyOnKeyboard =>{
            if(!keyOnKeyboard.classList.contains(className)){
                keyOnKeyboard.classList.add(className)
            }
        })
    }
}

function checkLineIsComplete(){
    let cellFilled = 0
    const row = getTiles(currentfilasIndex)
    row.forEach((value, key) =>{
        if(value && value.innerText !== ""){
            cellFilled++
        }
    })
    return (cellFilled === MAX_COLUMNAS);
}

function getWordTyped(){
    let currentWordTyped = "";
    let valuesInnerText = Object.values(getTiles(currentfilasIndex)).map(values => values.innerText)
    valuesInnerText.forEach(value => currentWordTyped += value) 
    return currentWordTyped;
}

function remarkTile(tile, className){
    tile.classList.add(className)
}

function checkGameStatus(){
    let correctLetter = 0;
    const currentWordTyped = getWordTyped()
    
    for(let i=0; i<currentWordTyped.length; i++){
        const letter = currentWordTyped.charAt(i)
        const firstAppearance = word.indexOf(letter)
        const lastAppearance = word.indexOf(letter)
        const isCorrectLetter = word.includes(letter) && word.charAt(i) === letter   
        if(isCorrectLetter){
            remarkTile(getTile(currentfilasIndex, i), 'correct-letter')
            getKeyFromKeyboard(letter, lettersTypedCorrectly)
            remarKeyOnKeyboard(lettersTypedCorrectly,'correct-letter')
            correctLetter++;
        }else{
            if(i === firstAppearance || i === lastAppearance){
                remarkTile(getTile(currentfilasIndex, i), 'wrong-position')
                getKeyFromKeyboard(letter, lettersTypedWrongPosition)
                remarKeyOnKeyboard(lettersTypedWrongPosition,'wrong-position')                    
            }else{
                remarkTile(getTile(currentfilasIndex, i), 'wrong-letter')
                if(!lettersTypedWrongPosition.map(value => value.innerHTML).includes(letter) && !lettersTypedCorrectly.map(value => value.innerHTML).includes(letter)){
                    getKeyFromKeyboard(letter, lettersTypedWrong)
                    remarKeyOnKeyboard(lettersTypedWrong,'wrong-letter')
                }
            }
        }
    }

    if(correctLetter === word.length){
        gameWon = true
    }else if(correctLetter < word.length && currentfilasIndex === MAX_FILAS-1){
        gameLost = true;
    }
}

async function checkIfExistWord(){
    const tiles = getTiles(currentfilasIndex)
    let wordToCheck = "";
    tiles.forEach((value, key) =>{
        wordToCheck += value.innerText
    })
    const apiUrl = `https:api.dictionaryapi.dev/api/v2/entries/en/${wordToCheck}`
    await fetch(apiUrl)
        .then(response =>{
            if(!response.ok){
                const dialogMispelledWord = document.getElementById('dialog-mispelled-word')
                dialogMispelledWord.showModal();
                setTimeout(() => {
                    dialogMispelledWord.close();
                }, secondsToDisplayDialog * 1000);
                currentfilasIndex = currentfilasIndex;
                currentColumnasIndex = currentColumnasIndex;
            }else{
                nextLine()
            }
        }).catch(error =>{
            console.log("Error: ", error)
        })
}

function nextLine(){
    if(currentColumnasIndex === MAX_COLUMNAS && currentfilasIndex < MAX_FILAS && checkLineIsComplete()){
        checkGameStatus()
        if(!gameWon && !gameLost){
            currentfilasIndex++;
            currentColumnasIndex = 0
            enterKeyPressed = false;
            initializeArrays();
        }else if(gameWon){
            const dialogYouWon = document.getElementById('dialog-you-won')
            dialogYouWon.showModal()
            document.getElementById('play-again-btn').addEventListener('click', () => {
                dialogYouWon.close();
                window.location.reload()
            });
        }else{
            const dialogYouLost = document.getElementById('dialog-you-lost');
            dialogYouLost.showModal()
            document.getElementById('retry-btn').addEventListener('click', () => {
                dialogYouLost.close();
                window.location.reload()
            });
        }  
    }
}

function writeOnBoard(element){
    const keyValue = element.target.innerText;
    const tile = getTile(currentfilasIndex, currentColumnasIndex)
    if(tile && tile.innerText === "" && letters.includes(keyValue)){ 
        tile.innerText = keyValue;
        currentColumnasIndex++;
        lastElementInserted = currentColumnasIndex-1;
    }
}

function removeOnBoard(){
    const tile = getTile(currentfilasIndex, lastElementInserted)
    if(tile && tile.innerText){
        tile.innerText = ""
        currentColumnasIndex = currentColumnasIndex > 0 ? currentColumnasIndex - 1 : 0;
        lastElementInserted = lastElementInserted > 0 ? lastElementInserted - 1 : 0;
    }
}

function getTiles(rowIndex){
    const rows = document.querySelectorAll(".row");
    if(rows){
        const row = rows[rowIndex];
        if(row){
            return row.querySelectorAll(".tile");
        }
    }
    return null;
}

function getTile(rowIndex, columnIndex){
    const tiles = getTiles(rowIndex);
    if(tiles){
        return tiles[columnIndex]   
    }
    return null;
}
