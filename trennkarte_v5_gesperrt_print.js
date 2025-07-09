// Tab Switching Function

function switchTab(tabNumber) {
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to clicked tab button
    document.querySelectorAll('.tab-button')[tabNumber - 1].classList.add('active');
    
    // Hide all quick access containers
    document.querySelectorAll('.quick-access-container').forEach(container => {
        container.classList.add('hidden');
    });
    
    // Show the selected container
    document.getElementById(`quick-access-${tabNumber}`).classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the app
    const kundeNummerInput = document.getElementById('kunde-nummer');
    const statusLabel = document.querySelector('.status-label');
    const currentCustomerLabel = document.querySelector('.current-customer-label');
    const currentCustomerLabel_2 = document.querySelector('.current-customer-label-2');
    const previousCustomerLabel = document.querySelector('.previous-customer-label');
    const previousCustomerLabel_2 = document.querySelector('.previous-customer-label-2');
    const currentCustomerNumLabel = document.querySelector('.current-customer-number');
    const previousCustomerNumLabel = document.querySelector('.previous-customer-number');
    const okButton = document.querySelector('.ok-button');
    const numberButtons = document.querySelectorAll('.number-button');
    const printButtons = document.querySelectorAll('.print-button');
    const quickButtons = document.querySelectorAll('.quick-button'); // Add quick access buttons

    let customerData = []; // To store data from customers.json

    let currentCustomer = null;
    let currentCustomer_2 = null;
    let previousCustomer = null;
    let previousCustomer_2 = null;
    let currentCustomerNumber = null;
    let previousCustomerNumber = null;
    let verificationMode = false;
    let pruf_code = null;
    

    const DEFAULT_NAME = 'USER'
    let desktopName = localStorage.getItem('desktopName') || DEFAULT_NAME; 

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
                console.log(`Zebra Drucer bereit: ${selectedDevice.name}`);
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
            console.log('Customer Id:', firstCustomer.ID, 'Customer Name: ', firstCustomer.NAME1);
            
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
    kundeNummerInput.focus();

    function processScan() {
        const barcodeValue = kundeNummerInput.value.trim();
        kundeNummerInput.value = '';
        //console.log("searching for ID:", barcodeValue);
        //console.log("Type of searched ID:", typeof barcodeValue);

        if (!barcodeValue) {
            statusLabel.textContent = 'Bitte scannen Sie einen Kundenbarcode';
            return;
        }

        if (verificationMode) {
            //verifyLabel(barcodeValue);
            return;
        }

        // Convert barcodeValue to a number before comparing
        const barcodeNumber = parseInt(barcodeValue, 10); // 10 specifies decimal radix

        // Find customer by ID
        const customerMatch = customerData.find(customer => customer.ID === barcodeNumber);

        //console.log("customerMatch", customerMatch);
        if (!customerMatch) {
            statusLabel.textContent = `Kein Kunde für Barcode: ${barcodeValue} gefunden!!`;
            statusLabel.style.backgroundColor = 'Red';
            statusLabel.style.color = 'White';
            return;
        } else {

        

        let cust_status = customerMatch.STATUS;
        let cust_machine_export = customerMatch.ISEXPORTMASCHINE;
        let cust_mahnstufe = customerMatch.MAHNSTUFE;

        pruf_code = cust_status.toString() + cust_machine_export.toString() + cust_mahnstufe.toString();

        //console.log("Prufcode: ", pruf_code);   

        
            // Update previous customer
            if (currentCustomer) {
                previousCustomer = currentCustomer;
                previousCustomer_2 = currentCustomer_2;
                previousCustomerNumber = currentCustomerNumber;
                previousCustomerLabel.textContent = previousCustomer;
                previousCustomerLabel_2.textContent = previousCustomer_2;
                previousCustomerNumLabel.textContent = previousCustomerNumber;
            }

            // Update current customer
            currentCustomer = customerMatch.NAME1;
            currentCustomer_2 = customerMatch.NAME2;
            currentCustomerNumber = customerMatch.ID;
            currentCustomerLabel.textContent = currentCustomer;
            currentCustomerLabel_2.textContent = currentCustomer_2;
            currentCustomerNumLabel.textContent = currentCustomerNumber;

            if (pruf_code == "110") {
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
            //verificationMode = true;
            //statusLabel.textContent = 'Scannen Sie das gedruckte Etikett, um zu überprüfen';
            //statusLabel.style.backgroundColor = 'Yellow';
            //statusLabel.style.color = 'black';
            

            const zplData = generateZpl(desktopName, pruf_code, currentCustomerNumber, currentCustomer, currentCustomer_2);
            //const zplData = generateZpl(currentCustomer, currentCustomer_2, currentCustomerNumber, pruf_code);
        
            try {
                selectedDevice.send(zplData);
                statusLabel.textContent = 'Erfolgreich gedruckt!';
                //statusLabel.textContent = `${buttonText} erfolgreich gedruckt!`;
                statusLabel.style.backgroundColor = 'lightgreen';
                statusLabel.style.color = 'black';
                setTimeout(() => {
                    //statusLabel.textContent = 'Scannen Sie das gedruckte Etikett, um zu überprüfen';
                    //statusLabel.style.backgroundColor = 'yellow';
                    //statusLabel.style.color = 'black';
                    statusLabel.textContent = 'Gedruckt!, Bereit zum Scannen.';
                    statusLabel.style.backgroundColor = 'lightgreen';
                    statusLabel.style.color = 'black';
                }, 2000);            
            } catch(error) {
                statusLabel.textContent = `Fehler beim Drucken: ${error}`;
                statusLabel.style.backgroundColor = 'red';
                statusLabel.style.color = 'white';
                console.error("Druckfehler: ", error);
            }
        } else {
            let msg_k = '-!!!!---KUNDE GESPERRT!---!!!-'
            //console.log('kunde gesperrt!!')
            currentCustomerLabel.textContent = msg_k + 'Bitte nicht an die Maschine schicken.!!';
            currentCustomerLabel_2.textContent = currentCustomer;
            //let a = currentCustomerNumber.toString()+ ' '+ currentCustomer;
            //let num_1 = 0;
            verificationMode = false;
            //const zplData = generateZpl(msg_k, currentCustomer, currentCustomerNumber);
            //const zplData = generateZpl_gesperrt(desktopName, pruf_code, num_1, msg_k, a);//, currentCustomer);
            const zplData = generateZpl_gesperrt(desktopName, pruf_code, currentCustomerNumber, currentCustomer, currentCustomer_2);
            //generateZpl_gesperrt(user, code, customerId, customerName, currentCustomer_2)
            
    
        try {
            selectedDevice.send(zplData);
            statusLabel.textContent = 'Erfolgreich gedruckt!';
            //statusLabel.textContent = `${buttonText} erfolgreich gedruckt!`;
            statusLabel.style.backgroundColor = 'lightgreen';
            statusLabel.style.color = 'black';
            setTimeout(() => {
                statusLabel.textContent = 'Kunde Gesperrt, nicht Kleben, nächste kunde';
                statusLabel.style.backgroundColor = 'red';
                statusLabel.style.color = 'black';
            }, 2000);            
        } catch(error) {
            statusLabel.textContent = `Fehler beim Drucken: ${error}`;
            statusLabel.style.backgroundColor = 'red';
            statusLabel.style.color = 'white';
            console.error("Druckfehler: ", error);
        }}}        
    }

    function verifyLabel(scannedBarcode) {
        // Convert to numbers for comparison
        //const barcodeNumber = parseInt(scannedBarcode, 10);
        let barcodeNumber = "0000";
        let compare_barcode = "0000";

        if (scannedBarcode[7]=== "0") {
            compare_barcode = scannedBarcode.slice(8,15);
            barcodeNumber = parseInt(compare_barcode, 10); 
        } else {
            compare_barcode = scannedBarcode.slice(7,15);
            barcodeNumber = parseInt(compare_barcode, 10);
        }

        if (barcodeNumber === currentCustomerNumber) {
            statusLabel.textContent = 'Verifizierung erfolgreich! Bereit für den nächsten Scan.';
            statusLabel.style.backgroundColor = 'lightgreen';
            statusLabel.style.color = 'black';
            verificationMode = false;
        } else {
            statusLabel.textContent = `Verifizierung fehler!! Gescannt: ${barcodeNumber}, Erwartet: ${currentCustomerNumber}`;
            statusLabel.style.backgroundColor = 'Red';
            statusLabel.style.color = 'White';
        }
    }

    function calculatePrufziffer(code) {
        // Ensure we're working with a string
        code = code.toString();
        
        let odd = 0;  // Sum for positions 0,2,4,... (zero-indexed)
        let even = 0; // Sum for positions 1,3,5,... (zero-indexed)
        
        for (let i = 0; i < code.length; i++) {
          const digit = parseInt(code[i], 10);
          
          if (i % 2 === 0) {
            odd += digit;
          } else {
            even += digit;
          }
        }
        
        // Apply the formula
        const prufcode = (odd * 3 + even) % 10;
        
        return prufcode;
      }
      
      // Example usage
      const code_1 = "040000002018500";
      const prufziffer = calculatePrufziffer(code_1);
      console.log("Prüfziffer:", prufziffer);

    function generateBarcodeText(customerId) {
        const customerIdString = String(customerId);

        let base = '04000000';
        if (customerIdString.length === 7) {
            base = '04000000';
        } else if (customerIdString.length === 8){
            base = '0400000';
        }
        const base_text = base + customerIdString;
        const checkDigit = calculatePrufziffer(base_text); // pruffziffer rechnen
        return  base_text + checkDigit;
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

    
    // Function to handle quick access button clicks
    function handleQuickButtonClick(e) {
        const customerNumber = e.target.getAttribute('data-customer');
        
        if (customerNumber) {
            console.log("Quick button clicked for customer:", customerNumber);
            
            // Set the input value to the customer number
            kundeNummerInput.value = customerNumber;
            
            // Trigger the processScan function
            processScan();
        }
        
        // Focus back on the input
        kundeNummerInput.focus();
    }

    function generateZpl(user, code, customerId, customerName, currentCustomer_2) {
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
    
        let zpl = `^XA
        ^MMB
        ^PW630
        ^LL315
        ^LS0
        
        ^FX Remove centering commands
        ^CWA,E:TT0003M_.FNT

        ^FX Draw left border
        ^FO20,140^GB3,156,3^FS
        ^FX Draw right border
        ^FO597,140^GB3,156,3^FS
        
        ^FX Draw bottom border
        ^FO20,290^GB581,3,6^FS

        ^FX Barcode positioned 90 dots from left
        ^FO90,30^BY3,2.5,100^B2N,100,N,N,N^FD${formattedBarcode}^FS
        
        ^CI28
        ^FX Customer ID and date positioned 30 dots from left
        ^FO35,140^A0N,25,25^FD${customerId}^FS
        ^FO385,140^A0N,20,20^FD${dateTimeString}^FS
        
        ^FX Customer name positioned 30 dots from left - removed centering
        ^FO35,180^A0N,25,25^FD${customerName}^FS
        ^FO35,210^A0N,25,25^FD${currentCustomer_2}^FS
        
        
        ^FO35,250^A0N,25,25^FDPrüfcode: ${code}^FS
        ^FO385,250^A0N,25,25^FD ${user} ^FS

        ^FX Horizontal line at bottom
        
        ^XZ`;

        return zpl;
    }

    function generateZpl_gesperrt(user, code, customerId, customerName, currentCustomer_2) {
        const currentDate = new Date();
        const formattedDate = `${String(currentDate.getDate()).padStart(2, '0')}.${String(currentDate.getMonth() + 1).padStart(2, '0')}.${currentDate.getFullYear()}`;
        const formattedTime = `${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}`;
        const dateTimeString = `${formattedDate} ${formattedTime}`;
        const labelWidthMM = 90;
        const labelHeightMM = 50;
        const dotsPerMM = 8; // Adjust based on printer's DPI
        let status_print = code[0];
        let machine_export = code[1];
        let mahnstufe_print = code[2];

    
        //pruf_code = cust_status.toString() + cust_machine_export.toString() + cust_mahnstufe.toString();
        const labelWidthDots = Math.round(labelWidthMM * dotsPerMM);
        const labelHeightDots = Math.round(labelHeightMM * dotsPerMM);
    
        let zpl = `^XA
        ^MMB
        ^PW630
        ^LL315
        ^LS0
        
        ^FX Remove centering commands
        ^CWA,E:TT0003M_.FNT

        
        
        ^CI28
        ^FX Customer ID and date positioned 30 dots from left
        ^FO200,20^A0N,35,35^FDKunde Gesperrt!^FS
        ^FO35,70^A0N,30,30^FD${customerId}^FS
        ^FO385,70^A0N,20,20^FD${dateTimeString}^FS
        
        ^FX Customer name positioned 30 dots from left - removed centering
        ^FO35,110^A0N,28,28^FD${customerName}^FS
        ^FO35,140^A0N,28,28^FD${currentCustomer_2}^FS
        
        ^FO35,180^A0N,25,25^FDPrüfcode: ${code}^FS
        ^FO35,210^A0N,23,23^FDSTATUS-----: ${status_print}^FS
        ^FO35,240^A0N,23,23^FDISEXPORTMACHINE: ${machine_export}^FS
        ^FO35,270^A0N,23,23^FDMAHNSTUFE---: ${mahnstufe_print}^FS
        
        ^FO385,250^A0N,25,25^FD ${user} ^FS

        ^FX Horizontal line at bottom
        
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

        let copies = parseInt(buttonText,10);
        let print_copy = 0;

        if (pruf_code == "110") {

        while (print_copy < copies) {
            const zplData = generateZpl(desktopName, pruf_code, currentCustomerNumber, currentCustomer, currentCustomer_2);
            // const zplData = generateZpl(currentCustomer, currentCustomer_2, currentCustomerNumber, pruf_code); 
            //const zplData = generateZpl(currentCustomer, currentCustomerNumber, pruf_code);
            
            try {
                await selectedDevice.send(zplData);
                statusLabel.textContent = `${buttonText} Etikett wird gedruckt!`;
                statusLabel.style.backgroundColor = 'green';
                statusLabel.style.color = 'white';
                setTimeout(() => {
                    if (verificationMode){
                        statusLabel.textContent = 'Scannen Sie das gedruckte Etikett, um zu überprüfen';
                        statusLabel.style.backgroundColor = 'yellow';
                        statusLabel.style.color = 'black';
                    } else {
                    statusLabel.textContent =  `${buttonText} erfolgreich gedruckt! Bereit zum Kunden einlesen`;
                    statusLabel.style.backgroundColor = 'lightgreen';
                    statusLabel.style.color = 'black';
                    }
                }, 2000);            
            } catch(error) {
                statusLabel.textContent = `Fehler beim Drucken: ${error}`;
                statusLabel.style.backgroundColor = 'red';
                statusLabel.style.color = 'white';
                console.error("Druckfehler: ", error);
            }
            print_copy++;
        }
        kundeNummerInput.focus();
    } else {
        let msg_k = '--****---KUNDE GESPERRT!!---****--'
            //console.log('kunde gesperrt!!')
            currentCustomerLabel.textContent = msg_k + 'Bitte nicht an die Maschine schicken !!';
            currentCustomerLabel_2.textContent = currentCustomer;
            //let a = currentCustomerNumber.toString()+ ' '+ currentCustomer;
            //let num_1 = 0;
            verificationMode = false;
            //const zplData = generateZpl(msg_k, currentCustomer, currentCustomerNumber);
            //const zplData = generateZpl(desktopName, pruf_code, num_1, msg_k, a);//, currentCustomer);
            
            const zplData = generateZpl_gesperrt(desktopName, pruf_code, currentCustomerNumber, currentCustomer, currentCustomer_2);
            
    
        try {
            selectedDevice.send(zplData);
            statusLabel.textContent = 'Erfolgreich gedruckt!';
            //statusLabel.textContent = `${buttonText} erfolgreich gedruckt!`;
            statusLabel.style.backgroundColor = 'lightgreen';
            statusLabel.style.color = 'black';
            setTimeout(() => {
                statusLabel.textContent = 'Kunde Gesperrt, nicht Kleben, nächste kunde';
                statusLabel.style.backgroundColor = 'red';
                statusLabel.style.color = 'black';
            }, 2000);            
        } catch(error) {
            statusLabel.textContent = `Fehler beim Drucken: ${error}`;
            statusLabel.style.backgroundColor = 'red';
            statusLabel.style.color = 'white';
            console.error("Druckfehler: ", error);
        }

    }

    }


    // Update the desktop name and current time
    //document.querySelector('.destop-name').textContent = 'User';
    document.querySelector('.destop-name').textContent = desktopName;
    //document.querySelector('.destop-name').textContent = window.location.hostname || 'Local Computer';

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

    okButton.addEventListener('click', ()=>{
        processScan();
        kundeNummerInput.focus();
    });
    
    // Add event listeners to number buttons
    numberButtons.forEach(button => {
        button.addEventListener('click', handleNumberButtonClick);
    });
    
    // Add event listeners to print buttons
    printButtons.forEach(button => {
        button.addEventListener('click', handlePrintButtonClick);
    });

    // Add event listeners to quick access buttons
    quickButtons.forEach(button => {
        button.addEventListener('click', handleQuickButtonClick);
    });

    // Initialize tab system
    switchTab(1); // Show first tab by default
    
    // Re-bind event listeners for new quick buttons in second tab
    const newQuickButtons = document.querySelectorAll('#quick-access-2 .quick-button');
    newQuickButtons.forEach(button => {
        button.addEventListener('click', handleQuickButtonClick);
    });
});