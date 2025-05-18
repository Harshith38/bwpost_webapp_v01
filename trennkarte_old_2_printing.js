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

    let selectedDevice; // To store the discovered printer

    // Function to set up Zebra printing
    function setupZebraPrinting(){
        //Get the default device - adjust the device type if needed ("printer" is usually correct)
        BrowserPrint.getDefaultDevice("printer", function(device){
            selectedDevice = device;
            console.log("default Zebra printer found:", device);
            statusLabel.textContent = `Zebra Drucker beriet: ${device ? device.name : 'Nicht gefunden'}`;
            statusLabel.style.backgroundColor = device ? 'lightgreen' : 'red';
            statusLabel.style.color = 'black';
        }, function(error){
            console.error("Error getting default printer:", error);
            statusLabel.textContent = `Fehler beim Initialisieren des Druckers: ${error}`;
            statusLabel.style.backgroundColor = 'red';
            statusLabel.style.color = 'white';
        });

        // Discover any other local Zebra printers
        BrowserPrint.getLocalDevices(function(deviceList) {
            console.log("Local Zebra printer:", deviceList);
            if (deviceList.length === 0 && !selectedDevice) {
                statusLabel.textContent = 'Keine lokalen Zebra Drucker gefunden.';
                statusLabel.style.backgroundColor = 'red';
                statusLabel.style.color = 'white';
            } else if (deviceList.length > 0 && !selectedDevice) {
                selectedDevice = deviceList[0]; // Select the first found printer as default if none was explicitly default
                console.log("Selected first local printer:", selectedDevice);
                statusLabel.textContent = `Zebra Drucer bereit: ${selectedDevice.name}`;
                statusLabel.style.backgroundColor = 'lightgreen';
                statusLabel.style.color = 'black';
            }
        }, function(error) {
            console.error("Error getting local printer:", error);
            statusLabel.textContent = `Fehler beim suchen nach Drucker: ${error}`;
            statusLabel.style.backgroundColor = 'red';
            statusLabel.style.color = 'white';
        }, "printer");
    }

    // Set up Zebra printing when page loads
    setupZebraPrinting();

    // Function to load the JSON data
    async function loadCustomerData() {
        try {
            const response = await fetch('customers.json');
            customerData = await response.json();
            console.log('Customer data loaded:', customerData.length, 'customers');
            const firstCustomer = customerData[0];
            console.log('Customer Id:', firstCustomer.ID, 'Customer Name: ', firstCustomer.CustomerName);
            
            statusLabel.textContent = 'Kundendaten geladen. Bereit zum Scannen.';
            statusLabel.style.backgroundColor = 'lightgreen';
            statusLabel.style.color = 'black';
        } catch (error) {
            console.error('Error loading customer data:', error);
            statusLabel.textContent = 'Fehler beim Laden der Kundendaten.';
            statusLabel.style.backgroundColor = 'red';
            statusLabel.style.color = 'white';
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

            // Generate the barcode
            const barcodeElement = document.getElementById('barcode');
            if (barcodeElement) {
                const barcodeText = generateBarcodeText(currentCustomerNumber);
                JsBarcode(barcodeElement, barcodeText, {
                    format: "CODE128",
                    lineColor: "#000",
                    width: 2,
                    height: 30,
                    displayValue: true
                });
            }

            // Enable verification mode
            verificationMode = true;
            statusLabel.textContent = 'Scannen Sie das gedruckte Etikett, um zu überprüfen';
            statusLabel.style.backgroundColor = 'Yellow';
            statusLabel.style.color = 'black';
        } else {
            statusLabel.textContent = `Kein Kunde für Barcode: ${barcodeValue} gefunden!!`;
            statusLabel.style.backgroundColor = 'Red';
            statusLabel.style.color = 'White';
        }
        const zplData = generateZpl(currentCustomer, currentCustomerNumber);
        
        try {
            selectedDevice.send(zplData);
            statusLabel.textContent = 'Erfolgreich gedruckt!';
            //statusLabel.textContent = `${buttonText} erfolgreich gedruckt!`;
            statusLabel.style.backgroundColor = 'lightgreen';
            statusLabel.style.color = 'black';
            setTimeout(() => {
                statusLabel.textContent = 'Scannen Sie das gedruckte Etikett, um zu überprüfen';
                statusLabel.style.backgroundColor = 'yellow';
                statusLabel.style.color = 'black';
            }, 2000);            
        } catch(error) {
            statusLabel.textContent = `Fehler beim Drucken: ${error}`;
            statusLabel.style.backgroundColor = 'red';
            statusLabel.style.color = 'white';
            console.error("Druckfehler: ", error);
        }
    }

    function verifyLabel(scannedBarcode) {
        // Convert to numbers for comparison
        const barcodeNumber = parseInt(scannedBarcode, 10);
        
        if (barcodeNumber === currentCustomerNumber) {
            statusLabel.textContent = 'Verifizierung erfolgreich! Bereit für den nächsten Scan.';
            statusLabel.style.backgroundColor = 'Green';
            statusLabel.style.color = 'White';
            verificationMode = false;
        } else {
            statusLabel.textContent = `Verifizierung fehlgeschlagen. Gescannt: ${barcodeNumber}, Erwartet: ${currentCustomerNumber}`;
            statusLabel.style.backgroundColor = 'Red';
            statusLabel.style.color = 'White';
        }
    }

    function generateBarcodeText(customerId) {
        const customerIdString = String(customerId);

        let base = '04000000';
        if (customerIdString.length === 7) {
            base = '04000000';
        } else if (customerIdString.length === 8){
            base = '0400000';
        }
        const checkDigit = '1'; // Replace with actual check digit calculation
        return base + customerIdString + checkDigit;
    }

    // Function to handle number button clicks
    function handleNumberButtonClick(e) {
        const value = e.target.getAttribute('data-value');
        
        if (value === 'clear') {
            kundeNummerInput.value = kundeNummerInput.value.slice(0, -1);
        } else if (value === 'enter') {
            processScan();
        } else {
            kundeNummerInput.value += value;
        }
        
        // Focus back on the input
        kundeNummerInput.focus();
    }

    function generateZpl(customerName, customerId) {
        const formattedBarcode = generateBarcodeText(customerId);
        const currentDate = new Date();
        const formattedDate = `${String(currentDate.getDate()).padStart(2, '0')}.${String(currentDate.getMonth() + 1).padStart(2, '0')}.${currentDate.getFullYear()}`;
        const formattedTime = `${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}`;
        const dateTimeString = `${formattedDate} ${formattedTime}`;
        const labelWidthMM = 90;
        const labelHeightMM = 50;
        const dotsPerMM = 8; // Adjust based on printer's DPI
    
        const labelWidthDots = Math.round(labelWidthMM * dotsPerMM);
        const labelHeightDots = Math.round(labelHeightMM * dotsPerMM);

        //let zpl = `^XA
        //^MMB
        
        //^LS0
        
        //^FO30,30^BY3.5,2.3,70^B2N,70,N,N,N^FD${formattedBarcode}^FS

        //^CI28
        //^FO50,150^A0N,20,20^FD${customerId}^FS
        //^FO400,150^A0N,20,20^FD${dateTimeString}^FS
        //^FO50,180^A0N,25,25^FD${customerName}^FS
        //^FO51,181^A0N,25,25^FD${customerName}^FS
        
        //^XZ`;
    
        let zpl = `^XA
        ^MMB
        ^PW630
        ^LL315
        ^LS0
        
        ^FX Remove centering commands
        ^CWA,E:TT0003M_.FNT

        ^FX Barcode positioned 30 dots from left
        ^FO35,30^BY3.5,2.5,60^B2N,60,N,N,N^FD${formattedBarcode}^FS

        ^CI28
        ^FX Customer ID and date positioned 30 dots from left
        ^FO35,120^A0N,20,20^FD${customerId}^FS
        ^FO335,120^A0N,20,20^FD${dateTimeString}^FS
        
        ^FX Customer name positioned 30 dots from left - removed centering
        ^FO35,150^A0N,25,25^FD${customerName}^FS
        ^FO36,151^A0N,25,25^FD${customerName}^FS
        
        ^XZ`;



        return zpl;
    }

    // Function to handle print button clicks
    async function handlePrintButtonClick(e) {
        const buttonText = e.target.textContent;
        console.log(`Printing ${buttonText} for customer: ${currentCustomer || 'None'}, ID: ${currentCustomerNumber}, Device: ${selectedDevice ? selectedDevice.name : 'None'}`);
        
        if (!currentCustomer || !selectedDevice) {
            statusLabel.textContent = 'Bitte scannen Sie zuerst eine Kundenummer.';
            statusLabel.style.backgroundColor = 'red';
            statusLabel.style.color = 'white';
            return;
        }
        
        statusLabel.textContent = `Drucke ${buttonText}...`;
        statusLabel.style.backgroundColor = 'blue';
        statusLabel.style.color = 'white';

        const zplData = generateZpl(currentCustomer, currentCustomerNumber);
        
        try {
            await selectedDevice.send(zplData);
            statusLabel.textContent = `${buttonText} erfolgreich gedruckt!`;
            statusLabel.style.backgroundColor = 'green';
            statusLabel.style.color = 'white';
            setTimeout(() => {
                statusLabel.textContent = 'Bereit';
                statusLabel.style.backgroundColor = 'lightgreen';
                statusLabel.style.color = 'black';
            }, 2000);            
        } catch(error) {
            statusLabel.textContent = `Fehler beim Drucken: ${error}`;
            statusLabel.style.backgroundColor = 'red';
            statusLabel.style.color = 'white';
            console.error("Druckfehler: ", error);
        }
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