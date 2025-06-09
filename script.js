document.addEventListener('DOMContentLoaded', () => {
    const resultDiv = document.getElementById('output-row');
    let input = '0'; 

    // Handle button click events
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            const buttonText = e.target.textContent;

            // If it's a number or operator, add it to the input
            if (!isNaN(buttonText) || buttonText === '.' || buttonText === 'π' || buttonText === 'e') {
                input += buttonText === 'π' ? Math.PI : buttonText === 'e' ? Math.E : buttonText;
                resultDiv.textContent = input;
            } 
            // If it's an operator, append it to the input
            else if (buttonText === '+' || buttonText === '-' || buttonText === 'x' || buttonText === '/' || buttonText === '%' || buttonText === '^') {
                input += ' ' + buttonText + ' ';
                resultDiv.textContent = input;
            }
            
            else if (buttonText === 'C') {
                input = input.slice(0, -1); // remoove the last element
                resultDiv.textContent = input;
            }
            // Handle All Clear button (AC)
            else if (buttonText === 'AC') {
                input = '';
                resultDiv.textContent = input;
            }
            // Handle the equal button (=)
            else if (buttonText === '=') {
                try {
                    // Evaluate the input
                    input = eval(input.replace('x', '*').replace('%', '/100').replace('^', '**'));
                    resultDiv.textContent = input;
                } catch (error) {
                    resultDiv.textContent = 'Error';
                    input = '';
                }
            }
            // Implement additional operations for functions like sqrt, log, etc. here.
            else if (buttonText === '√') {
                input = Math.sqrt(parseFloat(input));
                resultDiv.textContent = input;
            } 
            else if (buttonText === 'log') {
                input = Math.log10(parseFloat(input));
                resultDiv.textContent = input;
            }
            else if (buttonText === 'ln') {
                input = Math.log(parseFloat(input));
                resultDiv.textContent = input;
            }
            else if (buttonText === 'sin') {
                input = Math.sin(parseFloat(input));
                resultDiv.textContent = input;
            }
            else if (buttonText === 'cos') {
                input = Math.cos(parseFloat(input));
                resultDiv.textContent = input;
            }
            else if (buttonText === 'tan') {
                input = Math.tan(parseFloat(input));
                resultDiv.textContent = input;
            }
            else if (buttonText === 'sin⁻¹') {
                input = Math.asin(parseFloat(input));
                resultDiv.textContent = input;
            }
            else if (buttonText === 'cos⁻¹') {
                input = Math.acos(parseFloat(input));
                resultDiv.textContent = input;
            }
            else if (buttonText === 'tan⁻¹') {
                input = Math.atan(parseFloat(input));
                resultDiv.textContent = input;
            }
            else if (buttonText === '!') {
                input = factorial(parseInt(input));
                resultDiv.textContent = input;
            }
        });
    });

    // Factorial function for the '!' button
    function factorial(n) {
        if (n === 0 || n === 1) {
            return 1;
        }
        return n * factorial(n - 1);
    }
});
