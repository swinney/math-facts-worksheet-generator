# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a simple vanilla JavaScript web application that generates customizable math facts worksheets. The app creates printable math problem sheets for elementary school students to practice arithmetic operations. It's hosted at https://mathfor.fun and was originally built using ChatGPT to help with a daughter's math facts practice.

## Development Commands

This is a static HTML/CSS/JavaScript project with no build system or package.json. Development is straightforward:

- **Local development**: Open `index.html` directly in a browser or use a simple HTTP server
- **Testing**: Manual testing in browser - no automated test framework
- **Deployment**: Static files can be deployed to any web server (currently on AWS Amplify)

## Architecture

### Core Components

**MathFactTable Class** (`script.js:1-139`)
- Main class that generates math problems
- Handles even distribution of operands across the worksheet
- Implements anti-repetition logic to avoid consecutive identical problems
- Supports all four basic operations: addition, subtraction, multiplication, division

**Key Methods:**
- `buildEvenDistributionArray()`: Ensures balanced distribution of random operands
- `enforceNoRepetitionWithin()`: Prevents identical problems within a 5-problem window
- `formatVerticalHTML()`: Creates vertical math problem layout for printing
- `generateTableHTML()`: Builds the complete worksheet table

### Application Logic

**Configuration Options:**
- Constant operand (1-12): The number that appears in every problem
- Page count: Each page contains 11 rows × 10 columns = 110 problems
- Operations: Addition, subtraction, multiplication, division (can select multiple)
- Random operand range: 2-12 (hardcoded)

**Problem Generation Strategy:**
1. Creates even distribution of random operands (2-12)
2. Randomly assigns operations from selected types
3. Shuffles the array to randomize order
4. Applies anti-repetition constraints
5. Formats problems in vertical layout for traditional worksheet appearance

### File Structure

- `index.html`: Main page with controls and table container
- `script.js`: All JavaScript logic in a single file
- `styles.css`: Styling optimized for print with Courier New font
- `README.md`: Project description and background story

### Print Optimization

The application is specifically designed for printing:
- Uses monospace font (Courier New) for alignment
- Controls are hidden in print media queries
- Vertical problem format matches traditional worksheets
- PDF generation via browser's print dialog

## Domain-Specific Notes

- Division problems are structured so the dividend is always the constant × divisor to ensure whole number answers
- Subtraction problems ensure the larger number is always the minuend to avoid negative results
- The "repetition window" of 5 prevents students from encountering the same problem type consecutively
- Page layout assumes standard 8.5×11" paper with 11 rows fitting comfortably