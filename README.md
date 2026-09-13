# משחקי מגע לילדים / Kids Touch Mini-Games

חבילת משחקי מגע קצרים לילדים בני 5–8.  
A pack of short touch-only mini-games for kids ages 5–8.

**שפה / Language:** ממשק בעברית (RTL) · UI in Hebrew (RTL)  
**טכנולוגיה / Tech:** HTML + CSS + JavaScript (ללא שרת / no backend)

---

## המשחקים / Games

| משחק | Game | תיאור |
|------|------|--------|
| 🐾 חיות | Animals | התאמת חיות לבתים / בתי גידול |
| 🚗 מכוניות | Cars | חניית רכבים + שטיפת משאית בהחלקה |
| 🧩 צורות | Shapes | מיון צורות בגרירה |
| 🎨 ציור | Drawing | ציור באצבע, צבעים וחותמות |

- כפתורים גדולים, צבעים בהירים, משוב חיובי  
- בלי טיימרים מענישים, בלי פרסומות / רכישות / חשבונות  
- עובד במצב לא מקוון אחרי טעינה ראשונה (קבצים סטטיים)

---

## איך להריץ / How to run

מתוך תיקיית הפרויקט / From the project folder:

```bash
cd Kids-touch-minigames
```

**אפשרות 1 — Python:**

```bash
python3 -m http.server 8080
```

**אפשרות 2 — npx serve:**

```bash
npx --yes serve -l 8080
```

ואז פתחו בדפדפן / Then open in the browser:

```
http://localhost:8080
```

אפשר גם לפתוח את `index.html` ישירות בקובץ, אבל שרת מקומי מומלץ לטלפון.

---

## אנדרואיד באותה רשת Wi‑Fi / Android tip

1. הריצו את השרת במחשב (ראה למעלה).  
2. מצאו את כתובת ה־IP של המחשב, למשל:
   - Linux / Mac: `ip a` או `ifconfig`
   - Windows: `ipconfig`
3. בטלפון (Chrome), פתחו: `http://<IP-של-המחשב>:8080`  
   לדוגמה: `http://192.168.1.20:8080`
4. ודאו שהטלפון והמחשב באותה רשת Wi‑Fi, ושהחומה האש מאפשרת פורט 8080.

לאחר הטעינה הראשונה ניתן להוסיף למסך הבית (Add to Home screen) לשימוש נוח יותר.

---

## מבנה קבצים / File structure

```
Kids-touch-minigames/
├── index.html          # מסך הבית / Hub
├── README.md
├── css/
│   └── main.css
├── js/
│   ├── common.js       # חגיגה, צלילים, גרירה
│   ├── animals.js
│   ├── cars.js
│   ├── puzzles.js
│   └── drawing.js
└── games/
    ├── animals.html
    ├── cars.html
    ├── puzzles.html
    └── drawing.html
```

---

## הערות / Notes

- מיועד ל־Android Chrome (מובייל־פרסט).  
- נכסים הם emoji / SVG / CSS בלבד — אין תמונות חיצוניות.  
- הקוד וההערות באנגלית; התוויות למשתמש בעברית.
