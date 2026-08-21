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
  info: (text) => `${colors.cyan}${text}${colors.reset}`
};

const hat = '^';
const hole = 'O';
const fieldCharacter = '░';
const pathCharacter = '*';

class Field {
  constructor(field = [[]]) {
    this.field = field;
    this.locationY = 0;
    this.locationX = 0;
    // กำหนดจุดเริ่มต้นที่มุมซ้ายบน
    this.field[0][0] = pathCharacter;
  }

  // แสดงผลแผนที่ใน Terminal
  print() {
    const displayString = this.field
      .map(row => row.map(char => {
        if (char === pathCharacter) return style.player(char);
        if (char === hat) return style.hat(char);
        if (char === hole) return style.hole(char);
        return style.field(char);
      }).join(''))
      .join('\n');
    console.clear();
    console.log(displayString);
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

      switch (input) {
        case 'w':
          this.locationY -= 1;
          break;
        case 's':
          this.locationY += 1;
          break;
        case 'a':
          this.locationX -= 1;
          break;
        case 'd':
          this.locationX += 1;
          break;
        default:
          console.log(style.danger('Invalid input. Please use w, a, s, d.'));
          setTimeout(() => this.playTurn(), 1000);
          return;
      }

      // ตรวจสอบว่าเดินชนขอบแผนที่หรือไม่
      if (!this.isInBounds()) {
        console.log(style.danger('Out of bounds! You lose!'));
        rl.close();
        return;
      }

      // ตรวจสอบว่าตกหลุมหรือไม่
      if (this.isHole()) {
        console.log(style.danger('Oops, you fell in a hole! Game Over!'));
        rl.close();
        return;
      }

      // ตรวจสอบว่าเจอหมวกหรือยัง
      if (this.isHat()) {
        console.log(style.success('Congratulations, you found your hat!'));
        rl.close();
        return;
      }

      // บันทึกรอยเท้าเส้นทางที่เดินผ่านมา
      this.field[this.locationY][this.locationX] = pathCharacter;

      // วนลูปเล่นตาต่อไป
      this.playTurn();
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