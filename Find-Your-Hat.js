const readline = require('readline');

// ตั้งค่า Interface สำหรับรับค่าผ่าน Terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

const style = {
  player: (text) => `${colors.cyan}${colors.bold}${text}${colors.reset}`,
  hat: (text) => `${colors.yellow}${colors.bold}${text}${colors.reset}`,
  hole: (text) => `${colors.red}${text}${colors.reset}`,
  field: (text) => `${colors.gray}${text}${colors.reset}`,
  title: (text) => `${colors.magenta}${colors.bold}${text}${colors.reset}`,
  accent: (text) => `${colors.cyan}${text}${colors.reset}`,
  success: (text) => `${colors.green}${colors.bold}${text}${colors.reset}`,
  danger: (text) => `${colors.red}${colors.bold}${text}${colors.reset}`,
  dim: (text) => `${colors.dim}${text}${colors.reset}`,
  info: (text) => `${colors.cyan}${text}${colors.reset}`
};

const hat = '^';
const hole = 'O';
const fieldCharacter = '·';
const pathCharacter = '*';

class Field {
  constructor(field = [[]]) {
    this.field = field;
    this.locationY = 0;
    this.locationX = 0;
    this.steps = 0;
    this.statusMessage = style.dim('Game started! Find the hat [^] while avoiding holes [O].');
    // กำหนดจุดเริ่มต้นที่มุมซ้ายบน
    this.field[0][0] = pathCharacter;
  }

  // แสดงผลหัวข้อเกม
  static printBanner() {
    console.log(style.title('================================================'));
    console.log(style.title('             🎩 FIND YOUR HAT 🎩                '));
    console.log(style.title('================================================'));
  }

  // แสดงผลคำแนะนำสัญลักษณ์ (Legend)
  static printLegend() {
    console.log(style.dim(' Legend: ') +
      style.player('[*] You/Path  ') +
      style.hat('[^] Hat (Target)  ') +
      style.hole('[O] Hole  ') +
      style.field('[·] Open Path')
    );
    console.log(style.accent(' Controls: [W] Up  [S] Down  [A] Left  [D] Right  [Q] Quit'));
  }

  // แสดงผลแผนที่ใน Terminal พร้อมีกรอบตกแต่ง และ Dashboard
  print() {
    console.clear();
    Field.printBanner();

    // แสดง Dashboard แถบสถานะ
    const statusLine = ` 📍 Position: (X: ${this.locationX}, Y: ${this.locationY})  |  👟 Steps: ${this.steps}`;
    console.log(style.accent(statusLine));
    console.log(this.statusMessage);
    console.log('');

    const width = this.field[0].length;
    const topBorder = style.field('┌' + '───'.repeat(width) + '─┐');
    const bottomBorder = style.field('└' + '───'.repeat(width) + '─┘');

    const rows = this.field.map(row => {
      const rowContent = row.map(char => {
        if (char === pathCharacter) return style.player(` ${char} `);
        if (char === hat) return style.hat(` ${char} `);
        if (char === hole) return style.hole(` ${char} `);
        return style.field(` ${char} `);
      }).join('');
      return style.field('│') + rowContent + style.field('│');
    });

    console.log(topBorder);
    console.log(rows.join('\n'));
    console.log(bottomBorder);
    console.log('');
    Field.printLegend();
    console.log('');
  }

  // ฟังก์ชันรับค่าและรันเกมแบบวนรอบ (Recursive)
  playTurn() {
    this.print();
    rl.question(style.info('Move (w/a/s/d, q to quit): '), (answer) => {
      const input = answer.trim().toLowerCase();

      if (input === 'q') {
        console.log(style.info('Exiting game... Goodbye!'));
        rl.close();
        return;
      }

      let moveDesc = '';
      switch (input) {
        case 'w':
          this.locationY -= 1;
          moveDesc = 'Moved Up [W]';
          break;
        case 's':
          this.locationY += 1;
          moveDesc = 'Moved Down [S]';
          break;
        case 'a':
          this.locationX -= 1;
          moveDesc = 'Moved Left [A]';
          break;
        case 'd':
          this.locationX += 1;
          moveDesc = 'Moved Right [D]';
          break;
        default:
          this.statusMessage = style.danger('⚠ Invalid input! Please use W, A, S, or D.');
          this.playTurn();
          return;
      }

      this.steps += 1;
      this.statusMessage = style.info(`✔ ${moveDesc}`);

      // ตรวจสอบว่าเดินชนขอบแผนที่หรือไม่
      if (!this.isInBounds()) {
        this.printGameOverScreen('You stepped out of bounds!');
        return;
      }

      // ตรวจสอบว่าตกหลุมหรือไม่
      if (this.isHole()) {
        this.printGameOverScreen('You fell into a dark hole!');
        return;
      }

      // ตรวจสอบว่าเจอหมวกหรือยัง
      if (this.isHat()) {
        this.printVictoryScreen();
        return;
      }

      // บันทึกรอยเท้าเส้นทางที่เดินผ่านมา
      this.field[this.locationY][this.locationX] = pathCharacter;

      // วนลูปเล่นตาต่อไป
      this.playTurn();
    });
  }

  // แสดงผลหน้าจอชนะเกม
  printVictoryScreen() {
    console.clear();
    console.log(style.success('================================================'));
    console.log(style.success('    🎉 CONGRATULATIONS! YOU FOUND YOUR HAT! 🎉  '));
    console.log(style.success('================================================'));
    console.log(style.player(`  🏆 Total Steps Taken: ${this.steps}`));
    console.log(style.title(`  🎩 You are a Master Hat Finder!`));
    console.log('');
    Field.askPlayAgain();
  }

  // แสดงผลหน้าจอแพ้เกม
  printGameOverScreen(reason) {
    console.clear();
    console.log(style.danger('================================================'));
    console.log(style.danger('             💀 GAME OVER 💀                    '));
    console.log(style.danger('================================================'));
    console.log(style.danger(`  ❌ ${reason}`));
    console.log(style.dim(`  👟 Steps survived: ${this.steps}`));
    console.log('');
    Field.askPlayAgain();
  }

  // ถามผู้เล่นว่าต้องการเล่นใหม่อีกครั้งหรือไม่
  static askPlayAgain() {
    rl.question(style.info('Play again? (y/n): '), (answer) => {
      const input = answer.trim().toLowerCase();
      if (input === 'y' || input === 'yes') {
        const newGame = new Field(Field.generateField(10, 10, 0.2));
        newGame.playTurn();
      } else {
        console.log(style.title('\nThanks for playing Find Your Hat! See you next time! 👋\n'));
        rl.close();
      }
    });
  }

  isInBounds() {
    return (
      this.locationY >= 0 &&
      this.locationX >= 0 &&
      this.locationY < this.field.length &&
      this.locationX < this.field[0].length
    );
  }

  isHole() {
    return this.field[this.locationY][this.locationX] === hole;
  }

  isHat() {
    return this.field[this.locationY][this.locationX] === hat;
  }

  // ฟังก์ชันสุ่มสร้างแผนที่
  static generateField(height, width, percentage = 0.2) {
    const field = new Array(height).fill(0).map(() => new Array(width).fill(fieldCharacter));

    let hatY, hatX;
    do {
      hatY = Math.floor(Math.random() * height);
      hatX = Math.floor(Math.random() * width);
    } while (hatY === 0 && hatX === 0); // ป้องกันไม่ให้หมวกทับจุดเริ่มต้น

    field[hatY][hatX] = hat;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (y === 0 && x === 0) continue;
        if (field[y][x] === hat) continue;
        
        if (Math.random() < percentage) {
          field[y][x] = hole;
        }
      }
    }
    return field;
  }
}

// เริ่มต้นสร้างสนามขนาด 10x10 และสุ่มหลุม 20%
const myField = new Field(Field.generateField(10, 10, 0.2));
myField.playTurn();