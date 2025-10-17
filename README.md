# React DataGrid - Animaker Front-End Developer Assessment


## 🚀 Demo

**Live Demo:** [https://spreadsheet-one-steel.vercel.app/](https://spreadsheet-one-steel.vercel.app/)

---

## ⚙️ Installation & Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/react-datagrid-assessment.git

# 2. Navigate to the project directory
cd react-datagrid-assessment

# 3. Install dependencies
npm install

# 4. Run the development server
npm run dev


🧩 Features Overview

✏️ Editable Cells

Click or double-click to edit.

Press Enter or blur to save.

Press Esc to cancel edits.

➕ Add Row / Column

Adds new labeled rows (Row n) and header columns (Col n).

New cells are empty and editable.

🖱️ Selection

Click + drag to select rectangular ranges.

Shift + Click extends selection from the first selected cell.

Highlighted area visually represents the selected block.

⌨️ Keyboard Navigation

Arrow keys move between cells.

Enter starts editing current cell.

Tab moves right to next cell.

📋 Copy / Cut / Paste

Ctrl + C → Copy selected range.

Ctrl + X → Cut (copy + clear).

Ctrl + V → Paste data.

Supports pasting from Excel or Google Sheets.

Grid auto-expands if pasted data overflows.

💾 Local Storage

Grid state persists after page refresh or tab close.