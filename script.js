const resultDisplay = document.getElementById("result");
let currentInput = "";

// Function to handle button clicks
document.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", (event) => {
        const value = event.target.textContent;

        if (value === "=") {
            // Evaluate the expression
            try {
                currentInput = evaluateExpression(currentInput);
                resultDisplay.value = currentInput;
            } catch (e) {
                resultDisplay.value = "Error";
                currentInput = "";
            }
        } else if (value === "AC") {
            // Clear the display
            currentInput = "";
            resultDisplay.value = "";
        } else if (value === "C") {
            // Remove the last character
            currentInput = currentInput.slice(0, -1);
            resultDisplay.value = currentInput;
        } else {
            // Append value to current input
            currentInput += value;
            resultDisplay.value = currentInput;
        }
    });
});

// Function to evaluate mathematical expressions
function evaluateExpression(expression) {
    // Handle mathematical operations and functions
    expression = expression.replace(/x/g, "*")
                           .replace(/\^/g, "**")
                           .replace(/log/g, "Math.log10")
                           .replace(/ln/g, "Math.log")
                           .replace(/sqrt/g, "Math.sqrt")
                           .replace(/abs/g, "Math.abs")
                           .replace(/exp/g, "Math.exp")
                           .replace(/pi/g, "Math.PI")
                           .replace(/!/, "factorial");

    // Evaluate expression
    try {
        return eval(expression);
    } catch (e) {
        return "Error";
    }
}

// Factorial function
function factorial(n) {
    if (n < 0) return 0;
    return (n === 0) ? 1 : n * factorial(n - 1);
}
