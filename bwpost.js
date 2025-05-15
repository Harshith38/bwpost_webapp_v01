document.addEventListener('DOMContentLoaded', function() {
    // Initialize the app
    const kundeNummerInput = document.getElementById('kunde-nummer');
    const statusLabel = document.querySelector('.status-label');
    const currentCustomerLabel = document.querySelector('.current-customer-label');
    const previousCustomerLabel = document.querySelector('.previous-customer-label');
    const okButton = document.querySelector('.ok-button');
    
    // Set up event listeners
    kundeNummerInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            processScan();
        }
    });
    
    okButton.addEventListener('click', processScan);
    
    // Sample customer data for demonstration
    const kundeData = [
        { ID: '1001', CustomerName: 'Customer 1' },
        { ID: '1002', CustomerName: 'Customer 2' },
        { ID: '1003', CustomerName: 'Customer 3' }
    ];
    
    let currentCustomer = null;
    let previousCustomer = null;
    let verificationMode = false;
    
    function processScan() {
        const barcodeValue = kundeNummerInput.value.trim();
        kundeNummerInput.value = '';
        
        if (!barcodeValue) {
            statusLabel.textContent = 'Please scan a barcode';
            return;
        }
        
        if (verificationMode) {
            verifyLabel(barcodeValue);
            return;
        }
        
        // Find customer by barcode
        const customerMatch = kundeData.find(customer => customer.ID === barcodeValue);
        
        if (customerMatch) {
            // Update previous customer
            if (currentCustomer) {
                previousCustomer = currentCustomer;
                previousCustomerLabel.textContent = previousCustomer;
            }
            
            // Update current customer
            currentCustomer = customerMatch.CustomerName;
            currentCustomerLabel.textContent = currentCustomer;
            
            // Enable verification mode
            verificationMode = true;
            statusLabel.textContent = 'Scan the printed label to verify';
            statusLabel.style.backgroundColor = 'Yellow';
            statusLabel.style.color = 'black';
        } else {
            statusLabel.textContent = `No customer found for barcode: ${barcodeValue}`;
        }
    }
    
    function verifyLabel(barcodeValue) {
        // Find customer by barcode
        const customerMatch = kundeData.find(customer => customer.ID === barcodeValue);
        
        if (customerMatch) {
            const verifiedCustomer = customerMatch.CustomerName;
            if (verifiedCustomer === currentCustomer) {
                statusLabel.textContent = 'Verification successful! Ready for next scan.';
                statusLabel.style.backgroundColor = 'Green';
                statusLabel.style.color = 'White';
                verificationMode = false;
            } else {
                statusLabel.textContent = 'Verification failed! Customer mismatch.';
                statusLabel.style.backgroundColor = 'Red';
                statusLabel.style.color = 'White';
            }
        } else {
            statusLabel.textContent = `No customer found for barcode: ${barcodeValue}`;
        }
    }
    
    // Update the desktop name and current time
    document.querySelector('.destop-name').textContent = 'Sai Malka';
    setInterval(function() {
        document.querySelector('.date-time').textContent = new Date().toLocaleTimeString();
    }, 1000);
});