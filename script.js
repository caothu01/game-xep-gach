const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const grid = 30; // Kích thước của mỗi ô
let board = Array.from({ length: 20 }, () => Array(10).fill(0)); // Bảng trò chơi

const shapes = [
    [[1, 1, 1, 1]], // Hình chữ I
    [[1, 1], [1, 1]], // Hình vuông
    [[0, 1, 0], [1, 1, 1]], // Hình chữ T
    [[1, 1, 0], [0, 1, 1]], // Hình chữ Z
    [[0, 1, 1], [1, 1, 0]], // Hình chữ S
    [[1, 0, 0], [1, 1, 1]], // Hình chữ L
    [[0, 0, 1], [1, 1, 1]]  // Hình chữ J
];

const colors = [
    'pink',   // Màu cho hình chữ I
    'pink', // Màu cho hình vuông
    'pink', // Màu cho hình chữ T
    'pink',    // Màu cho hình chữ Z
    'pink',  // Màu cho hình chữ S
    'pink', // Màu cho hình chữ L
    'pink'    // Màu cho hình chữ J
];

let currentShape, nextShape, currentPosition;
let currentColor; // Biến màu cho gạch hiện tại
let dropInterval = 1000; // Thời gian giữa các lần rơi (mili giây)
let lastDropTime = 0; // Thời gian lần rơi trước
let score = 0; // Điểm số ban đầu

function createShape() {
    const randomIndex = Math.floor(Math.random() * shapes.length);
    currentShape = shapes[randomIndex];
    currentColor = colors[randomIndex]; // Gán màu cho gạch hiện tại
    nextShape = shapes[Math.floor(Math.random() * shapes.length)];
    currentPosition = { x: 4, y: 0 }; // Vị trí bắt đầu
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                ctx.fillStyle = 'blue';
                ctx.fillRect(x * grid, y * grid, grid, grid);
                ctx.strokeStyle = 'black';
                ctx.strokeRect(x * grid, y * grid, grid, grid);
            }
        });
    });
}

function drawShape() {
    currentShape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                ctx.fillStyle = currentColor; // Sử dụng màu hiện tại
                ctx.fillRect((currentPosition.x + x) * grid, (currentPosition.y + y) * grid, grid, grid);
                ctx.strokeStyle = 'black';
                ctx.strokeRect((currentPosition.x + x) * grid, (currentPosition.y + y) * grid, grid, grid);
            }
        });
    });
}

function isCollision(offsetX = 0, offsetY = 0, shape = currentShape) {
    return shape.some((row, y) => {
        return row.some((value, x) => {
            if (value) {
                const newX = currentPosition.x + x + offsetX;
                const newY = currentPosition.y + y + offsetY;
                return newX < 0 || newX >= 10 || newY >= 20 || (newY >= 0 && board[newY][newX]);
            }
            return false;
        });
    });
}

function moveShape(offsetX, offsetY) {
    if (!isCollision(offsetX, offsetY)) {
        currentPosition.x += offsetX;
        currentPosition.y += offsetY;
    } else if (offsetY) {
        currentShape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    board[currentPosition.y + y][currentPosition.x + x] = 1;
                }
            });
        });
        createShape(); // Tạo gạch mới
        if (isCollision(0, 0)) {
            alert("Game Over!"); // Thông báo khi trò chơi kết thúc
            document.location.reload(); // Tải lại trang
        }
    }
}

function rotateShape() {
    const rotatedShape = currentShape[0].map((_, index) =>
        currentShape.map(row => row[index]).reverse()
    );

    if (!isCollision(0, 0, rotatedShape)) {
        currentShape = rotatedShape;
    }
}

function removeFullRows() {
    let rowsRemoved = 0;
    board = board.filter(row => {
        if (row.every(value => value)) {
            rowsRemoved++;
            return false; // Xóa hàng đầy
        }
        return true;
    });
    while (board.length < 20) {
        board.unshift(Array(10).fill(0)); // Thêm hàng mới ở trên
    }
    score += rowsRemoved * 100; // Tăng điểm số
}

function drawScore() {
    const scoreElement = document.getElementById('score');
    scoreElement.innerText = `Điểm: ${score}`;
}

function drawNextShape() {
    const nextCanvas = document.createElement('canvas');
    nextCanvas.width = 100; // Kích thước ô hiển thị
    nextCanvas.height = 100; // Kích thước ô hiển thị
    const nextCtx = nextCanvas.getContext('2d');

    const shapeColor = colors[shapes.indexOf(nextShape)];
    const offsetX = Math.floor((nextCanvas.width / 20 - nextShape[0].length) / 2);
    const offsetY = Math.floor((nextCanvas.height / 20 - nextShape.length) / 2);

    nextShape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                nextCtx.fillStyle = shapeColor;
                nextCtx.fillRect((x + offsetX) * 20, (y + offsetY) * 20, 20, 20);
                nextCtx.strokeStyle = 'black';
                nextCtx.strokeRect((x + offsetX) * 20, (y + offsetY) * 20, 20, 20);
            }
        });
    });

    const nextElement = document.getElementById('next');
    nextElement.innerHTML = ''; // Xóa nội dung cũ
    nextElement.appendChild(nextCanvas); // Thêm canvas mới

    const shapeInfo = document.createElement('div');
    shapeInfo.innerText = `Gạch tiếp theo:`;
    nextElement.prepend(shapeInfo); // Thêm thông tin ở trên canvas
}

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowLeft':
            moveShape(-1, 0);
            break;
        case 'ArrowRight':
            moveShape(1, 0);
            break;
        case 'ArrowDown':
            moveShape(0, 1);
            break;
        case 'ArrowUp':
            rotateShape();
            break;
        case ' ':
            rotateShape();
            break;
    }
});

function update() {
    const now = Date.now();
    if (now - lastDropTime > dropInterval) {
        moveShape(0, 1); // Di chuyển gạch xuống mỗi khoảng thời gian
        lastDropTime = now;
    }
    drawBoard();
    drawShape();
    drawNextShape();
    removeFullRows();
    drawScore();
    requestAnimationFrame(update); // Tiếp tục vẽ
}

createShape();
update(); // Bắt đầu trò chơi
