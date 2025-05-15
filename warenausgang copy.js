document.addEventListener('DOMContentLoaded', function() {
    // Sample tour data for autocomplete
    const tourSuggestions = [
        "Tour-P2-sMail",
        "R-ZAK-T-4",
        "R-ZAK-T-3",
        "R-ZAK-T-2",
        "R-ZAK-T-1",
        "R-7870",
        "R-7860",
        "R-7830",
        "R-7765",
        "R-7725",
        "R-7601"

    ];
    
    // Storage for warenausgang data
    let warenausgangData = [];
    
    // DOM Elements
    const wagenNummerInput = document.getElementById('wagen_nummer');
    const gewichtInput = document.getElementById('wagen_gewicht_nummer');
    const kistenInput = document.getElementById('kisten_nummer');
    const tourInput = document.getElementById('tour_display');
    const idInput = document.getElementById('ID-display');
    const okButton = document.getElementById('ok_button');
    const printButton = document.getElementById('print_button');
    const cancelOrderInput = document.getElementById('cancel_oder_nummer');
    const cancelButton = document.getElementById('cancel_button');
    const berichtButton = document.getElementById('versand_bericht_button');
    const typeSelector = document.getElementById('dropdown_wagen_palette_list');
    const tagSelector = document.getElementById('dropdown_tag_list');
    
    // Set up autocomplete for tour input
    setupAutocomplete(tourInput, tourSuggestions);
    
    // Set up event listeners
    okButton.addEventListener('click', saveData);
    printButton.addEventListener('click', printLabel);
    cancelButton.addEventListener('click', cancelOrder);
    berichtButton.addEventListener('click', showVersandBericht);
    
    // Create modal element for Versand Bericht
    createBerichtModal();
    
    // Automatically generate ID based on current timestamp and random number
    idInput.value = generateID();
    
    // Functions
    
    function setupAutocomplete(inputElement, suggestions) {
        let currentFocus;
        
        // Execute function when someone writes in the text field
        inputElement.addEventListener("input", function(e) {
            let val = this.value;
            
            // Close any already open lists
            closeAllLists();
            
            if (!val) { return false; }
            currentFocus = -1;
            
            // Create a DIV element that will contain the suggestions
            const autocompleteList = document.createElement("DIV");
            autocompleteList.setAttribute("id", this.id + "-autocomplete-list");
            autocompleteList.setAttribute("class", "autocomplete-items");
            
            // Append the DIV element as a child of the autocomplete container
            this.parentNode.appendChild(autocompleteList);
            
            // For each item in the array...
            for (let i = 0; i < suggestions.length; i++) {
                // Check if the item starts with the same letters as the text field value
                if (suggestions[i].substr(0, val.length).toUpperCase() === val.toUpperCase()) {
                    // Create a DIV element for each matching element
                    const itemElement = document.createElement("DIV");
                    
                    // Make the matching letters bold
                    itemElement.innerHTML = "<strong>" + suggestions[i].substr(0, val.length) + "</strong>";
                    itemElement.innerHTML += suggestions[i].substr(val.length);
                    
                    // Insert an input field that will hold the current array item's value
                    itemElement.innerHTML += "<input type='hidden' value='" + suggestions[i] + "'>";
                    
                    // Execute when someone clicks on the item value
                    itemElement.addEventListener("click", function(e) {
                        // Insert the value for the autocomplete text field
                        inputElement.value = this.getElementsByTagName("input")[0].value;
                        // Close the list of autocompleted values
                        closeAllLists();
                    });
                    
                    autocompleteList.appendChild(itemElement);
                }
            }
        });
        
        // Execute a function when pressed a key on the keyboard
        inputElement.addEventListener("keydown", function(e) {
            let x = document.getElementById(this.id + "-autocomplete-list");
            if (x) x = x.getElementsByTagName("div");
            
            if (e.keyCode == 40) { // Down arrow
                currentFocus++;
                addActive(x);
            } else if (e.keyCode == 38) { // Up arrow
                currentFocus--;
                addActive(x);
            } else if (e.keyCode == 13) { // Enter
                e.preventDefault();
                if (currentFocus > -1) {
                    if (x) x[currentFocus].click();
                }
            }
        });
        
        function addActive(x) {
            if (!x) return false;
            
            // Remove the "active" class on all items
            removeActive(x);
            
            if (currentFocus >= x.length) currentFocus = 0;
            if (currentFocus < 0) currentFocus = (x.length - 1);
            
            // Add class "autocomplete-active"
            x[currentFocus].classList.add("autocomplete-active");
        }
        
        function removeActive(x) {
            for (let i = 0; i < x.length; i++) {
                x[i].classList.remove("autocomplete-active");
            }
        }
        
        function closeAllLists(elmnt) {
            // Close all autocomplete lists except the one passed as an argument
            const x = document.getElementsByClassName("autocomplete-items");
            for (let i = 0; i < x.length; i++) {
                if (elmnt != x[i] && elmnt != inputElement) {
                    x[i].parentNode.removeChild(x[i]);
                }
            }
        }
        
        // Close the list when someone clicks on the document
        document.addEventListener("click", function (e) {
            closeAllLists(e.target);
        });
    }
    
    function generateID() {
        const timestamp = new Date().getTime().toString().slice(-6);
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `WA-${timestamp}-${random}`;
    }
    
    function saveData() {
        // Validate inputs
        if (!wagenNummerInput.value || !gewichtInput.value || !kistenInput.value || !tourInput.value) {
            alert('Bitte füllen Sie alle Felder aus.');
            return;
        }
        
        // Create data object
        const newData = {
            id: idInput.value,
            type: typeSelector.value,
            tag: tagSelector.value,
            wagen: wagenNummerInput.value,
            gewicht: gewichtInput.value,
            kisten: kistenInput.value,
            tour: tourInput.value,
            timestamp: new Date().toISOString()
        };
        
        // Add to data array
        warenausgangData.push(newData);
        
        // Save to localStorage
        localStorage.setItem('warenausgangData', JSON.stringify(warenausgangData));
        
        // Clear fields and generate new ID
        clearFields();
        
        // Show confirmation
        alert('Daten erfolgreich gespeichert.');
    }
    
    function clearFields() {
        wagenNummerInput.value = '';
        gewichtInput.value = '';
        kistenInput.value = '';
        tourInput.value = '';
        idInput.value = generateID();
    }
    
    function printLabel() {
        // Check if data is entered
        if (!wagenNummerInput.value || !gewichtInput.value || !kistenInput.value || !tourInput.value) {
            alert('Bitte füllen Sie alle Felder aus, bevor Sie drucken.');
            return;
        }
        
        alert('Etikett wird gedruckt...');
        // In real implementation, this would connect to a printer
    }
    
    function cancelOrder() {
        const idToCancel = cancelOrderInput.value;
        
        if (!idToCancel) {
            alert('Bitte geben Sie eine ID ein zum Stornieren.');
            return;
        }
        
        // Load data from localStorage
        loadDataFromStorage();
        
        // Find and remove the item with matching ID
        const initialLength = warenausgangData.length;
        warenausgangData = warenausgangData.filter(item => item.id !== idToCancel);
        
        if (warenausgangData.length < initialLength) {
            // Save updated data
            localStorage.setItem('warenausgangData', JSON.stringify(warenausgangData));
            alert(`Auftrag mit ID ${idToCancel} wurde storniert.`);
            cancelOrderInput.value = '';
        } else {
            alert(`Keine Auftrag mit ID ${idToCancel} gefunden.`);
        }
    }
    
    function loadDataFromStorage() {
        const storedData = localStorage.getItem('warenausgangData');
        if (storedData) {
            warenausgangData = JSON.parse(storedData);
        }
    }
    
    function createBerichtModal() {
        // Create modal container
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'berichtModal';
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        // Add close button
        const closeButton = document.createElement('span');
        closeButton.className = 'close-button';
        closeButton.innerHTML = '&times;';
        closeButton.onclick = function() {
            modal.style.display = 'none';
        };
        
        // Add title
        const title = document.createElement('h2');
        title.textContent = 'Versandbericht';
        
        // Add container for table
        const tableContainer = document.createElement('div');
        tableContainer.id = 'bericht-table-container';
        
        // Add export buttons
        const exportButtons = document.createElement('div');
        exportButtons.className = 'export-buttons';
        
        const excelButton = document.createElement('button');
        excelButton.className = 'export-excel';
        excelButton.textContent = 'Als Excel exportieren';
        excelButton.onclick = exportToExcel;
        
        const pdfButton = document.createElement('button');
        pdfButton.className = 'export-pdf';
        pdfButton.textContent = 'Als PDF exportieren';
        pdfButton.onclick = exportToPDF;
        
        // Assemble modal
        exportButtons.appendChild(excelButton);
        exportButtons.appendChild(pdfButton);
        
        modalContent.appendChild(closeButton);
        modalContent.appendChild(title);
        modalContent.appendChild(tableContainer);
        modalContent.appendChild(exportButtons);
        
        modal.appendChild(modalContent);
        
        // Add to document body
        document.body.appendChild(modal);
        
        // Close when clicking outside the modal content
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        };
    }
    
    function showVersandBericht() {
        // Load latest data
        loadDataFromStorage();
        
        if (warenausgangData.length === 0) {
            alert('Keine Daten vorhanden für den Bericht.');
            return;
        }
        
        const modal = document.getElementById('berichtModal');
        const tableContainer = document.getElementById('bericht-table-container');
        
        // Clear previous content
        tableContainer.innerHTML = '';
        
        // Group data by tour
        const groupedByTour = {};
        
        warenausgangData.forEach(item => {
            if (!groupedByTour[item.tour]) {
                groupedByTour[item.tour] = {
                    tour: item.tour,
                    kisten: parseInt(item.kisten) || 0,
                    gewicht: parseFloat(item.gewicht) || 0,
                    entries: [item]
                };
            } else {
                groupedByTour[item.tour].kisten += parseInt(item.kisten) || 0;
                groupedByTour[item.tour].gewicht += parseFloat(item.gewicht) || 0;
                groupedByTour[item.tour].entries.push(item);
            }
        });
        
        // Create table
        const table = document.createElement('table');
        table.className = 'bericht-table';
        
        // Create header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const headers = ['Tour', 'Anzahl Kisten', 'Gesamtgewicht (kg)', 'Anzahl Wagen/Paletten', 'Tag'];
        
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Create table body
        const tbody = document.createElement('tbody');
        
        Object.values(groupedByTour).forEach(groupData => {
            const row = document.createElement('tr');
            
            // Tour
            const tourCell = document.createElement('td');
            tourCell.textContent = groupData.tour;
            row.appendChild(tourCell);
            
            // Kisten
            const kistenCell = document.createElement('td');
            kistenCell.textContent = groupData.kisten;
            row.appendChild(kistenCell);
            
            // Gewicht
            const gewichtCell = document.createElement('td');
            gewichtCell.textContent = groupData.gewicht.toFixed(2);
            row.appendChild(gewichtCell);
            
            // Anzahl Wagen/Paletten
            const wagenCell = document.createElement('td');
            wagenCell.textContent = groupData.entries.length;
            row.appendChild(wagenCell);

            
            
            // Tag
            const tagCell = document.createElement('td');
            // Get unique tags
            const tags = [...new Set(groupData.entries.map(item => item.tag))].join(', ');
            tagCell.textContent = tags;
            row.appendChild(tagCell);
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        tableContainer.appendChild(table);
        
        // Show modal
        modal.style.display = 'block';
    }
    
    function exportToExcel() {
        alert('Export als Excel wird vorbereitet...');
        // In a real implementation, this would use a library like SheetJS to create Excel files
        
        // Example of how you might implement this with a library:
        /*
        const wb = XLSX.utils.table_to_book(document.querySelector('.bericht-table'));
        XLSX.writeFile(wb, 'Versandbericht_' + new Date().toISOString().slice(0,10) + '.xlsx');
        */
    }
    
    function exportToPDF() {
        alert('Export als PDF wird vorbereitet...');
        // In a real implementation, this would use a library like jsPDF to create PDF files
        
        // Example of how you might implement this with a library:
        /*
        const doc = new jsPDF();
        doc.autoTable({ html: '.bericht-table' });
        doc.save('Versandbericht_' + new Date().toISOString().slice(0,10) + '.pdf');
        */
    }
    
    // Load any existing data when page loads
    loadDataFromStorage();
});