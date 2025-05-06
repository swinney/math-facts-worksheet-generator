class MathFactTable {
  constructor(constant, rows, allowedOps, minRandom = 2, maxRandom = 12, columns = 10, repetitionWindow = 5) {
    this.constant = constant;
    this.rows = rows;
    this.allowedOps = allowedOps;
    this.minRandom = minRandom;
    this.maxRandom = maxRandom;
    this.columns = columns;
    this.repetitionWindow = repetitionWindow;
    this.totalCells = rows * columns;
    this.finalProblems = [];
  }

  buildEvenDistributionArray() {
    const allowedCount = this.maxRandom - this.minRandom + 1;
    const baseCount = Math.floor(this.totalCells / allowedCount);
    const remainder = this.totalCells % allowedCount;
    let values = [];

    for (let num = this.minRandom; num <= this.maxRandom; num++) {
      for (let i = 0; i < baseCount; i++) values.push(num);
    }
    for (let num = this.minRandom; num < this.minRandom + remainder; num++) {
      values.push(num);
    }
    return values;
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  enforceNoRepetitionWithin(problems) {
    for (let i = 0; i < problems.length; i++) {
      for (let j = Math.max(0, i - this.repetitionWindow); j < i; j++) {
        if (problems[j].operand === problems[i].operand && problems[j].op === problems[i].op) {
          for (let k = i + 1; k < problems.length; k++) {
            let conflict = false;
            for (let l = Math.max(0, i - this.repetitionWindow); l < i; l++) {
              if (problems[l].operand === problems[k].operand && problems[l].op === problems[k].op) {
                conflict = true;
                break;
              }
            }
            if (!conflict) {
              [problems[i], problems[k]] = [problems[k], problems[i]];
              break;
            }
          }
        }
      }
    }
  }

  formatVerticalHTML(problem) {
    let topOperand, bottomOperand, symbol;
    const { op: operation, operand: r } = problem;
    switch (operation) {
      case "addition":
        symbol = "+";
        if (Math.random() < 0.5) {
          topOperand = this.constant;
          bottomOperand = r;
        } else {
          topOperand = r;
          bottomOperand = this.constant;
        }
        break;
      case "subtraction":
        symbol = "−";
        if (this.constant >= r) {
          topOperand = this.constant;
          bottomOperand = r;
        } else {
          topOperand = r;
          bottomOperand = this.constant;
        }
        break;
      case "multiplication":
        symbol = "×";
        if (Math.random() < 0.5) {
          topOperand = this.constant;
          bottomOperand = r;
        } else {
          topOperand = r;
          bottomOperand = this.constant;
        }
        break;
      case "division":
        symbol = "÷";
        topOperand = this.constant * r;
        bottomOperand = this.constant;
        break;
      default:
        symbol = "+";
        topOperand = this.constant;
        bottomOperand = r;
        break;
    }
    return `
      <div class="fact">
        <div class="operand">${String(topOperand).padStart(2, ' ')}</div>
        <div class="operand">${symbol} ${String(bottomOperand).padStart(2, ' ')}</div>
        <hr class="line">
      </div>
    `;
  }

  generateTableHTML() {
    let evenNumbers = this.buildEvenDistributionArray();
    this.shuffleArray(evenNumbers);

    let problems = [];
    for (let i = 0; i < evenNumbers.length; i++) {
      const op = this.allowedOps[Math.floor(Math.random() * this.allowedOps.length)];
      problems.push({ operand: evenNumbers[i], op });
    }

    this.enforceNoRepetitionWithin(problems);
    this.finalProblems = problems;

    const fragment = document.createDocumentFragment();
    let idx = 0;
    for (let i = 0; i < this.rows; i++) {
      const row = document.createElement("tr");
      for (let j = 0; j < this.columns; j++) {
        const cell = document.createElement("td");
        cell.innerHTML = this.formatVerticalHTML(problems[idx]);
        idx++;
        row.appendChild(cell);
      }
      fragment.appendChild(row);
    }
    return fragment;
  }
}

function generateTable() {
  const constantInput = document.getElementById("constantValue");
  const pageCountInput = document.getElementById("pageCount");
  let constant = parseInt(constantInput.value, 10);
  let pageCount = parseInt(pageCountInput.value, 10);

  if (isNaN(constant) || constant < 1 || constant > 12) {
    constant = 4;
    constantInput.value = 4;
  }
  if (isNaN(pageCount) || pageCount < 1) {
    pageCount = 1;
    pageCountInput.value = 1;
  }

  const rows = pageCount * 11;
  const columns = 10;

  const ops = Array.from(document.querySelectorAll('input[name="operators"]:checked'))
                 .map(cb => cb.value);
  if (ops.length === 0) ops.push("addition");

  const tableBody = document.getElementById("mathTableBody");
  tableBody.innerHTML = "";

  const table = new MathFactTable(constant, rows, ops, 2, 12, columns, 5);
  tableBody.appendChild(table.generateTableHTML());
}

document.getElementById("submitButton").addEventListener("click", generateTable);
// PDF button simply triggers the print dialog
document.getElementById("pdfButton").addEventListener("click", () => window.print());

window.onload = generateTable;
