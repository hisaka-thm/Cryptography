var matrixContainer = document.getElementById('matrixContainer');
var inverseMatrixContainer = document.getElementById('inverseMatrixContainer');
var encodedOutput = document.getElementById('encodedOutput').querySelector('span');
var decodedOutput = document.getElementById('decodedOutput').querySelector('span');
var wordToEncodeInput = document.getElementById('wordToEncode');
var numbersToDecodeInput = document.getElementById('numbersToDecode');
var errorMessage = document.getElementById('errorMessage');
var encodeBtn = document.getElementById('encodeBtn');
var decodeBtn = document.getElementById('decodeBtn');

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
            augmented[i][j] /= pivot;
        }

        for (var k = 0; k < size; k++) {
            if (k !== i) {
                var factor = augmented[k][i];
                for (var j = 0; j < augmented[k].length; j++) {
                    augmented[k][j] -= factor * augmented[i][j];
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
    var result = [];
    for (let col = 0; col < matrix[0].length; col++) {
        let sum = 0;
        for (let row = 0; row < matrix.length; row++) {
            sum += matrix[row][col] * vector[row];
        }
        result.push(manualFixFloatingPoint(sum));
    }
    return result;
}

// float point precision
function manualFixFloatingPoint(value) {
    const multiplier = 1e10; 
    return Math.floor(value * multiplier + 0.5) / multiplier;
}

// convert letters to numbers
function letterToNumber(letter) {
    if (letter === ' ') return 0;
    return letter.toLowerCase().charCodeAt(0) - 96;
}

// convert numbers to letters
function numberToLetter(num) {
    return num === 0 ? ' ' : String.fromCharCode(num + 96); 
}

// encoding process
function encodeWord(matrix, word) {
    var letters = word.split('').map(letterToNumber);
    var paddedLetters = [...letters, ...Array(4 - (letters.length % 4 || 4)).fill(0)]; // fill missing numbers with 0 e.g [1 2  ] = [1 2 0 0]
    var encoded = [];
    for (var i = 0; i < paddedLetters.length; i += 4) {
        var chunk = paddedLetters.slice(i, i + 4);
        var encodedChunk = multiplyMatrix(matrix, chunk);
        encoded.push(encodedChunk);
    }
    return encoded.map(chunk => `[${chunk.join(', ')}]`).join(' ');
}

// decoding process
function decodeWord(matrix, encodedValues) {
    const inverseMatrix = invertMatrix(matrix);

    const decodedLetters = [];
    for (let i = 0; i < encodedValues.length; i += 4) {
        const chunk = encodedValues.slice(i, i + 4);
        const decodedChunk = multiplyMatrix(inverseMatrix, chunk);
        decodedLetters.push(...decodedChunk);
    }

    return decodedLetters.map(numberToLetter).join('').toUpperCase();
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
