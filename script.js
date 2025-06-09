document.addEventListener('DOMContentLoaded', () => {
    const inputDiv = document.getElementById('input-row');
    const outputDiv = document.getElementById('output-row');
    let currentInput = '';
    let currentOutput = '0';
    let pendingFunction = null;
    let calculationPerformed = false;
    let waitingForOperand = false;

    // Update display function
    function updateDisplay() {
        inputDiv.textContent = currentInput;
        outputDiv.textContent = currentOutput;
    }

    // Initialize display
    updateDisplay();

    // Handle button click events
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            const buttonText = e.target.textContent;

            // If calculation was just performed and a new number is entered, reset
            if (calculationPerformed && (!isNaN(buttonText) || buttonText === '.' || buttonText === 'π' || buttonText === 'e')) {
                if (!waitingForOperand) {
                    currentInput = '';
                    currentOutput = '0';
                    calculationPerformed = false;
                }
            }

            // If it's a number or decimal point
            if (!isNaN(buttonText) || buttonText === '.') {
                if (waitingForOperand) {
                    // If we're waiting for an operand after a function, start fresh
                    currentOutput = buttonText === '.' ? '0.' : buttonText;
                    waitingForOperand = false;
                    
                    // If there's a pending function, apply it later
                    if (pendingFunction) {
                        currentInput = pendingFunction + '(' + currentOutput;
                    } else {
                        // Otherwise just update the input
                        if (calculationPerformed) {
                            currentInput = buttonText;
                        } else {
                            currentInput += buttonText;
                        }
                    }
                    calculationPerformed = false;
                } else {
                    // Normal number entry
                    if (currentOutput === '0' && buttonText !== '.') {
                        currentOutput = buttonText;
                    } else {
                        currentOutput += buttonText;
                    }
                    
                    if (calculationPerformed) {
                        currentInput = buttonText;
                        calculationPerformed = false;
                    } else {
                        currentInput += buttonText;
                    }
                }
            } 
            // If it's a constant (π or e)
            else if (buttonText === 'π' || buttonText === 'e') {
                const value = buttonText === 'π' ? Math.PI : Math.E;
                
                if (waitingForOperand && pendingFunction) {
                    // If we're waiting for an operand after a function
                    currentOutput = value.toString();
                    currentInput = pendingFunction + '(' + buttonText;
                    waitingForOperand = false;
                } else {
                    currentOutput = value.toString();
                    if (calculationPerformed) {
                        currentInput = buttonText;
                        calculationPerformed = false;
                    } else {
                        currentInput += buttonText;
                    }
                }
            }
            // If it's a basic operator
            else if (buttonText === '+' || buttonText === '-' || buttonText === 'x' || buttonText === '/' || buttonText === '^') {
                // If there was a pending function, complete it first
                if (pendingFunction && !waitingForOperand) {
                    calculateFunction();
                }
                
                pendingFunction = null;
                waitingForOperand = false;
                currentInput += ' ' + buttonText + ' ';
                calculationPerformed = false;
            }
            // Handle parentheses
            else if (buttonText === '(' || buttonText === ')') {
                // Add parentheses directly to the input
                currentInput += buttonText;
                calculationPerformed = false;
            }
            // Handle percentage
            else if (buttonText === '%') {
                if (pendingFunction && waitingForOperand) {
                    // Can't use % as first operand of a function
                    return;
                }
                
                // Percentage works in two ways:
                // 1. As a standalone operation (convert to decimal): 5% = 0.05
                // 2. As part of an expression: 100 + 5% = 100 + 5% of 100 = 105
                if (currentInput.includes('+') || currentInput.includes('-') || 
                    currentInput.includes('x') || currentInput.includes('/')) {
                    // Part of an expression - keep the % symbol for later evaluation
                    currentInput += ' % ';
                } else {
                    // Standalone - convert to decimal immediately
                    const value = parseFloat(currentOutput) / 100;
                    currentOutput = value.toString();
                    currentInput = value.toString();
                }
                calculationPerformed = true;
            }
            // Handle backspace (C)
            else if (buttonText === 'C') {
                if (waitingForOperand && pendingFunction) {
                    // Cancel the pending function
                    pendingFunction = null;
                    waitingForOperand = false;
                    currentInput = '';
                    currentOutput = '0';
                } else if (currentInput.length > 0) {
                    // Remove the last character or operator with spaces
                    if (currentInput.endsWith(' ')) {
                        currentInput = currentInput.slice(0, -3); // Remove operator with spaces
                    } else {
                        currentInput = currentInput.slice(0, -1); // Remove single character
                    }
                    
                    // Update output based on the new input
                    if (currentInput === '') {
                        currentOutput = '0';
                    } else {
                        // Try to get the last number in the expression
                        const parts = currentInput.split(' ');
                        const lastPart = parts[parts.length - 1];
                        if (!isNaN(lastPart) || lastPart === 'π' || lastPart === 'e') {
                            currentOutput = lastPart === 'π' ? Math.PI.toString() : 
                                          lastPart === 'e' ? Math.E.toString() : lastPart;
                        }
                    }
                }
            }
            // Handle All Clear button (AC)
            else if (buttonText === 'AC') {
                currentInput = '';
                currentOutput = '0';
                pendingFunction = null;
                waitingForOperand = false;
                calculationPerformed = false;
            }
            // Handle the equal button (=)
            else if (buttonText === '=') {
                // If there's a pending function, calculate it first
                if (pendingFunction && !waitingForOperand) {
                    calculateFunction();
                    pendingFunction = null;
                    waitingForOperand = false;
                } else {
                    try {
                        // Save the expression for display
                        const expression = currentInput;
                        
                        // Prepare the expression for evaluation
                        let evalExpression = currentInput
                            .replace(/π/g, Math.PI.toString())
                            .replace(/e/g, Math.E.toString())
                            .replace(/x/g, '*')
                            .replace(/\^/g, '**');
                            
                        // Make sure parentheses are properly balanced
                        let openParenCount = (evalExpression.match(/\(/g) || []).length;
                        let closeParenCount = (evalExpression.match(/\)/g) || []).length;
                        
                        // Add missing closing parentheses if needed
                        if (openParenCount > closeParenCount) {
                            evalExpression += ')'.repeat(openParenCount - closeParenCount);
                        }
                        
                        // Handle percentage in expressions
                        if (evalExpression.includes('%')) {
                            // Split by operators to handle percentages
                            const parts = evalExpression.split(/([+\-*/])/);
                            for (let i = 0; i < parts.length; i++) {
                                if (parts[i].includes('%')) {
                                    const percentValue = parseFloat(parts[i]) / 100;
                                    
                                    // If it's part of an expression like "100 + 5%", calculate 5% of 100
                                    if (i >= 2) {
                                        const baseValue = parseFloat(parts[i-2]);
                                        parts[i] = (baseValue * percentValue).toString();
                                    } else {
                                        parts[i] = percentValue.toString();
                                    }
                                }
                            }
                            evalExpression = parts.join('');
                        }
                        
                        // Evaluate the expression
                        const result = eval(evalExpression);
                        
                        // Update display
                        currentOutput = result.toString();
                        currentInput = expression + ' = ' + result;
                        calculationPerformed = true;
                    } catch (error) {
                        currentOutput = 'Error';
                        calculationPerformed = true;
                    }
                }
            }
            // Scientific functions
            else if (['√', 'log', 'sin', 'cos', 'tan', 'sin⁻¹', 'cos⁻¹', 'tan⁻¹', '!'].includes(buttonText)) {
                if (buttonText === '!') {
                    // Factorial is applied immediately to the current value
                    try {
                        const value = parseFloat(currentOutput);
                        if (value < 0 || !Number.isInteger(value)) {
                            throw new Error("Factorial only defined for non-negative integers");
                        }
                        const result = factorial(value);
                        currentOutput = result.toString();
                        currentInput += '!';
                        calculationPerformed = true;
                    } catch (error) {
                        currentOutput = 'Error: ' + error.message;
                        calculationPerformed = true;
                    }
                } else {
                    // For other functions, we set them as pending and wait for the operand
                    pendingFunction = buttonText;
                    waitingForOperand = true;
                    // Don't change the current output yet, wait for the operand
                    
                    // If we already have a value, we can show it in the input display
                    if (currentOutput !== '0' && !calculationPerformed) {
                        currentInput = buttonText + '(' + currentOutput;
                    } else {
                        currentInput = buttonText + '(';
                    }
                }
            }
            
            // Update the display
            updateDisplay();
        });
    });

    // Function to calculate the result of a pending function
    function calculateFunction() {
        if (!pendingFunction) return;
        
        try {
            const value = parseFloat(currentOutput);
            let result;
            
            // Apply the appropriate mathematical function
            switch (pendingFunction) {
                case '√':
                    if (value < 0) throw new Error("Cannot calculate square root of negative number");
                    result = Math.sqrt(value);
                    currentInput = `√(${currentOutput})`;
                    break;
                case 'log':
                    if (value <= 0) throw new Error("Cannot calculate log of non-positive number");
                    result = Math.log10(value);
                    currentInput = `log(${currentOutput})`;
                    break;

                case 'sin':
                    // Convert to radians if needed
                    result = Math.sin(value);
                    currentInput = `sin(${currentOutput})`;
                    break;
                case 'cos':
                    result = Math.cos(value);
                    currentInput = `cos(${currentOutput})`;
                    break;
                case 'tan':
                    result = Math.tan(value);
                    currentInput = `tan(${currentOutput})`;
                    break;
                case 'sin⁻¹':
                    if (value < -1 || value > 1) throw new Error("Domain error: value must be between -1 and 1");
                    result = Math.asin(value);
                    currentInput = `sin⁻¹(${currentOutput})`;
                    break;
                case 'cos⁻¹':
                    if (value < -1 || value > 1) throw new Error("Domain error: value must be between -1 and 1");
                    result = Math.acos(value);
                    currentInput = `cos⁻¹(${currentOutput})`;
                    break;
                case 'tan⁻¹':
                    result = Math.atan(value);
                    currentInput = `tan⁻¹(${currentOutput})`;
                    break;
            }
            
            currentOutput = result.toString();
            calculationPerformed = true;
        } catch (error) {
            currentOutput = 'Error: ' + error.message;
            calculationPerformed = true;
        }
        
        // Clear the pending function
        pendingFunction = null;
        waitingForOperand = false;
    }

    // Factorial function for the '!' button
    function factorial(n) {
        if (n === 0 || n === 1) {
            return 1;
        }
        // Use iteration instead of recursion to avoid stack overflow for large numbers
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }
});
