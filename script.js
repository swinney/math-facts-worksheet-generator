class MathFactTable {
  /**
   * Creates a new MathFactTable.
   * @param {number} constant - The constant operand.
   * @param {number} rows - Total rows (a page equals 11 rows).
   * @param {Array} allowedOps - An array of allowed operator strings (e.g., ["addition", "subtraction", "multiplication", "division"]).
   * @param {number} [minRandom=4] - Minimum random operand value.
   * @param {number} [maxRandom=12] - Maximum random operand value.
   * @param {number} [columns=10] - Number of columns per row.
   * @param {number} [repetitionWindow=5] - No repeats allowed within this many cells.
   */
  constructor(constant, rows, allowedOps, minRandom = 4, maxRandom = 12, columns = 10, repetitionWindow = 5) {
    this.constant = constant;
    this.rows = rows;
    this.allowedOps = allowedOps;
    this.minRandom = minRandom;
    this.maxRandom = maxRandom;
    this.columns = columns;
    this.repetitionWindow = repetitionWindow;
    this.totalCells = rows * columns;
    this.finalProblems = []; // Will hold the generated problems.
  }

  // Build an evenly distributed array of operand values.
  buildEvenDistributionArray() {
    const allowedCount = this.maxRandom - this.minRandom + 1;
    const baseCount = Math.floor(this.totalCells / allowedCount);
    const remainder = this.totalCells % allowedCount;
    let values = [];

    for (let num = this.minRandom; num <= this.maxRandom; num++) {
      for (let i = 0; i < baseCount; i++) {
        values.push(num);
      }
    }
    // Distribute any remainder among the smallest numbers.
    for (let num = this.minRandom; num < this.minRandom + remainder; num++) {
      values.push(num);
    }
    return values;
  }

  // Shuffle an array using the Fisher-Yates algorithm.
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Enforce that no math problem (same operand and operator) repeats within the previous 'repetitionWindow' problems.
  enforceNoRepetitionWithin(problems) {
    for (let i = 0; i < problems.length; i++) {
      for (let j = Math.max(0, i - this.repetitionWindow); j < i; j++) {
        if (problems[j].operand === problems[i].operand && problems[j].op === problems[i].op) {
          // Try to swap with a candidate later in the array.
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

  /**
   * Formats a math problem in vertical layout.
   * @param {object} problem - An object with properties: { operand, op }.
   * @returns {string} The HTML string for the problem.
   */
  formatVerticalHTML(problem) {
    let topOperand, bottomOperand, symbol;
    const op = problem.op;
    const r = problem.operand;
    switch (op) {
      case "addition":
        symbol = "+";
        // Randomize the order for addition.
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
        // Ensure the larger number is on top.
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
        // Randomize the order.
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
        // Always use constant as the divisor: dividend = constant × operand.
        topOperand = this.constant * r;
        bottomOperand = this.constant;
        break;
      default:
        // Fallback to addition if operator doesn't match.
        symbol = "+";
        topOperand = this.constant;
        bottomOperand = r;
        break;
    }
    return `
      <div class="fact">
        <div class="operand">${topOperand.toString().padStart(2, ' ')}</div>
        <div class="operand">${symbol} ${bottomOperand.toString().padStart(2, ' ')}</div>
        <hr class="line">
      </div>
    `;
  }

  // Generate the table HTML (using a DocumentFragment) and store the final problems.
  generateTableHTML() {
    let evenNumbers = this.buildEvenDistributionArray();
    this.shuffleArray(evenNumbers);
    // Build an array of math problems. Each cell gets an object: { operand, op }.
    let problems = [];
    for (let i = 0; i < evenNumbers.length; i++) {
      const randIndex = Math.floor(Math.random() * this.allowedOps.length);
      const op = this.allowedOps[randIndex];
      problems.push({ operand: evenNumbers[i], op: op });
    }
    // Enforce that the same problem (same operand and operator) isn’t repeated within the last 'repetitionWindow' cells.
    this.enforceNoRepetitionWithin(problems);
    this.finalProblems = problems;
  
    const fragment = document.createDocumentFragment();
    let index = 0;
    for (let i = 0; i < this.rows; i++) {
      const row = document.createElement("tr");
      for (let j = 0; j < this.columns; j++) {
        const cell = document.createElement("td");
        cell.innerHTML = this.formatVerticalHTML(problems[index]);
        index++;
        row.appendChild(cell);
      }
      fragment.appendChild(row);
    }
    return fragment;
  }
}

// Global function to generate the table and update the distribution graph.
function generateTable() {
  const constantInput = document.getElementById("constantValue");
  const pageCountInput = document.getElementById("pageCount");
  let constant = parseInt(constantInput.value, 10);
  let pageCount = parseInt(pageCountInput.value, 10);

  // Validate inputs.
  if (isNaN(constant) || constant < 1 || constant > 12) {
    constant = 4;
    constantInput.value = 4;
  }
  if (isNaN(pageCount) || pageCount < 1) {
    pageCount = 1;
    pageCountInput.value = 1;
  }
  // Each page is 11 rows.
  const rows = pageCount * 11;
  const columns = 10;

  // Get allowed operators from the checkboxes.
  const opCheckboxes = document.querySelectorAll('input[name="operators"]:checked');
  let allowedOps = Array.from(opCheckboxes).map(cb => cb.value);
  if (allowedOps.length === 0) {
    allowedOps = ["addition"];
  }
  // Log the currently allowed operators for debugging.
  console.log("Allowed Operators:", allowedOps);
  
  const tableBody = document.getElementById("mathTableBody");
  tableBody.innerHTML = "";
  
  // Create the MathFactTable instance.
  const table = new MathFactTable(constant, rows, allowedOps, 4, 12, columns, 5);
  const fragment = table.generateTableHTML();
  
  // Build the ASCII distribution graph based on the generated operand frequency.
  let freq = {};
  for (let num = table.minRandom; num <= table.maxRandom; num++) {
    freq[num] = 0;
  }
  for (let p of table.finalProblems) {
    freq[p.operand]++;
  }
  let graphText = "";
  for (let num = table.minRandom; num <= table.maxRandom; num++) {
    graphText += num + ": " + "*".repeat(freq[num]) + "\n";
  }
  document.getElementById("distributionGraph").innerText = graphText;
  
  tableBody.appendChild(fragment);
}

document.getElementById("submitButton").addEventListener("click", generateTable);
window.onload = generateTable;
