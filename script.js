const nonExistingColor = '#4c4c4c';
const nonExistingKeyColor = '#1c1c1c';
const existingColor = '#b59f3b';
const correctColor = '#538d4e';
const invalidColor = '#ff1a1a';

const validWords = dict_wordle_guesses;
const mysteryWords = dict_wordle_answers;

const mysteryWord = mysteryWords[Math.floor(Math.random() * mysteryWords.length)];
//console.log(mysteryWord);
const mysteryLetters = mysteryWord.split("");

let currentBox = '[TabIndex="1"]';
let minIndex = 1;

let currentWord = "";
let isCompletedWord = false;

let submittedWord = "";
let score = 0;

const allTrueBoxes = [true, true, true, true, true];

$(document).ready(function() {
    //display help screen
    displayTutorial(); 
    //focus and stay focused on the first box (prevents clicking/tabbing from unfocusing on first box)
    $('[TabIndex="1"]').focus();
    $('[TabIndex="1"]').blur(function() {
        setTimeout(function() { $('[TabIndex="1"]').focus(); }, 100);
    });

    $(currentBox).keydown(function (event) {
        let currentLetter = event.key;
        //when ? key is pressed
        if (event.keyCode == 191) displayTutorial(); 
        //when backspace key is pressed
        if (event.keyCode == 8) deleteLetter();
        //when enter key is pressed
        if (event.keyCode == 13) submitWord();
        //when valid letter key is pressed
        if (isLetter(currentLetter)) insertLetter(currentLetter.toLowerCase());
    });

    //when onscreen key is pressed
    $('.key').click(function() {
        insertLetter($(this).html().toLowerCase());
    });
    //when onscreen delete key is pressed
    $('.delete-key').click(function() {
        deleteLetter();
    });
    //when onscreen submit key is pressed
    $('.submit-key').click(function() {
        submitWord();
    });
    $('.tutorial-key').click(function() {
        displayTutorial();
    });
});

//inserts the current letter into the current box
function insertLetter(currentLetter) {
    if (!isCompletedWord) {
        //press down corresponding key on onscreen keyboard
        //let currentKey = '.' + currentLetter;
        //$('.q').addClass('active');
        //css('background-color', nonExistingColor);
        //insert letter into box
        $(currentBox).html(currentLetter.toUpperCase());
        //update current word to reflect the new letter added
        currentWord += currentLetter;
        //set the word as 'completed' if the fifth box is filled
        if (currentBox.match(/\d+/) % 5 == 0) isCompletedWord = true;
        //shift to next box
        currentBox = nextBox();
    }
}

//deletes the current letter and goes back to the previous box
function deleteLetter() {
    //go to previous box
    currentBox = previousBox();
    //delete the letter in the current box
    $(currentBox).empty();
    //update current word to reflect the deleted letter
    currentWord = currentWord.slice(0, -1);
    //ensure that the current word can still be modified
    isCompletedWord = false;
}

//checks the word and goes to the next line
function submitWord() {
    if (isCompletedWord) {
        if (!isValidWord(currentWord)) displayAsInvalid();
        else {
            //save the completed word
            submittedWord = currentWord;
            let submittedLetters = submittedWord.split("");
            //clear the current word
            currentWord = "";
            //color boxes based on if letter exists in word or if letter is in correct position in word
            colorBoxes(allTrueBoxes, nonExistingColor);
            colorBoxes(correctBoxes(submittedLetters), correctColor);
            colorBoxes(existingBoxes(submittedLetters), existingColor);
            //color keys based on if letter exists in word or if letter is in correct position in word
            colorKeys(submittedLetters, allTrueBoxes, nonExistingKeyColor);
            colorKeys(submittedLetters, existingBoxes(submittedLetters), existingColor);
            colorKeys(submittedLetters, correctBoxes(submittedLetters), correctColor);
            //increase the mininum reachable tab index (moves user to next line + prevents the previous word from being modified)
            minIndex += 5;
            //new word begins, so reset the check if the word is completed
            isCompletedWord = false;
            //increase the score
            score++;
            //if the word is correct, end the game
            if (isCorrectWord(submittedLetters)) endGame();
            //if six failed tries have elapsed, lose the game
            if (score == 6 && !isCorrectWord(submittedLetters)) loseGame();
        }
    }
}

//returns true only if the key pressed is a letter key on the keyboard
function isLetter(letter) {
    return letter.length == 1 && letter.match(/[a-z]/i);
}

//returns true only if the current word is an element of the list of valid words
function isValidWord(word) {
    return validWords.includes(word);
}

//returns true only if each letter in the submitted word matches that of the mystery word
function isCorrectWord(submittedLetters) {
    return correctBoxes(submittedLetters).every((letter, index) => letter === allTrueBoxes[index]);
}

//changes the current id tag to the id tag of the next letter in the word
function nextBox() {
    let index = currentBox.match(/\d+/);
    index++;
    return currentBox.replace(/\d+/, index);
}

//changes the current id tag to the id tag of the next letter in the word
function previousBox() {
    let index = currentBox.match(/\d+/);
    index--;
    if (index < minIndex) index = minIndex;
    return currentBox.replace(/\d+/, index);
}

//returns an array of all the letters that are located in the exact same indices as the letters in the mystery word
function correctLetters(submittedLetters) {
    let correct = [];
    submittedLetters.forEach((letter, i) => {
        if (letter === mysteryLetters[i]) correct.push(letter);
    });
    return correct;
}

//returns an array whose indices are true only if the respective submitted letters are located in the exact same indices as the letters in the mystery word
function correctBoxes(submittedLetters) {
    let correct = [];
    submittedLetters.forEach((letter, i) => {
        correct.push(letter === mysteryLetters[i]);
    });
    return correct;
}

//returns an array of all the letters that exist anywhere within the mystery word
function existingLetters(submittedLetters) {
    let existing = [];
    let correct = correctLetters(submittedLetters);
    submittedLetters.forEach(letter => {
        if (mysteryLetters.includes(letter)) existing.push(letter);
    });
    existing = existing.filter(function(i) {
        return correct.indexOf(i) == -1;
      });
    return existing;
}

//returns an array whose indices are true only if the respective submitted letters exist anywhere within the mystery word
function existingBoxes(submittedLetters) {
    let existing = [];
    let correct = correctBoxes(submittedLetters);
    submittedLetters.forEach((letter, i) => {
        existing.push(mysteryLetters.includes(letter) && !correct[i]);
    });
    return existing;
}

//returns an array containing the tags for all the tab indices of the current word
function tabIndices() {
    let positions = [];
    for (let index = 0; index <= 4; index++) {
        let positionValue = minIndex + index;
        let currentPosition = '[TabIndex="' + positionValue + '"]'; 
        positions.push(currentPosition);
    }
    return positions;
}

//colors each letter box in the current word only if its respective index is true for the given array
function colorBoxes(boxesToColor, color) {
    tabIndices().forEach((str, i) => {
        if (boxesToColor[i]) $(str).css('background-color', color);
    });
}

//colors each key corresponding to a letter used in the current word only if its respective index is true for the given array
function colorKeys(submittedLetters, keysToColor, color) {
    submittedLetters.forEach((letter, index) => {
        let currentKey = '.' + letter;
        if (keysToColor[index]) $(currentKey).css('background-color', color);
    });
}

//colors each letter in the current word red to indicate this submitted word is invalid
function displayAsInvalid() {
    tabIndices().forEach((str) => {
        $(str).css('color', invalidColor);
    });
    setTimeout(() => {
        tabIndices().forEach((str) => {
            $(str).css('color', 'white');
        });
    }, 150);
}

//perform all functions necessary when the game is solved
function endGame() {
    buildEndHeader(endWord(score));
    $('#score').html("You guessed the word in " + score + " tries!");
    //prevent the user from inputting any more letters
    $('[TabIndex="2"]').focus();
    $('[TabIndex="2"]').blur(function() {
        setTimeout(function() {
            $('[TabIndex="2"]').focus(); 
            deleteLetter();
        }, 0);
    });
    $(document).click(function() {
        setTimeout(function() {
            $('[TabIndex="2"]').focus(); 
            deleteLetter();
        }, 0);
    });
    //display end screen
    displayEndScreen();
}

//returns the end word for the header based on how many tries it took for the player to guess the mystery word
function endWord(tries) {
    header = "";
    switch (tries) {
        case 1:
            header += "LUCKY"
            break;
        case 2:
            header += "CRAZY"
            break;
        case 3:
            header += "SUPER"
            break;
        case 4:
            header += "SWEET"
            break;
        case 5:
            header += "GREAT"
            break;
        case 6:
            header += "CLOSE"
            break;
        default:
            break;
    }
    return header;
}

//places each of the letters from the end word into the boxes of the header of the end screen modal
function buildEndHeader(endWord) {
    for (i = 0; i < 5; i++) {
        endLetter = '#endLetter' + i;
        $(endLetter).html(endWord.charAt(i));
    }
}

//perform all functions necessary when the game is not solved within six tries
function loseGame() {
    buildEndHeader("SORRY");
    $('#score').html("The correct word was: " + mysteryWord.toUpperCase());
    displayEndScreen();
}

//displays the end screen modal after a certain interval has passed
function displayEndScreen() {
    setTimeout(() => {
        $('#endScreen').modal('show');
    }, 300);
}

//displays the tutorial screen modal
function displayTutorial() {
    $('#tutorial').modal('show');
    $(window).keydown(function (event) {
        //when enter key is pressed
        if (event.keyCode == 13) $('#tutorial').modal('hide');
    });  
}