# 🧠 My Think & Dev Log (บันทึกแนวคิดและขั้นตอนการพัฒนาเกม Find Your Hat)

เอกสารนี้เขียนขึ้นเพื่อบันทึกกระบวนการคิด วิธีการออกแบบโค้ด และขั้นตอนการพัฒนาเกม **Find Your Hat** ตามเกณฑ์ Assessment Rubric อย่างละเอียด

---

## 🎯 1. จุดเริ่มต้นและแนวคิดของเกม (Concept & Goals)

เป้าหมายของโปรเจกต์คือการสร้างเกม Console Maze บน Terminal ด้วย **Node.js (Vanilla JavaScript & OOP)** โดยมีโจทย์สำคัญดังนี้:
1. **โครงสร้าง Class Method ครบถ้วน**: มี `constructor`, `moveRight()`, `moveLeft()`, `moveUp()`, `moveDown()`
2. **ระบบ Random Spawn ครบทั้ง 3 ส่วน**: สุ่มตำแหน่งของ `Actor (*)` (ผู้เล่น), `Hat (^)` (หมวก), และ `Holes (O)` (หลุม)
3. **Print Map ชัดเจน**: แสดงตาราง 2D Array พร้อมสถานะและการเดิน
4. **Game Logic & Messages ถูกต้อง**:
   - ชนะ: `🎉 You found the hat! You win!`
   - ตกหลุม: `💀 You fell into a hole! Game over.`
   - ออกนอกแมพ: `🚫 You went out of bounds! Game over.`
5. **UI เป็นมิตรต่อผู้เล่น**: มีสีสันและเส้นขอบสวยงาม

---

## 🪜 2. ลำดับขั้นตอนกระบวนการคิดและการพัฒนา (Step-by-Step Thinking Process)

### Step 1: ออกแบบ Data Structure ของแผนที่
- เลือกใช้ **2D Array (`Array of Arrays`)** ขนาด `height` x `width`
- สัญลักษณ์พื้นฐาน:
  - `*` แทน Actor (ผู้เล่น) และเส้นทางที่เดินผ่าน
  - `^` แทน Hat (หมวกเป้าหมาย)
  - `O` แทน Hole (หลุมพราง)
  - `·` แทน Field (พื้นที่สนามว่าง)

---

### Step 2: ออกแบบระบบ Random Spawn (Actor, Hat, Holes)
ต้องสุ่มทั้ง 3 องค์ประกอบไม่ให้ทับซ้อนกัน:
1. **สุ่ม Actor (`*`)**: สุ่มพิกัด `(actorX, actorY)` วางลงบนกระดานก่อนเป็นอันดับแรก
2. **สุ่ม Hat (`^`)**: สุ่มพิกัด `(hatX, hatY)` โดยใช้ลูป `do...while` เพื่อป้องกันไม่ให้หมวกไปเกิดทับตำแหน่งของ Actor
3. **สุ่ม Holes (`O`)**: วนลูปตรวจสอบทุกช่องในตาราง หากไม่ใช่ช่องของ Actor และไม่ใช่ช่องของ Hat จะสุ่มค่าความน่าจะเป็นเทียบกับ `percentage` (Default 20%) ถ้าสุ่มผ่านจะวางหลุม `O`

---

### Step 3: ออกแบบ Class `Field` และ Methods การเคลื่อนที่
ตามข้อกำหนด OOP จึงออกแบบแยก Method การเดินให้ชัดเจน ไม่เขียนรวมเป็นก้อนเดียว:
- `constructor(field)`: รับตารางแผนที่เข้ามา และเรียก `findActorPosition()` เพื่อหาพิกัด `(x, y)` เริ่มต้นของ Actor ที่สุ่มไว้
- `moveUp()`: ลดค่า `this.y -= 1`
- `moveDown()`: เพิ่มค่า `this.y += 1`
- `moveLeft()`: ลดค่า `this.x -= 1`
- `moveRight()`: เพิ่มค่า `this.x += 1`

---

### Step 4: ออกแบบการแสดงผล (`print`) และตกแต่ง UI ด้วย ANSI Colors
- สั่ง `console.clear()` เพื่อให้หน้าจอรีเฟรชในจุดเดิม
- วาดกรอบตารางสี่เหลี่ยมด้านบน ซ้าย ขวา ล่าง เพื่อให้อ่านง่าย
- **การใช้สี (ANSI Colors):**
  > **Note:** ในส่วนของการจับคู่รหัสสี **ผมได้ใช้ AI ช่วยแนะนำโค้ดสี ANSI** (`\x1b[...]`) เพื่อให้ Terminal แสดงผลได้อย่างสวยงาม:
  > - ฟ้า (`cyan`) = ผู้เล่น/ทางเดิน
  > - เหลืองทอง (`yellow`) = หมวกเป้าหมาย
  > - แดง (`red`) = หลุมอันตราย
  > - เทา (`gray`) = ทางเดินและกรอบ

---

### Step 5: จัดการ Game Loop & Logic การตัดสินผล (`playTurn`)
เมื่อผู้เล่นกดปุ่มและกด Enter:
1. เรียก Class Method ที่สอดคล้อง (`moveUp`, `moveDown`, `moveLeft`, `moveRight`)
2. นับจำนวนก้าว `this.steps++`
3. ตรวจสอบเงื่อนไขตามลำดับ:
   - **`!this.isInBounds()`** -> แจ้ง `🚫 You went out of bounds! Game over.`
   - **`this.isHole()`** -> แจ้ง `💀 You fell into a hole! Game over.`
   - **`this.isHat()`** -> แจ้ง `🎉 You found the hat! You win!`
4. หากยังไม่จบเกม: มาร์กจุดเดิน `this.field[this.y][this.x] = '*'` แล้วเรียก `this.playTurn()` ซ้ำ (Recursion)

---

### Step 6: เพิ่มระบบ Replay (`askPlayAgain`)
เพื่อความสะดวกของผู้เล่น เมื่อเกมจบ (ไม่ว่าจะแพ้หรือชนะ) จะแสดงคำถาม `Play again? (y/n)` ถ้าตอบ `y` จะสร้างแผนที่สุ่มใหม่แล้วเริ่มเล่นต่อได้ทันที

---

## 🔍 3. เจาะลึกโค้ดในแต่ละส่วน (Code Breakdown)

### 1. Class Methods การเคลื่อนที่
```javascript
moveUp() { this.y -= 1; }
moveDown() { this.y += 1; }
moveLeft() { this.x -= 1; }
moveRight() { this.x += 1; }
```
**เหตุผล:** แยก Method ออกจาก Game Loop เพื่อให้โค้ด Modular ดูแลง่าย และตรงตามหลัก Clean Code

---

### 2. ฟังก์ชัน Random Spawn แบบครบทั้ง 3 จุด
```javascript
static generateField(height, width, percentage = 0.2) {
  // 1. สุ่ม Actor
  const actorX = Math.floor(Math.random() * width);
  const actorY = Math.floor(Math.random() * height);
  field[actorY][actorX] = pathChar;

  // 2. สุ่ม Hat (ไม่ทับ Actor)
  let hatX, hatY;
  do {
    hatX = Math.floor(Math.random() * width);
    hatY = Math.floor(Math.random() * height);
  } while (hatX === actorX && hatY === actorY);
  field[hatY][hatX] = hat;

  // 3. สุ่ม Holes (ไม่ทับ Actor และ Hat)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x === actorX && y === actorY) continue;
      if (x === hatX && y === hatY) continue;
      if (Math.random() < percentage) field[y][x] = hole;
    }
  }
}
```

---

## 💡 4. ปัญหาที่พบและแนวทางแก้ไข (Challenges & Fixes)

1. **ปัญหาการหาพิกัดเริ่มต้นของ Actor หลังสุ่มแผนที่**:
   - *ปัญหา:* พอเราสุ่มเกิด Actor ใน `generateField` คลาส `Field` จะไม่รู้ว่า Actor อยู่ที่ไหนถ้าไม่ได้บันทึกพิกัดไว้
   - *วิธีแก้:* เขียนเมธอด `findActorPosition()` ใน constructor เพื่อสแกนหา `*` บนตารางและเซ็ตค่า `this.x`, `this.y` ให้ตรงกันทันที

2. **ปัญหาการเดินทับซ้ำ**:
   - *ปัญหา:* เมื่อเดินกลับทางเดิม รอยเท้า `*` ยังคงอยู่
   - *วิธีแก้:* การบันทึก `this.field[this.y][this.x] = pathChar` เป็นการยืนยันว่าช่องนี้ได้ถูกเดินสำรวจแล้ว ทำให้มองเห็นเส้นทางทั้งหมดที่ผู้เล่นเดินผ่าน

---

## 📋 5. ตารางตรวจสอบเทียบกับเกณฑ์ Rubric

| หัวข้อเกณฑ์ Rubric | สถานะในโค้ด | คะแนนที่คาดหวัง |
| :--- | :--- | :---: |
| **Class Method** (`constructor`, `moveRight`, `moveLeft`, `moveUp`, `moveDown`) | ครบถ้วน 100% | **2 / 2** |
| **Print Map** (แสดงผลตารางได้ถูกต้องและชัดเจน) | ชัดเจน พร้อมตีกรอบและสี | **2 / 2** |
| **เดินได้ถูกต้อง & Update Map** (ซ้าย/ขวา/ขึ้น/ลง และอัปเดต `*`) | ทำงานถูกต้องตามปุ่ม w/a/s/d | **2 / 2** |
| **Game Logic** (Win/Lose Messages ตรงตามเกณฑ์) | ข้อความตรงตามโจทย์เป๊ะๆ | **2 / 2** |
| **Random spawn** (สุ่มทั้ง holes, hat, actor) | สุ่มครบทั้ง 3 องค์ประกอบ | **2 / 2** |
| **Thinking process** (อธิบายแนวคิดทีละขั้นตอน) | บันทึกละเอียดใน Mythink.md | **5 / 5** |
| **คะแนนรวม** | | **15 / 15** |
