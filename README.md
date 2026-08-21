# 🎩 Find Your Hat - Terminal Game

เกมเขาวงกตผจญภัยบน Terminal ที่พัฒนาด้วย **Node.js (Vanilla JavaScript)** โดยผู้เล่นจะต้องควบคุมตัวละครเดินทางผ่านเขาวงกตที่เต็มไปด้วยหลุมพราง เพื่อค้นหาหมวกที่หายไป!

---

## 🌟 คุณสมบัติเด่น (Features)

- **🎨 Modern Terminal UI & ANSI Colors**: มีสีสันสดใส แยกประเภทพื้นที่ ผู้เล่น หมวก และหลุมอย่างชัดเจน
- **🖼️ ASCII Banner & Box Framing**: มีกรอบตกแต่งสี่เหลี่ยมรอบสนามอย่างเป็นระเบียบ
- **📊 Real-time Dashboard**: แสดงพิกัดแกน `(X, Y)` ปัจจุบัน และจำนวนก้าว `Steps` แบบเรียลไทม์
- **🗺️ Interactive Legend**: มีคำอธิบายสัญลักษณ์และปุ่มควบคุมแสดงตลอดการเล่น
- **🎲 Procedural Map Generation**: แผนที่สุ่มใหม่ทุกครั้ง พร้อมกำหนดอัตราความยาก (% ของหลุม)
- **🔄 Play Again Flow**: สามารถเริ่มเล่นเกมใหม่ได้ทันทีหลังจบเกม

---

## 🎮 วิธีการติดตั้งและรันเกม (How to Run)

### สิ่งที่ต้องมีในเครื่อง
- ติดตั้ง **[Node.js](https://nodejs.org/)** (เวอร์ชัน 14 ขึ้นไป)

### ขั้นตอนการรัน
1. เปิด Terminal / PowerShell ที่โฟลเดอร์โปรเจกต์
2. สั่งรันคำสั่ง:
   ```bash
   node Find-Your-Hat.js
   ```

---

## 🕹️ การควบคุม (Controls) & สัญลักษณ์ (Legend)

| ปุ่มกด | การกระทำ |
| :---: | :--- |
| <kbd>W</kbd> | เดินขึ้นด้านบน (Up) |
| <kbd>S</kbd> | เดินลงด้านล่าง (Down) |
| <kbd>A</kbd> | เดินไปทางซ้าย (Left) |
| <kbd>D</kbd> | เดินไปทางขวา (Right) |
| <kbd>Q</kbd> | ออกจากเกม (Quit) |

### สัญลักษณ์บนสนาม:
- `*` : **ผู้เล่น (Player)** หรือเส้นทางที่เดินผ่านมาแล้ว
- `^` : **หมวก (Hat)** เป้าหมายที่คุณต้องเดินไปให้ถึงเพื่อชนะ
- `O` : **หลุมพราง (Hole)** จุดอันตรายที่หากเดินตกจะแพ้ทันที
- `·` : **พื้นที่สนามโล่ง (Open Field)** ทางเดินที่สามารถเดินผ่านได้อย่างปลอดภัย

---

## 📖 อธิบายการทำงานของโค้ดอย่างละเอียด (Code Breakdown)

ไฟล์ [Find-Your-Hat.js](Find-Your-Hat.js) ประกอบด้วย 5 ส่วนสำคัญ ดังนี้:

---

### 1. การรับข้อมูลจากผู้เล่นผ่าน Terminal (`readline`)
```javascript
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
```
- **`readline`**: โมดูล Built-in ของ Node.js ใช้สำหรับอ่านข้อมูลที่ผู้ใช้พิมพ์ผ่านคีย์บอร์ดใน Terminal
- **`createInterface`**: เชื่อมต่อ Standard Input (`process.stdin`) และ Standard Output (`process.stdout`) เพื่อให้ถาม-ตอบข้อความกับผู้เล่นได้

---

### 2. ระบบสี ANSI Escape Codes และจัดรูปแบบ (`colors` & `style`)
```javascript
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
```
- **ANSI Escape Codes**: รหัสพิเศษที่ส่งไปยัง Terminal เพื่อสั่งเปลี่ยนสีตัวอักษร สีพื้นหลัง หรือทำให้ตัวหนา (`bold`)
- **`colors.reset` (`\x1b[0m`)**: รหัสคืนค่าสีเริ่มต้น ป้องกันไม่ให้สีลามไปยังข้อความอื่น

```javascript
const style = {
  player: (text) => `${colors.cyan}${colors.bold}${text}${colors.reset}`,
  hat: (text) => `${colors.yellow}${colors.bold}${text}${colors.reset}`,
  hole: (text) => `${colors.red}${text}${colors.reset}`,
  field: (text) => `${colors.gray}${text}${colors.reset}`,
  // ...
};
```
- รวมฟังก์ชัน Utility สั้นๆ เพื่อครอบข้อความด้วยสีตามบทบาท เช่น ตัวละครเป็นสีฟ้า (`cyan`), หมวกเป็นสีเหลืองทอง (`yellow`), หลุมเป็นสีแดง (`red`)

---

### 3. สัญลักษณ์คงที่ (Tile Constants)
```javascript
const hat = '^';
const hole = 'O';
const fieldCharacter = '·';
const pathCharacter = '*';
```
- กำหนดตัวแปรแทนองค์ประกอบต่างๆ เพื่อให้แก้ไขสัญลักษณ์ได้ง่ายในที่เดียว

---

### 4. คลาสหลัก `Field` (Object-Oriented Programming)

#### 4.1 `constructor(field)`
```javascript
constructor(field = [[]]) {
  this.field = field;             // ตารางแผนที่ 2 มิติ (2D Array)
  this.locationY = 0;              // พิกัดแถวปัจจุบันของผู้เล่น (แกน Y)
  this.locationX = 0;              // พิกัดคอลัมน์ปัจจุบันของผู้เล่น (แกน X)
  this.steps = 0;                  // จำนวนก้าวที่เดิน
  this.statusMessage = style.dim('Game started! Find the hat [^] while avoiding holes [O].');
  this.field[0][0] = pathCharacter; // จุดเริ่มต้นมุมซ้ายบน (0, 0)
}
```
- กำหนดค่าเริ่มต้นของเกม เก็บสถานะตำแหน่งผู้เล่น และจำนวนก้าว

---

#### 4.2 การแสดงผลหน้าจอ (`print`, `printBanner`, `printLegend`)
```javascript
print() {
  console.clear();                // ล้างหน้าจอ Terminal เพื่อสร้างภาพเคลื่อนไหว
  Field.printBanner();            // แสดงแบนเนอร์ชื่อเกม

  // แสดงแถบสถานะพิกัดและจำนวนก้าว
  const statusLine = ` 📍 Position: (X: ${this.locationX}, Y: ${this.locationY})  |  👟 Steps: ${this.steps}`;
  console.log(style.accent(statusLine));
  console.log(this.statusMessage);

  // วาดกรอบตาราง ┌───┐ และแถวข้อมูล │ ... │
  // ...
}
```
- ทำการ Clear หน้าจอเดิมและวาดแผนที่ใหม่อย่างต่อเนื่องในตำแหน่งเดิม ทำให้เกิดความรู้สึกลื่นไหลเหมือนเกมจริง

---

#### 4.3 ลูปการเล่นหลัก (`playTurn`)
```javascript
playTurn() {
  this.print();
  rl.question(style.info('Move (w/a/s/d, q to quit): '), (answer) => {
    // 1. รับและแปลงคำสั่งเป็นตัวพิมพ์เล็ก
    // 2. คำนวณพิกัดใหม่ตามปุ่ม w, a, s, d
    // 3. ตรวจสอบเงื่อนไขแพ้-ชนะ:
    //    - isInBounds() -> ออกนอกแผนที่หรือไม่?
    //    - isHole()     -> ตกหลุมหรือไม่?
    //    - isHat()      -> ชนะเจอหมวกหรือไม่?
    // 4. หากผ่าน บันทึกรอยเท้า this.field[Y][X] = '*'
    // 5. เรียก this.playTurn() ซ้ำ (Recursion) เพื่อเล่นรอบต่อไป
  });
}
```

---

#### 4.4 ฟังก์ชันตรวจสอบสถานะ (Validation Helpers)
- **`isInBounds()`**: เช็คว่าพิกัด `(locationY, locationX)` ยังอยู่ภายในขอบเขตความกว้างและความสูงของ Array หรือไม่ (ไม่ติดลบและไม่เกินขนาดสนาม)
- **`isHole()`**: ตรวจสอบว่าช่องที่เหยียบมีค่าเท่ากับ `'O'` หรือไม่
- **`isHat()`**: ตรวจสอบว่าช่องที่เหยียบมีค่าเท่ากับ `'^'` หรือไม่

---

#### 4.5 หน้าจอสรุปผลและการเริ่มใหม่ (`printVictoryScreen`, `printGameOverScreen`, `askPlayAgain`)
```javascript
static askPlayAgain() {
  rl.question(style.info('Play again? (y/n): '), (answer) => {
    if (input === 'y' || input === 'yes') {
      const newGame = new Field(Field.generateField(10, 10, 0.2));
      newGame.playTurn();
    } else {
      console.log('Thanks for playing Find Your Hat!');
      rl.close();
    }
  });
}
```
- เมื่อเกมจบ จะไม่ปิดโปรแกรมทันที แต่จะถามความต้องการของผู้เล่น หากตอบ `y` จะสร้างสนามใหม่และเริ่มเล่นต่อได้ทันที

---

#### 4.6 อัลกอริทึมการสุ่มแผนที่ (`Field.generateField`)
```javascript
static generateField(height, width, percentage = 0.2) {
  // 1. สร้าง Array 2 มิติขนาด height x width ที่เต็มไปด้วยจุดว่าง '·'
  const field = new Array(height).fill(0).map(() => new Array(width).fill(fieldCharacter));

  // 2. สุ่มตำแหน่งหมวก โดยห้ามอยู่พิกัดเริ่มต้น (0, 0)
  let hatY, hatX;
  do {
    hatY = Math.floor(Math.random() * height);
    hatX = Math.floor(Math.random() * width);
  } while (hatY === 0 && hatX === 0);
  field[hatY][hatX] = hat;

  // 3. วนลูปสุ่มกระจายหลุม 'O' ตามอัตราส่วน percentage (ค่าเริ่มต้น 20%)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (y === 0 && x === 0) continue; // ข้ามจุดเริ่ม
      if (field[y][x] === hat) continue; // ข้ามจุดวางหมวก
      
      if (Math.random() < percentage) {
        field[y][x] = hole;
      }
    }
  }
  return field;
}
```

---

### 5. การเริ่มต้นรันเกม (Game Entry Point)
```javascript
// สร้างสนามขนาด 10x10 และสุ่มหลุม 20%
const myField = new Field(Field.generateField(10, 10, 0.2));
myField.playTurn();
```
- สร้าง Instance ของ `Field` พร้อมส่งแมพขนาด 10x10 ที่สุ่มเสร็จแล้วเข้ามา และเรียกฟังก์ชัน `playTurn()` เพื่อเริ่มเกม

---

## 🎯 กฎและเงื่อนไขของเกม (Game Rules)

1. **ชนะ (Victory)**: เดินไปถึงตำแหน่งหมวก `^` โดยจำนวนก้าวจะถูกบันทึกและแสดงในหน้าจอสรุป
2. **แพ้ (Game Over)**:
   - **Out of bounds**: เดินชนขอบแผนที่จนหลุดออกไป
   - **Fell in hole**: เดินตกหลุม `O`
3. **การเดินซ้ำ**: สามารถเดินทับรอยทางเดิม `*` เพื่อเปลี่ยนทิศทางได้

---

## 👨‍💻 ผู้พัฒนา
- **GitHub**: [@Jakkapon-Dev](https://github.com/Jakkapon-Dev)
- **Repository**: [Find-Your-Hat](https://github.com/Jakkapon-Dev/Find-Your-Hat.git)
