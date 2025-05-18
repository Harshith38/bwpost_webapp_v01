document.addEventListener('DOMContentLoaded', function() {
    // Initialize the app
    const kundeNummerInput = document.getElementById('kunde-nummer');
    const statusLabel = document.querySelector('.status-label');
    const currentCustomerLabel = document.querySelector('.current-customer-label');
    const previousCustomerLabel = document.querySelector('.previous-customer-label');
    const currentCustomerNumLabel = document.querySelector('.current-customer-number');
    const previousCustomerNumLabel = document.querySelector('.previous-customer-number');
    const okButton = document.querySelector('.ok-button');
    const numberButtons = document.querySelectorAll('.number-button');
    const printButtons = document.querySelectorAll('.print-button');

    let customerData = []; // To store data from customers.json
    let currentCustomer = null;
    let previousCustomer = null;
    let currentCustomerNumber = null;
    let previousCustomerNumber = null;
    let verificationMode = false;

    // Function to load the JSON data
    async function loadCustomerData() {
        try {
            const response = await fetch('customers.json');
            customerData = await response.json();
            console.log('Customer data loaded:', customerData.length, 'customers');
            const firstCustomer = customerData[0];
            console.log('Customer Id:', firstCustomer.ID, 'Customer Name: ', firstCustomer.CustomerName)
        } catch (error) {
            console.error('Error loading customer data:', error);
            statusLabel.textContent = 'Failed to load customer data.';
        }
    }

    function processScan() {
        const barcodeValue = kundeNummerInput.value.trim();
        kundeNummerInput.value = '';
        console.log("searching for ID:", barcodeValue);
        console.log("Type of searched ID:", typeof barcodeValue);

        if (!barcodeValue) {
            statusLabel.textContent = 'Bitte scannen Sie einen Kundenbarcode';
            return;
        }

        if (verificationMode) {
            verifyLabel(barcodeValue);
            return;
        }

        // Convert barcodeValue to a number before comparing
        const barcodeNumber = parseInt(barcodeValue, 10); // 10 specifies decimal radix

        // Find customer by ID
        const customerMatch = customerData.find(customer => customer.ID === barcodeNumber);

        console.log("customerMatch", customerMatch);

        if (customerMatch) {
            // Update previous customer
            if (currentCustomer) {
                previousCustomer = currentCustomer;
                previousCustomerNumber = currentCustomerNumber;
                previousCustomerLabel.textContent = previousCustomer;
                previousCustomerNumLabel.textContent = previousCustomerNumber;
            }

            // Update current customer
            currentCustomer = customerMatch.CustomerName;
            currentCustomerNumber = customerMatch.ID;
            currentCustomerLabel.textContent = currentCustomer;
            currentCustomerNumLabel.textContent = currentCustomerNumber;

            // Enable verification mode
            verificationMode = true;
            statusLabel.textContent = 'Scannen Sie das gedruckte Etikett, um zu überprüfen';
            statusLabel.style.backgroundColor = 'Yellow';
            statusLabel.style.color = 'black';
        } else {
            statusLabel.textContent = `Kein Kunde für Barcode: ${barcodeValue} gefunden!!`
            statusLabel.style.backgroundColor = 'Red';
            statusLabel.style.color = 'White';;
        }
    }

    function verifyLabel(barcodeValue) {
        const barcodeNumber = parseInt(barcodeValue, 10); // 10 specifies decimal radix
        // Find customer by barcode
        const customerMatch = customerData.find(customer => customer.ID === barcodeNumber);

        if (customerMatch) {
            const verifiedCustomer = customerMatch.CustomerName;
            if (verifiedCustomer === currentCustomer) {
                statusLabel.textContent = 'Verifizierung erfolgreich! Bereit für den nächsten Scan.';
                statusLabel.style.backgroundColor = 'Green';
                statusLabel.style.color = 'White';
                verificationMode = false;
            } else {
                statusLabel.textContent = 'Fehler! Der Kunde stimmt nicht überein.';
                statusLabel.style.backgroundColor = 'Red';
                statusLabel.style.color = 'White';
            }
        } else {
            statusLabel.textContent = `Kein Kunde für Barcode: ${barcodeNumber} gefunden!!`
            statusLabel.style.backgroundColor = 'Red';
            statusLabel.style.color = 'White';;
        }
    }

    // Function to handle number button clicks
    function handleNumberButtonClick(e) {
        const value = e.target.getAttribute('data-value');
        
        if (value === 'clear') {
            //kundeNummerInput.value = '';
            kundeNummerInput.value = kundeNummerInput.value.slice(0,-1);
        } else if (value === 'enter') {
            processScan();
        } else {
            kundeNummerInput.value += value;
        }
        
        // Focus back on the input
        kundeNummerInput.focus();
    }

    // Function to handle print button clicks
    function handlePrintButtonClick(e) {
        const buttonText = e.target.textContent;
        console.log(`Printing ${buttonText} for customer: ${currentCustomer || 'None'}`);
        
        if (!currentCustomer) {
            statusLabel.textContent = 'Please scan a customer barcode first';
            statusLabel.style.backgroundColor = 'red';
            statusLabel.style.color = 'white';
            return;
        }
        
        statusLabel.textContent = `Printing ${buttonText}...`;
        statusLabel.style.backgroundColor = 'blue';
        statusLabel.style.color = 'white';
        
        // Simulate printing process
        setTimeout(() => {
            statusLabel.textContent = `${buttonText} printed successfully!`;
            statusLabel.style.backgroundColor = 'green';
            statusLabel.style.color = 'white';
            
            // Reset status after a while
            setTimeout(() => {
                statusLabel.textContent = 'Ready to scan';
                statusLabel.style.backgroundColor = 'lightgreen';
                statusLabel.style.color = 'black';
            }, 2000);
        }, 1000);
    }

    // Update the desktop name and current time
    document.querySelector('.destop-name').textContent = 'Sai Malka';
    setInterval(function() {
        document.querySelector('.date-time').textContent = new Date().toLocaleTimeString();
    }, 1000);

    // Load customer data when the page loads
    loadCustomerData();

    // Set up event listeners
    kundeNummerInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            processScan();
        }
    });

    okButton.addEventListener('click', processScan);
    
    // Add event listeners to number buttons
    numberButtons.forEach(button => {
        button.addEventListener('click', handleNumberButtonClick);
    });
    
    // Add event listeners to print buttons
    printButtons.forEach(button => {
        button.addEventListener('click', handlePrintButtonClick);
    });
});