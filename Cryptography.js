var matrixContainer = document.getElementById('matrixContainer');
var inverseMatrixContainer = document.getElementById('inverseMatrixContainer');
var encodedOutput = document.getElementById('encodedOutput').querySelector('span');
var decodedOutput = document.getElementById('decodedOutput').querySelector('span');
var wordToEncodeInput = document.getElementById('wordToEncode');
var numbersToDecodeInput = document.getElementById('numbersToDecode');
var errorMessage = document.getElementById('errorMessage');
var encodeBtn = document.getElementById('encodeBtn');
var decodeBtn = document.getElementById('decodeBtn');
var showInverseBtn = document.getElementById('showInverseBtn');

// matrix inputs
(function createMatrixInputs() {
    for (var i = 0; i < 16; i++) {
        var input = document.createElement('input');
        input.type = 'number';
        input.required = true;
        matrixContainer.appendChild(input);
    }
})();

// get matrix from inputs
function getMatrix() {
    var inputs = matrixContainer.querySelectorAll('input');
    var matrix = [];
    for (var i = 0; i < 4; i++) {
        var row = [];
        for (var j = 0; j < 4; j++) {
            var value = parseFloat(inputs[i * 4 + j].value);
            if (isNaN(value)) throw new Error('Matrix must be completely filled.');
            row.push(value);
        }
        matrix.push(row);
    }
    return matrix;
}

// matrix inversion
function invertMatrix(matrix) {
    var size = 4;
    var augmented = matrix.map((row, i) =>
        [...row, ...Array(size).fill(0).map((_, j) => (i === j ? 1 : 0))] // identity matrixc
    );

    for (var i = 0; i < size; i++) {
        var pivot = augmented[i][i];
        if (pivot === 0) throw new Error('Matrix is not invertible.');
        for (var j = 0; j < augmented[i].length; j++) {
            augmented[i][j] /= pivot; // finds the pivot element for each row, if the pivot element is 0, it indicates that the matrix is not invertible
        } // if the pivot element isn't 0, the function normalize the entire row by dividing the elements in the row by the pivot element, ensuring that the pivot becomes 1

        for (var k = 0; k < size; k++) {
            if (k !== i) { 
                var factor = augmented[k][i]; // for each row 'k', it computes a factor, which is the element in the same column as the pivot.
                for (var j = 0; j < augmented[k].length; j++) { 
                    augmented[k][j] -= factor * augmented[i][j]; // subtracts a multiple of pivot row from row 'k' to eliminate the element in the current column making it 0
                } 
            }
        }
    }

    return augmented.map(row => row.slice(size));
}

// display inverse matrix
function displayInverseMatrix(matrix) {
    inverseMatrixContainer.innerHTML = '';
    if (!matrix) {
        inverseMatrixContainer.textContent = 'Matrix is not invertible.';
        return;
    }
    matrix.forEach(row => {
        row.forEach(value => {
            var cell = document.createElement('div');
            cell.textContent = value.toFixed(2);
            inverseMatrixContainer.appendChild(cell);
        });
    });
}

// matrix multiplication
function multiplyMatrix(matrix, vector) {
    var result = []; // this is the array where the program stores the results after performing the matrix multiplication
    for (let col = 0; col < matrix[0].length; col++) {
        let sum = 0;
        for (let row = 0; row < matrix.length; row++) { 
            sum += matrix[row][col] * vector[row]; // this calculates the dot product of the col-th column of the matrix and the vector. Adds the results of each row in current column
        }
        result.push(manualFixFloatingPoint(sum));
    }
    return result;
}

// float point precision
function manualFixFloatingPoint(value) {
    const multiplier = 1e10; 
    return Math.floor(value * multiplier + 0.5) / multiplier; // rounds of the result to a manageable decimal point to handle potential floating-point precision issues
}

// convert letters to numbers
function letterToNumber(letter) {
    return letter.charCodeAt(0); //different from sir's example. His uses (A-Z) 1-26, this uses (ASCII) 0-255
}

// convert numbers to letters
function numberToLetter(num) {
    return String.fromCharCode(num % 256);  
}

// encoding process
function encodeWord(matrix, word) {
    var letters = word.split('').map(letterToNumber); // splits the word to individual characters
    var paddedLetters = [...letters, ...Array(4 - (letters.length % 4 || 4)).fill(0)]; // fill missing numbers with 0 e.g [1 2  ] = [1 2 0 0]
    var encoded = []; // this is the array where the program stores the encoded values
    for (var i = 0; i < paddedLetters.length; i += 4) { //processes 4 numbers at a time
        var chunk = paddedLetters.slice(i, i + 4); // for each loop a chunk of 4 numbers is taken from encodedValues
        var encodedChunk = multiplyMatrix(matrix, chunk); // the chunks gets passed to the multiplyMatrix function which multiplies the chunk by the given matrix
        encoded.push(encodedChunk); // pushes the result to the variable "decodedLetters"
    }
    return encoded.map(chunk => `[${chunk.join(', ')}]`).join(' '); // return the chunks of numbers as a string/whole
}

// decoding process
function decodeWord(matrix, encodedValues) {
    const inverseMatrix = invertMatrix(matrix); //calculates the inverse of the matrix and stores it in variable "inverseMatrix"

    const decodedLetters = []; // this is the array where the program stores the decoded letters
    for (let i = 0; i < encodedValues.length; i += 4) { //processes 4 numbers at a time
        const chunk = encodedValues.slice(i, i + 4); // for each loop a chunk of 4 numbers is taken from encodedValues
        const decodedChunk = multiplyMatrix(inverseMatrix, chunk); // the chunks gets passed to the multiplyMatrix function which multiplies the chunk by the inverse matrix
        decodedLetters.push(...decodedChunk); // pushes the result to the variable "decodedLetters"
    }

    return decodedLetters.map(numberToLetter).filter(letter => letter !== '\0').join(''); // converts the result(numbers) to letters
}

// handle encoding
encodeBtn.addEventListener('click', function () {
    try {
        errorMessage.textContent = '';
        var matrix = getMatrix();
        var word = wordToEncodeInput.value.trim();

        if (!word) throw new Error('Please enter a word.');

        var encoded = encodeWord(matrix, word);
        encodedOutput.textContent = encoded;
    } catch (error) {
        errorMessage.textContent = error.message;
    }
});

// handle decoding
decodeBtn.addEventListener('click', function () {
    try {
        errorMessage.textContent = '';
        var matrix = getMatrix();
        var numbers = numbersToDecodeInput.value.split(',').map(Number);
        if (numbers.some(isNaN)) throw new Error('Enter valid numbers.');

        var decoded = decodeWord(matrix, numbers);
        decodedOutput.textContent = decoded;
    } catch (error) {
        errorMessage.textContent = error.message;
    }
});

showInverseBtn.addEventListener('click', function () {
    try {
        errorMessage.textContent = '';
        inverseMatrixContainer.innerHTML = '';
        var matrix = getMatrix();
        var inverseMatrix = invertMatrix(matrix);

        displayInverseMatrix(inverseMatrix);
    } catch (error) {
        errorMessage.textContent = error.message;
        inverseMatrixContainer.innerHTML = '';
    }
});
