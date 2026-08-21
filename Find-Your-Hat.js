const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Game characters
const hat = '^';
const hole = 'O';
const fieldChar = '·';
const pathChar = '*';

// ANSI colors for console styling
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

    // Start at top-left corner
    this.field[0][0] = pathChar;
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
          this.y -= 1;
          break;
        case 's':
          this.y += 1;
          break;
        case 'a':
          this.x -= 1;
          break;
        case 'd':
          this.x += 1;
          break;
        default:
          console.log('Invalid input! Please press w, a, s, or d.');
          setTimeout(() => this.playTurn(), 800);
          return;
      }

      this.steps++;

      // Check boundaries
      if (!this.isInBounds()) {
        console.log(`\n${colors.red}${colors.bold}Out of bounds! You lose!${colors.reset}`);
        this.askPlayAgain();
        return;
      }

      // Check hole
      if (this.isHole()) {
        console.log(`\n${colors.red}${colors.bold}Fell into a hole! Game over!${colors.reset}`);
        this.askPlayAgain();
        return;
      }

      // Check hat
      if (this.isHat()) {
        console.log(`\n${colors.green}${colors.bold}Congrats! You found your hat in ${this.steps} steps!${colors.reset}`);
        this.askPlayAgain();
        return;
      }

      // Mark visited path and continue
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

    // Place hat (random location other than 0,0)
    let hatX, hatY;
    do {
      hatX = Math.floor(Math.random() * width);
      hatY = Math.floor(Math.random() * height);
    } while (hatX === 0 && hatY === 0);

    field[hatY][hatX] = hat;

    // Fill holes based on percentage
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (x === 0 && y === 0) continue;
        if (x === hatX && y === hatY) continue;

        if (Math.random() < percentage) {
          field[y][x] = hole;
        }
      }
    }

    return field;
  }
}

// Start game
const myField = new Field(Field.generateField(10, 10, 0.2));
myField.playTurn();