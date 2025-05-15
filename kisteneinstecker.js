document.addEventListener('DOMContentLoaded', function(){
    const fachNummerInput = document.querySelector('.fach-nummer');
    const okButton = document.querySelector('.ok-button');
    const numberButtons = document.querySelectorAll('.number-button');
    const printButtons = document.querySelectorAll('.print-button');



    function processScan() {
        const barcodeValue = fachNummerInput.value.trim();
        fachNummerInput.value = '';
        console.log("searching for ID:", barcodeValue);
        console.log("Type of searched ID:", typeof barcodeValue)
    }


    // Function to handle number button clicks
    function handleNumberButtonClick(e) {
        const value = e.target.getAttribute('data-value');
        
        if (value === 'clear') {
            //kundeNummerInput.value = '';
            fachNummerInput.value = fachNummerInput.value.slice(0,-1);
        } else if (value === 'enter' || value === 'ok') {
            processScan();
            console.log(`entered value ${fachNummerInput.value || 'None'}`)

        } else {
            fachNummerInput.value += value;
        }
        
        // Focus back on the input
        fachNummerInput.focus();
    }

    // Add event listeners to number buttons
    numberButtons.forEach(button => {
        button.addEventListener('click', handleNumberButtonClick);
    });

    okButton.addEventListener('click', processScan);
    
    
    // Add event listeners to print buttons
    //printButtons.forEach(button => {
    //    button.addEventListener('click', handlePrintButtonClick);
    //});

});