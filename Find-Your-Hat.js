const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// สัญลักษณ์ในเกม
const hat = '^';
const hole = 'O';
const fieldChar = '·';
const pathChar = '*';

// รหัสสี ANSI สำหรับแต่งข้อความใน Terminal
const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
  green: '\x1b[32m'
};

class Field {
  constructor(field = [[]]) {
    this.field = field;
    this.x = 0;
    this.y = 0;
    this.steps = 0;

    // หาตำแหน่งเริ่มต้นของ Actor ที่สุ่มไว้ในแผนที่
    this.findActorPosition();
  }

  // หาพิกัดของ Actor (*) ใน field
  findActorPosition() {
    for (let y = 0; y < this.field.length; y++) {
      for (let x = 0; x < this.field[y].length; x++) {
        if (this.field[y][x] === pathChar) {
          this.x = x;
          this.y = y;
          return;
        }
      }
    }
    // ถ้าไม่มีให้เริ่มต้นที่มุมซ้ายบน
    this.x = 0;
    this.y = 0;
    this.field[0][0] = pathChar;
  }

  // เมธอดสำหรับการเคลื่อนที่ (Class Methods)
  moveUp() {
    this.y -= 1;
  }

  moveDown() {
    this.y += 1;
  }

  moveLeft() {
    this.x -= 1;
  }

  moveRight() {
    this.x += 1;
  }

  print() {
    console.clear();
    console.log(`${colors.cyan}${colors.bold}=== FIND YOUR HAT ===${colors.reset}`);
    console.log(`Position: (${this.x}, ${this.y}) | Steps: ${this.steps}`);
    console.log(`Controls: W (up), S (down), A (left), D (right), Q (quit)\n`);

    const width = this.field[0].length;
    console.log(`${colors.gray}+${'---'.repeat(width)}+${colors.reset}`);

    for (let row of this.field) {
      let line = `${colors.gray}|${colors.reset}`;
      for (let cell of row) {
        if (cell === pathChar) {
          line += `${colors.cyan}${colors.bold} * ${colors.reset}`;
        } else if (cell === hat) {
          line += `${colors.yellow}${colors.bold} ^ ${colors.reset}`;
        } else if (cell === hole) {
          line += `${colors.red} O ${colors.reset}`;
        } else {
          line += `${colors.gray} · ${colors.reset}`;
        }
      }
      line += `${colors.gray}|${colors.reset}`;
      console.log(line);
    }

    console.log(`${colors.gray}+${'---'.repeat(width)}+${colors.reset}\n`);
  }

  playTurn() {
    this.print();

    rl.question('Enter move: ', (input) => {
      const move = input.trim().toLowerCase();

      if (move === 'q') {
        console.log('Bye!');
        rl.close();
        return;
      }

      switch (move) {
        case 'w':
          this.moveUp();
          break;
        case 's':
          this.moveDown();
          break;
        case 'a':
          this.moveLeft();
          break;
        case 'd':
          this.moveRight();
          break;
        default:
          console.log('Invalid input! Please press w, a, s, or d.');
          setTimeout(() => this.playTurn(), 800);
          return;
      }

      this.steps++;

      // เช็คเดินตกขอบแผนที่
      if (!this.isInBounds()) {
        console.log(`\n${colors.red}${colors.bold}🚫 You went out of bounds! Game over.${colors.reset}`);
        this.askPlayAgain();
        return;
      }

      // เช็คเดินตกหลุม
      if (this.isHole()) {
        console.log(`\n${colors.red}${colors.bold}💀 You fell into a hole! Game over.${colors.reset}`);
        this.askPlayAgain();
        return;
      }

      // เช็คเดินเจอหมวก (ชนะ)
      if (this.isHat()) {
        console.log(`\n${colors.green}${colors.bold}🎉 You found the hat! You win! (Total Steps: ${this.steps})${colors.reset}`);
        this.askPlayAgain();
        return;
      }

      // บันทึกทางที่เดินผ่านมาแล้วเดินรอบถัดไป
      this.field[this.y][this.x] = pathChar;
      this.playTurn();
    });
  }

  isInBounds() {
    return (
      this.y >= 0 &&
      this.x >= 0 &&
      this.y < this.field.length &&
      this.x < this.field[0].length
    );
  }

  isHole() {
    return this.field[this.y][this.x] === hole;
  }

  isHat() {
    return this.field[this.y][this.x] === hat;
  }

  askPlayAgain() {
    rl.question('\nPlay again? (y/n): ', (answer) => {
      if (answer.trim().toLowerCase() === 'y') {
        const game = new Field(Field.generateField(10, 10, 0.2));
        game.playTurn();
      } else {
        console.log('Thanks for playing!');
        rl.close();
      }
    });
  }

  static generateField(height, width, percentage = 0.2) {
    const field = [];

    for (let i = 0; i < height; i++) {
      const row = [];
      for (let j = 0; j < width; j++) {
        row.push(fieldChar);
      }
      field.push(row);
    }

    // 1. สุ่มตำแหน่ง Actor (ผู้เล่น)
    const actorX = Math.floor(Math.random() * width);
    const actorY = Math.floor(Math.random() * height);
    field[actorY][actorX] = pathChar;

    // 2. สุ่มตำแหน่ง Hat (หมวก) ไม่ให้ทับกับ Actor
    let hatX, hatY;
    do {
      hatX = Math.floor(Math.random() * width);
      hatY = Math.floor(Math.random() * height);
    } while (hatX === actorX && hatY === actorY);

    field[hatY][hatX] = hat;

    // 3. สุ่มกระจายหลุม Holes (ไม่ให้ทับ Actor และ Hat)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (x === actorX && y === actorY) continue;
        if (x === hatX && y === hatY) continue;

        if (Math.random() < percentage) {
          field[y][x] = hole;
        }
      }
    }

    return field;
  }
}

// เริ่มต้นเกม
const myField = new Field(Field.generateField(10, 10, 0.2));
myField.playTurn();