var WALL = 'WALL';
var FLOOR = 'FLOOR';
var BALL = 'BALL';
var GAMER = 'GAMER';
var GLUE = 'GLUE'

var GAMER_IMG = '<img src="img/gamer.png" />';
var BALL_IMG = '<img src="img/ball.png" />';
var GLUE_IMG = '<img src ="img/candy.png" />';

var gBoard;
var gGamerPos;
var gEmptyPos;
var gCollectedBalls
var gBallsCount
var gIsGlued = false

var gElModal = document.querySelector('.modal')
var gElHedar2 = document.querySelector('h2 span')

function initGame() {
    gElModal.style.display = 'none'
    gCollectedBalls = 0
    gElHedar2.innerText = gCollectedBalls
    gBallsCount = 2
    gGamerPos = { i: 3, j: 9 };
    gBoard = buildBoard();
    gEmptyPos = getEmptyPos()
    renderBoard(gBoard);
    setTimeout(addBalls, 3000)
    setTimeout(addGlue, 5000)
}

function stopGlued() {
    gIsGlued = false
}

function removeGlue(pos) {
    if (gBoard[pos.i][pos.j] === GAMER) return
    gBoard[pos.i][pos.j].gameElement = null
    renderCell(pos, '')
}

function addGlue() {
    var idx = getRandomInt(0, gEmptyPos.length)
    var emptyPos = gEmptyPos[idx]
    if (!emptyPos) return
        // Model
    gBoard[emptyPos.i][emptyPos.j].gameElement = GLUE
    gEmptyPos.splice(idx, 1)
        // Dom
    renderCell(emptyPos, GLUE_IMG)
    setTimeout(removeGlue, 3000, emptyPos)
}

function addBalls() {
    var idx = getRandomInt(0, gEmptyPos.length)
    var emptyPos = gEmptyPos[idx]
    if (!emptyPos) return
        // Model
    gBoard[emptyPos.i][emptyPos.j].gameElement = BALL
    gEmptyPos.splice(idx, 1)
    gBallsCount++
    console.log(gBallsCount)
        // Dom
    renderCell(emptyPos, BALL_IMG)
}

function getEmptyPos() {
    var emptyCells = []
    for (var i = 1; i < gBoard.length - 1; i++) {
        for (var j = 1; j < gBoard[0].length - 1; j++) {
            if (gBoard[i][j].gameElement === null && gBoard[i][j].type === 'FLOOR') {
                emptyCells.push({ i, j })
            }
        }
    }
    return emptyCells
}


function buildBoard() {
    // Create the Matrix
    var board = createMat(10, 12)


    // Put FLOOR everywhere and WALL at edges
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            // Put FLOOR in a regular cell
            var cell = { type: FLOOR, gameElement: null };

            // Place Walls at edges
            if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
                cell.type = WALL;
            }

            // Add created cell to The game board
            board[i][j] = cell;
        }
    }


    // Ading Passages

    board[0][Math.floor(board[0].length / 2)].type = FLOOR;
    board[Math.floor(board.length / 2)][board[0].length - 1].type = FLOOR;
    board[board.length - 1][Math.floor(board[0].length / 2)].type = FLOOR;
    board[Math.floor(board.length / 2)][0].type = FLOOR;
    // Place the gamer at selected position
    board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

    // Place the Balls (currently randomly chosen positions)
    board[3][8].gameElement = BALL;
    board[7][4].gameElement = BALL;

    return board;
}

// Render the board to an HTML table
function renderBoard(board) {

    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];

            var cellClass = getClassName({ i: i, j: j })

            // TODO - change to short if statement
            // if (currCell.type === FLOOR) cellClass += ' floor';
            // else if (currCell.type === WALL) cellClass += ' wall';
            cellClass += (currCell.type === FLOOR) ? ' floor' : ' wall';

            //TODO - Change To template string
            strHTML += '\t<td class="cell ' + cellClass +
                '"  onclick="moveTo(' + i + ',' + j + ')" >\n';

            // TODO - change to switch case statement
            if (currCell.gameElement === GAMER) {
                strHTML += GAMER_IMG;
            } else if (currCell.gameElement === BALL) {
                strHTML += BALL_IMG;
            } else if (currCell.gameElement === GLUE) {
                strHTML += GLUE_IMG
            }

            strHTML += '\t</td>\n';
        }
        strHTML += '</tr>\n';
    }

    // console.log('strHTML is:');
    // console.log(strHTML);
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

// Move the player to a specific location
function moveTo(i, j) {
    if (gIsGlued) return

    var targetCell = gBoard[i][j];
    if (targetCell.type === WALL) return;

    // Calculate distance to make sure we are moving to a neighbor cell
    var iAbsDiff = Math.abs(i - gGamerPos.i);
    var jAbsDiff = Math.abs(j - gGamerPos.j);

    // If the clicked Cell is one of the five allowed or
    if ((iAbsDiff === 1 && jAbsDiff === 0) ||
        (jAbsDiff === 1 && iAbsDiff === 0 ||
            iAbsDiff === 9 || jAbsDiff === 11)) {
        var sound = new Audio('sound/collect.mp3')

        if (targetCell.gameElement === BALL) {
            sound.play()
            gCollectedBalls++
            gElHedar2.innerText = gCollectedBalls
            gBallsCount--

            if (gBallsCount === 0) {
                gElModal.style.display = 'block'
            }
        } else if (targetCell.gameElement === GLUE) {
            gIsGlued = true
            setTimeout(stopGlued, 3000)
        }


        // MOVING from current position
        // Model:
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
        // Dom:
        renderCell(gGamerPos, '');

        // MOVING to selected position
        // Model:
        gGamerPos.i = i;
        gGamerPos.j = j;
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
        // DOM:
        renderCell(gGamerPos, GAMER_IMG);

    } // else console.log('TOO FAR', iAbsDiff, jAbsDiff);

}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
    var cellSelector = '.' + getClassName(location)
    var elCell = document.querySelector(cellSelector);
    elCell.innerHTML = value;
}

// Move the player by keyboard arrows
function handleKey(event) {

    var i = gGamerPos.i;
    var j = gGamerPos.j;

    console.log(gGamerPos)

    switch (event.key) {
        case 'ArrowLeft':
            if (j === 0) moveTo(i, gBoard[0].length - 1)
            else moveTo(i, j - 1);
            break;
        case 'ArrowRight':
            if (j === gBoard[0].length - 1) moveTo(i, 0)
            else moveTo(i, j + 1);
            break;
        case 'ArrowUp':
            if (i === 0) moveTo(gBoard.length - 1, j)
            else moveTo(i - 1, j);
            break;
        case 'ArrowDown':
            if (i === gBoard.length - 1) moveTo(0, j)
            else moveTo(i + 1, j);
            break;

    }

}

// Returns the class name for a specific cell
function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j;
    return cellClass;
}