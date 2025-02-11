const board = document.getElementById('board');
const queueDiv = document.getElementById('queue');
const scoreDiv = document.getElementById('score');
let score = 0;
let boardArray = Array(8).fill(null).map(() => Array(8).fill(0));

class ShapeQueue {
    constructor(maxSize) {
      this.items = [];
      this.maxSize = maxSize;
    }

    enqueue(element) {
      if (this.items.length >= this.maxSize) {
        return false;
      }
      this.items.push(element);
    }

    dequeue() {
      if (this.isEmpty()) return false;
      return this.items.shift();
    }

    isEmpty() {
      return this.items.length === 0;
    }

    clear() {
      this.items = [];
    }
  }
  
  class BoardStack {
    constructor(maxSize) {
      this.items = [];
      this.maxSize = maxSize;
    }
  
    push(element) {
      if (this.items.length === this.maxSize) {
        return false
      }
      this.items.push(element);
      return true
    }
  
    pop() {
        if (this.isEmpty()){
          return false;
        }
        this.items.splice(this.items.length-1);
        return true
    }

    isEmpty() {
      return this.items.length === 0;
    }

    clear() {
        this.items = [];
      }
  }

  const rowStacks = [
    new BoardStack(7),
    new BoardStack(7),
    new BoardStack(7),
    new BoardStack(7),
    new BoardStack(7),
    new BoardStack(7),
    new BoardStack(7),
    new BoardStack(7),
    new BoardStack(7),
  ];

  const colStacks = [
    new BoardStack(7),
    new BoardStack(7),
    new BoardStack(7),
    new BoardStack(7),
    new BoardStack(7),
    new BoardStack(7),
    new BoardStack(7),
    new BoardStack(7),
    new BoardStack(7),
  ];
  
  const shapequeue = new ShapeQueue();
  let currentShape;
  
  const shapes = [
      [[1, 1], [1, 1]],
      [[1, 1, 1], [0, 1, 0]],
      [[1,0],[1,0],[1,1]],
      [[1], [1], [1], [1]],
      [[1, 1, 1, 1]] 
    ];
    

function createBoard() {
    board.innerHTML = '';
    for (let i = 0; i < 64; i++) {
        const box = document.createElement('div');
        box.classList.add('box');
        box.addEventListener('mouseenter', () => highlight(box));
        box.addEventListener('mouseleave', () => unhighlight());
        box.addEventListener('click', () => placeShape(box));
        board.appendChild(box);
    }
}

function highlight(box) {
    const index = Array.from(board.children).indexOf(box);
    const x = index % 8;
    const y = Math.floor(index / 8);

    if (currentShape) {
        const shapeIndices = getShapeIndices(currentShape, x, y).filter(([y, x]) => y >= 0 && y < 8 && x >= 0 && x < 8);
        shapeIndices.forEach(([i, j]) => {
            const shapeBox = board.children[i * 8 + j];
            if (shapeBox && boardArray[i][j] === 0) { 
                shapeBox.classList.add('highlight');
            }
        });
    }
}

function unhighlight() {
    Array.from(board.children).forEach(box => {
        box.classList.remove('highlight');
    });
}

function getShapeIndices(shape, startX, startY) {
    const indices = [];
    shape.forEach((row, r) => {
        row.forEach((value, c) => {
            if (value) {
                indices.push([startY + r, startX + c]);
            }
        });
    });
    return indices;
}

function placeShape(box) {
    const index = Array.from(board.children).indexOf(box);
    const x = index % 8;
    const y = Math.floor(index / 8);

    const shapeIndices = getShapeIndices(currentShape, x, y);

    if (shapeIndices.every(([i, j]) => boardArray[i][j] === 0 && j >= 0 && j < 8 && i >= 0 && i < 8)) {
        shapeIndices.forEach(([i, j]) => {
            boardArray[i][j] = 1;
            const shapeBox = board.children[i * 8 + j];
            shapeBox.classList.add('filled');
            pushStack(i,j);
        });
        updateQueue();
    }
}

function pushStack(x,y){
    let cflag = false;
    let rflag = false;
    if(!rowStacks[x].push(1)){
        console.log('bonjour')
        rflag = true;
        score += 10;
    }

    if(!colStacks[y].push(1)){
        console.log('hey')
        cflag = true;
        score += 10;
    }

    if(rflag == true){
        console.log('hu')
        colStacks.forEach((stack, index)=> stack.pop());
        rowStacks[x].clear();
            boardArray[x] = Array(8).fill(0);  
            updateBoardVisual();
    }

    if(cflag == true){
            console.log('hi');
            rowStacks.forEach((stack, index)=> stack.pop());
        colStacks[y].clear();
        for (let i = 0; i < 8; i++) {
            boardArray[i][y] = 0;
        }
        updateBoardVisual();
    }
    console.log(rowStacks[0]);
    scoreDiv.textContent = 'Score: ' + score;
}

function updateBoardVisual() {
    for (let i = 0; i < 64; i++) {
        const box = board.children[i];
        const x = i % 8;
        const y = Math.floor(i / 8);
        if (boardArray[y][x] === 1) {
            box.classList.add('filled');
        } else {
            box.classList.remove('filled');
        }
    }
}

let shapeQueue = [];

function generateQueue() {
    shapequeue.clear();
    for (let i = 0; i < 3; i++) {
        shapequeue.enqueue(generateNewShape());
    }
    updateQueue();
}

function generateNewShape() {
    const randIndex = Math.floor(Math.random() * shapes.length);
    return shapes[randIndex];
}

function updateQueue(){
    renderQueue();
    currentShape = shapequeue.dequeue();
    shapequeue.enqueue(generateNewShape());
}

function renderQueue() {
    queueDiv.innerHTML = '';
    shapequeue.items.forEach((shape) => {
        const shapeDiv = document.createElement('div');
        shapeDiv.className = 'shape';

        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                const square = document.createElement('div');
                square.style.backgroundColor = shape[r] && shape[r][c] ? 'red' : 'transparent';
                shapeDiv.appendChild(square);
            }
        }

        queueDiv.appendChild(shapeDiv);
    });
}

document.getElementById('start').addEventListener('click', () => {
    generateQueue();
});

document.getElementById('reset').addEventListener('click', () => {
    score = 0;
    scoreDiv.textContent = 'Score: 0';
    createBoard();
    generateQueue();
});

createBoard();