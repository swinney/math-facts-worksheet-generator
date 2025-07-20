class MathFactTable {
  constructor(options = {}) {
    this.baseNumbers = options.baseNumbers || [4];
    this.rows = options.rows || 11;
    this.allowedOps = options.allowedOps || ['addition'];
    this.minRandom = options.minRandom || 2;
    this.maxRandom = options.maxRandom || 12;
    this.columns = options.columns || 10;
    this.repetitionWindow = options.repetitionWindow || 5;
    this.hardProblemsOnly = options.hardProblemsOnly || false;
    this.noRepeatProblems = options.noRepeatProblems || false;
    this.doubleDigitOperands = options.doubleDigitOperands || false;
    this.totalCells = this.rows * this.columns;
    this.finalProblems = [];
    
    this.easyNumbers = new Set([0, 1, 2, 5, 10]);
  }

  static get OPERATIONS() {
    return {
      ADDITION: 'addition',
      SUBTRACTION: 'subtraction', 
      MULTIPLICATION: 'multiplication',
      DIVISION: 'division'
    };
  }

  static get SYMBOLS() {
    return {
      [this.OPERATIONS.ADDITION]: '+',
      [this.OPERATIONS.SUBTRACTION]: '−',
      [this.OPERATIONS.MULTIPLICATION]: '×',
      [this.OPERATIONS.DIVISION]: '÷'
    };
  }

  getFilteredNumbers() {
    let numbers = [];
    const maxRange = this.doubleDigitOperands ? 99 : this.maxRandom;
    
    for (let num = this.minRandom; num <= maxRange; num++) {
      if (this.hardProblemsOnly && this.easyNumbers.has(num)) {
        continue;
      }
      numbers.push(num);
    }
    return numbers;
  }

  buildEvenDistributionArray() {
    const allowedNumbers = this.getFilteredNumbers();
    if (allowedNumbers.length === 0) {
      throw new Error('No valid numbers available with current settings');
    }
    
    const baseCount = Math.floor(this.totalCells / allowedNumbers.length);
    const remainder = this.totalCells % allowedNumbers.length;
    let values = [];

    for (const num of allowedNumbers) {
      for (let i = 0; i < baseCount; i++) {
        values.push(num);
      }
    }
    
    for (let i = 0; i < remainder; i++) {
      values.push(allowedNumbers[i]);
    }
    
    return values;
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  hasConflictInWindow(problems, index, operand, operation) {
    const start = Math.max(0, index - this.repetitionWindow);
    for (let j = start; j < index; j++) {
      if (problems[j].operand === operand && problems[j].operation === operation) {
        return true;
      }
    }
    return false;
  }

  enforceNoRepetitionWithin(problems) {
    for (let i = 0; i < problems.length; i++) {
      const { operand, operation } = problems[i];
      
      if (this.hasConflictInWindow(problems, i, operand, operation)) {
        for (let k = i + 1; k < problems.length; k++) {
          const { operand: kOperand, operation: kOperation } = problems[k];
          if (!this.hasConflictInWindow(problems, i, kOperand, kOperation)) {
            [problems[i], problems[k]] = [problems[k], problems[i]];
            break;
          }
        }
      }
    }
  }

  createProblemOperands(baseNumber, randomOperand, operation) {
    const ops = MathFactTable.OPERATIONS;
    
    switch (operation) {
      case ops.ADDITION:
        return Math.random() < 0.5 
          ? { top: baseNumber, bottom: randomOperand }
          : { top: randomOperand, bottom: baseNumber };
          
      case ops.SUBTRACTION:
        return baseNumber >= randomOperand
          ? { top: baseNumber, bottom: randomOperand }
          : { top: randomOperand, bottom: baseNumber };
          
      case ops.MULTIPLICATION:
        return Math.random() < 0.5
          ? { top: baseNumber, bottom: randomOperand }
          : { top: randomOperand, bottom: baseNumber };
          
      case ops.DIVISION:
        return { top: baseNumber * randomOperand, bottom: baseNumber };
        
      default:
        return { top: baseNumber, bottom: randomOperand };
    }
  }

  formatVerticalHTML(problem) {
    const { operation, operand: randomOperand, baseNumber } = problem;
    const { top, bottom } = this.createProblemOperands(baseNumber, randomOperand, operation);
    const symbol = MathFactTable.SYMBOLS[operation] || '+';
    
    const paddingLength = this.doubleDigitOperands ? 3 : 2;
    
    return `
      <div class="fact">
        <div class="top-operand">${String(top).padStart(paddingLength, ' ')}</div>
        <div class="bottom-operand">${symbol} ${String(bottom).padStart(paddingLength, ' ')}</div>
        <hr class="line">
      </div>
    `;
  }

  createProblemKey(baseNumber, operand, operation) {
    const { top, bottom } = this.createProblemOperands(baseNumber, operand, operation);
    return `${top}-${operation}-${bottom}`;
  }

  getFilteredBaseNumbers() {
    if (!this.hardProblemsOnly) {
      return this.baseNumbers;
    }
    
    return this.baseNumbers.filter(num => !this.easyNumbers.has(num));
  }

  generateUniqueProblems() {
    const problems = [];
    const usedProblems = new Set();
    const maxAttempts = this.totalCells * 10;
    let attempts = 0;
    
    const filteredBaseNumbers = this.getFilteredBaseNumbers();
    const filteredRandomNumbers = this.getFilteredNumbers();
    
    if (filteredBaseNumbers.length === 0) {
      throw new Error('No valid base numbers available with hard problems only setting');
    }

    while (problems.length < this.totalCells && attempts < maxAttempts) {
      attempts++;
      
      const operation = this.allowedOps[Math.floor(Math.random() * this.allowedOps.length)];
      const baseNumber = filteredBaseNumbers[Math.floor(Math.random() * filteredBaseNumbers.length)];
      const operand = filteredRandomNumbers[Math.floor(Math.random() * filteredRandomNumbers.length)];
      
      const problemKey = this.createProblemKey(baseNumber, operand, operation);
      
      if (!usedProblems.has(problemKey)) {
        usedProblems.add(problemKey);
        problems.push({ operand, operation, baseNumber });
      }
    }

    if (problems.length < this.totalCells) {
      throw new Error(`Could only generate ${problems.length} unique problems out of ${this.totalCells} requested. Try reducing worksheet size or enabling more options.`);
    }

    return problems;
  }

  generateProblems() {
    if (this.noRepeatProblems) {
      return this.generateUniqueProblems();
    }

    const randomOperands = this.shuffleArray(this.buildEvenDistributionArray());
    const filteredBaseNumbers = this.getFilteredBaseNumbers();
    const problems = [];
    
    if (filteredBaseNumbers.length === 0) {
      throw new Error('No valid base numbers available with hard problems only setting');
    }

    for (let i = 0; i < randomOperands.length; i++) {
      const operation = this.allowedOps[Math.floor(Math.random() * this.allowedOps.length)];
      const baseNumber = filteredBaseNumbers[Math.floor(Math.random() * filteredBaseNumbers.length)];
      
      problems.push({ 
        operand: randomOperands[i], 
        operation, 
        baseNumber 
      });
    }

    this.enforceNoRepetitionWithin(problems);
    return problems;
  }

  createPageHTML(pageProblems, pageNumber) {
    const pageDiv = document.createElement("div");
    pageDiv.className = "worksheet-page";
    
    const table = document.createElement("table");
    const tbody = document.createElement("tbody");
    
    let problemIndex = 0;
    const rowsPerPage = 10;
    const columnsPerPage = 10;
    
    for (let i = 0; i < rowsPerPage; i++) {
      const row = document.createElement("tr");
      for (let j = 0; j < columnsPerPage; j++) {
        const cell = document.createElement("td");
        if (problemIndex < pageProblems.length) {
          cell.innerHTML = this.formatVerticalHTML(pageProblems[problemIndex]);
        } else {
          // Fill empty cells if needed
          cell.innerHTML = '<div class="fact empty-cell"></div>';
        }
        row.appendChild(cell);
        problemIndex++;
      }
      tbody.appendChild(row);
    }
    
    table.appendChild(tbody);
    pageDiv.appendChild(table);
    
    return pageDiv;
  }

  generateTableHTML() {
    this.finalProblems = this.generateProblems();
    const fragment = document.createDocumentFragment();
    
    const problemsPerPage = 100;
    const totalPages = Math.ceil(this.finalProblems.length / problemsPerPage);
    
    for (let pageNum = 0; pageNum < totalPages; pageNum++) {
      const startIndex = pageNum * problemsPerPage;
      const endIndex = Math.min(startIndex + problemsPerPage, this.finalProblems.length);
      const pageProblems = this.finalProblems.slice(startIndex, endIndex);
      
      const pageElement = this.createPageHTML(pageProblems, pageNum + 1);
      fragment.appendChild(pageElement);
    }
    
    return fragment;
  }
}

function getSelectedBaseNumbers() {
  const checkboxes = document.querySelectorAll('input[name="baseNumbers"]:checked');
  return Array.from(checkboxes).map(cb => parseInt(cb.value, 10));
}

function getSelectedOperations() {
  const checkboxes = document.querySelectorAll('input[name="operators"]:checked');
  return Array.from(checkboxes).map(cb => cb.value);
}

function validateAndGetPageCount() {
  const pageCountInput = document.getElementById("pageCount");
  let pageCount = parseInt(pageCountInput.value, 10);
  
  if (isNaN(pageCount) || pageCount < 1) {
    pageCount = 1;
    pageCountInput.value = 1;
  }
  
  return pageCount;
}

function generateTable() {
  try {
    const baseNumbers = getSelectedBaseNumbers();
    const operations = getSelectedOperations();
    const pageCount = validateAndGetPageCount();
    const hardProblemsOnly = document.getElementById("hardProblemsOnly")?.checked || false;
    const noRepeatProblems = document.getElementById("noRepeatProblems")?.checked || false;
    const doubleDigitOperands = document.getElementById("doubleDigitOperands")?.checked || false;

    if (baseNumbers.length === 0) {
      alert("Please select at least one base number.");
      return;
    }

    if (operations.length === 0) {
      alert("Please select at least one operation.");
      return;
    }

    const options = {
      baseNumbers,
      rows: pageCount * 10,
      allowedOps: operations,
      minRandom: 2,
      maxRandom: 12,
      columns: 10,
      repetitionWindow: 5,
      hardProblemsOnly,
      noRepeatProblems,
      doubleDigitOperands
    };

    const tableBody = document.getElementById("mathTableBody");
    tableBody.innerHTML = "";

    const table = new MathFactTable(options);
    tableBody.appendChild(table.generateTableHTML());
  } catch (error) {
    alert(`Error generating table: ${error.message}`);
  }
}

function handleSelectAllBaseNumbers() {
  const selectAllCheckbox = document.getElementById("selectAllBaseNumbers");
  const baseNumberCheckboxes = document.querySelectorAll('input[name="baseNumbers"]');
  
  baseNumberCheckboxes.forEach(checkbox => {
    checkbox.checked = selectAllCheckbox.checked;
  });
}

function updateSelectAllState() {
  const selectAllCheckbox = document.getElementById("selectAllBaseNumbers");
  const baseNumberCheckboxes = document.querySelectorAll('input[name="baseNumbers"]');
  const checkedBoxes = document.querySelectorAll('input[name="baseNumbers"]:checked');
  
  if (checkedBoxes.length === baseNumberCheckboxes.length) {
    selectAllCheckbox.checked = true;
    selectAllCheckbox.indeterminate = false;
  } else if (checkedBoxes.length === 0) {
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = false;
  } else {
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = true;
  }
}

document.getElementById("submitButton").addEventListener("click", generateTable);
document.getElementById("pdfButton").addEventListener("click", () => window.print());
document.getElementById("selectAllBaseNumbers").addEventListener("change", handleSelectAllBaseNumbers);

document.querySelectorAll('input[name="baseNumbers"]').forEach(checkbox => {
  checkbox.addEventListener("change", updateSelectAllState);
});

window.onload = () => {
  generateTable();
  updateSelectAllState();
};
