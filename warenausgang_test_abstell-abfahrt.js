document.addEventListener('DOMContentLoaded', function() {
    // Sample tour data for autocomplete
    const tourSuggestions = [
        "SMail-P2-037_P2-7212",
        "P2",
        "R-3060-Ludwigsburg",
        "R-3065-Marbach",
        "R-7500-Ditzingen",
        "R-3070-Bietigheim",
        "R-3652-Vaihingen",
        "R-3040-Taschentour",
        "R-3640-Freiberg",
        "BR-BB",
        "BR-HBG",
        "BR-SHO",
        "BR-SFI",
        "BR-LEO",
        "R-3631-Kornwestheim",
        "R-3582-LE-Setten",
        "R-3511-Plochingen",
        "R-7601-Degerloch",
        "R-7830-Wangen",
        "R-7765-Mitte",
        "R-7310-Zuffenhausen",
        "R-7250-Wolfbusch",
        "R-7860-Cannstatt",
        "R-7870-OST",
        "R-3540-Kirchheim",
        "R-3510-Esslingen",
        "R-7725-West",
        "R-7110-Möhringen",
        'PES',
        "R-5011-WAGEN-1",
        "R-5013-WAGEN-3",
        "R-5021-WAGEN-1",
        "R-5031-WAGEN-1",
        "R-5032-WAGEN-2",
        "R-5033-WAGEN-3",
        "R-5034-WAGEN-4",
        "R-5035-WAGEN-5",
        "R-5036-WAGEN-6",
        "R-5037-WAGEN-7",
        "R-5038-WAGEN-8",
        "R-5039-WAGEN-9",
        "R-5040-WAGEN-10",
        "R-5041-WAGEN-1",
        "R-5043-WAGEN-3",
        "Sperre-BB",
        "Sperre-RMK",
        "Rems-Murr"
    ];
    
    // Storage for warenausgang data
    let warenausgangData = [];
    
    // Storage for departure times by tour
    let departureTimes = {};
    
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
    const drucktypeSelector = document.getElementById('dropdown_label_druck_list');
    const tagSelector = document.getElementById('dropdown_tag_list');
    
    const heuteButton = document.getElementById('heute_button');

    const todayDateLabel = document.querySelector('.today_date');
    const currentTourLabel = document.querySelector('.current-tour');
    const currentWagenWeight = document.querySelector('.current-wagen-weight');
    
    // Create route input and departure time elements
    createRouteInputSection();
    
    // Set up autocomplete for tour input
    setupAutocomplete(tourInput, tourSuggestions);
    
    // Set up event listeners
    okButton.addEventListener('click', saveData);
    printButton.addEventListener('click', printLabel);
    cancelButton.addEventListener('click', cancelOrder);
    berichtButton.addEventListener('click', showVersandBericht);
    
    heuteButton.addEventListener('click', createNewDataTable);

    document.getElementById('tour_display').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('wagen_gewicht_nummer').focus();
        }
    });

    document.getElementById('wagen_gewicht_nummer').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('ok_button').focus();
        }
    });

    document.getElementById('ok_button').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveData();
        }
    });
    
    // Create modal element for Versand Bericht
    createBerichtModal();
    
    // Automatically generate ID based on current timestamp and random number
    idInput.value = generateID();
    kistenInput.value = '0';
    wagenNummerInput.value = '0';
    tourInput.focus();

    const DEFAULT_datum = 'Bitte aktualisieren'
    let datum = localStorage.getItem('date') || DEFAULT_datum; 
    document.querySelector('.today_date').textContent = datum;

    let idInput_nummer = null;
    let tour_nummer_print = null;
    let gewicht_nummer_print = null;
    let type_print = null;

    
    // Functions
    let selectedDevice; // To store the discovered printer

    // Function to create route input section
    function createRouteInputSection() {
        const versandBerichtDiv = document.querySelector('.versand_bericht_div');
        
        // Create route input container
        const routeContainer = document.createElement('div');
        routeContainer.className = 'route_input_div';
        routeContainer.style.marginBottom = '10px';
        
        // Create route input
        const routeInput = document.createElement('input');
        routeInput.type = 'text';
        routeInput.id = 'route_input';
        routeInput.className = 'route_input';
        routeInput.placeholder = 'Route eingeben';
        routeInput.style.marginRight = '10px';
        routeInput.style.padding = '5px';
        
        // Create departure time button
        const departureButton = document.createElement('button');
        departureButton.textContent = 'Abfahrtzeit setzen';
        departureButton.className = 'departure_time_button';
        departureButton.id = 'departure_time_button';
        departureButton.style.marginRight = '10px';
        departureButton.addEventListener('click', setDepartureTime);
        
        // Add elements to container
        routeContainer.appendChild(routeInput);
        routeContainer.appendChild(departureButton);
        
        // Insert before the versand bericht button
        versandBerichtDiv.parentNode.insertBefore(routeContainer, versandBerichtDiv);
    }
    
    // Function to set departure time for a route
    function setDepartureTime() {
        const routeInput = document.getElementById('route_input');
        const route = routeInput.value.trim();
        
        if (!route) {
            alert('Bitte geben Sie eine Route ein.');
            return;
        }
        
        const currentTime = new Date();
        const timeString = `${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}`;
        
        // Load existing departure times
        const storedDepartureTimes = localStorage.getItem('departureTimes');
        if (storedDepartureTimes) {
            departureTimes = JSON.parse(storedDepartureTimes);
        }
        
        departureTimes[route] = timeString;
        localStorage.setItem('departureTimes', JSON.stringify(departureTimes));
        
        alert(`Abfahrtzeit für Route "${route}" wurde auf ${timeString} gesetzt.`);
        routeInput.value = '';
    }

    // Function to set up Zebra printing
    function setupZebraPrinting(){
        //Get the default device - adjust the device type if needed ("printer" is usually correct)
        BrowserPrint.getDefaultDevice("printer", function(device){
            selectedDevice = device;
            console.log("default Zebra printer found:", device);
        }, function(error){
            console.error("Error getting default printer:", error);
        });

        // Discover any other local Zebra printers
        BrowserPrint.getLocalDevices(function(deviceList) {
            console.log("Local Zebra printer:", deviceList);
            if (deviceList.length === 0 && !selectedDevice) {
                // No printers found
            } else if (deviceList.length > 0 && !selectedDevice) {
                selectedDevice = deviceList[0]; // Select the first found printer as default if none was explicitly default
                console.log("Selected first local printer:", selectedDevice);
            }
        }, function(error) {
            console.error("Error getting local printer:", error);
        }, "printer");
    }

    // Set up Zebra printing when page loads
    setupZebraPrinting();
    
    
    function setupAutocomplete(inputElement, suggestions) {
        let currentFocus;
        
        
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
                // Convert both strings to uppercase for case-insensitive comparison
                const suggestionUpper = suggestions[i].toUpperCase();
                const valUpper = val.toUpperCase();
                
                
                const matchIndex = suggestionUpper.indexOf(valUpper);
                
                if (matchIndex !== -1) {
                    
                    const itemElement = document.createElement("DIV");
                    
                    
                    let displayText = "";
                    
                    
                    if (matchIndex > 0) {
                        displayText += suggestions[i].substring(0, matchIndex);
                    }
                    
                    
                    displayText += "<strong>" + suggestions[i].substring(matchIndex, matchIndex + val.length) + "</strong>";
                    
                    
                    if (matchIndex + val.length < suggestions[i].length) {
                        displayText += suggestions[i].substring(matchIndex + val.length);
                    }
                    
                    itemElement.innerHTML = displayText;
                    
                    
                    itemElement.innerHTML += "<input type='hidden' value='" + suggestions[i] + "'>";
                    
                    
                    itemElement.addEventListener("click", function(e) {
                        
                        inputElement.value = this.getElementsByTagName("input")[0].value;
                        
                        closeAllLists();
                    });
                    
                    autocompleteList.appendChild(itemElement);
                }
            }
        });
        
    
        inputElement.addEventListener("keydown", function(e) {
            // Find the dropdown list if it exists
            let x = document.getElementById(this.id + "-autocomplete-list");
            if (x) x = x.getElementsByTagName("div");  // Get all suggestion divs
            
            if (e.keyCode == 40) { // Down arrow key (code 40)
                currentFocus++;     
                addActive(x);       
            } else if (e.keyCode == 38) { // Up arrow key (code 38)
                currentFocus--;    
                addActive(x);       
            } else if (e.keyCode == 13) { // Enter key (code 13)
                e.preventDefault(); 
                
            
                if (x && x.length > 0) {  // If there are suggestions showing
                    if (currentFocus > -1) {
                        
                        x[currentFocus].click();
                    } else {
                        x[0].click();  // Click the first item (index 0)
                    }
                }
                
            }
        });
        
       
        function addActive(x) {
            if (!x) return false;
            
            // Remove highlight from all items
            removeActive(x);
            
            // Handle wrapping (if at bottom, go to top; if at top, go to bottom)
            if (currentFocus >= x.length) currentFocus = 0;
            if (currentFocus < 0) currentFocus = (x.length - 1);
            
            // Add the highlight CSS class to current item
            x[currentFocus].classList.add("autocomplete-active");
        }
        
        
        function removeActive(x) {
            for (let i = 0; i < x.length; i++) {
                x[i].classList.remove("autocomplete-active");
            }
        }
        
        
        function closeAllLists(elmnt) {
            // Find all elements with class "autocomplete-items"
            const x = document.getElementsByClassName("autocomplete-items");
            for (let i = 0; i < x.length; i++) {
                // Remove all dropdowns except the one passed as parameter
                if (elmnt != x[i] && elmnt != inputElement) {
                    x[i].parentNode.removeChild(x[i]);
                }
            }
        }
        
        // Close dropdown when clicking elsewhere
        document.addEventListener("click", function (e) {
            closeAllLists(e.target);
        });
    }
    
    function generateID() {
        const timestamp = new Date().getTime().toString().slice(-6);
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `${timestamp}${random}`;
    }
    
    function saveData() {
        // Validate inputs
        if (!wagenNummerInput.value || !gewichtInput.value || !kistenInput.value || !tourInput.value) {
            alert('Bitte füllen Sie alle Felder aus.');
            return;
        }

        let tour_replace_text = tourInput.value;
        let tour_value = tour_replace_text.replace(/ß/g, "-");
        let tour_sum_value = null;
        if (tour_value == "BR-BB" ||
        tour_value == "BR-HBG" ||
        tour_value == "BR-SHO" ||
        tour_value == "BR-SFI" ||
        tour_value == "Sperre-BB" ||
        tour_value == "BR-LEO") {
            tour_sum_value = "Böblingen";
        } else if(tour_value == "R-5011-WAGEN-1" ||
            tour_value == "R-5013-WAGEN-3" ||
            tour_value == "R-5021-WAGEN-1" ||
            tour_value == "R-5031-WAGEN-1" ||
            tour_value == "R-5032-WAGEN-2" ||
            tour_value == "R-5033-WAGEN-3" ||
            tour_value == "R-5034-WAGEN-4" ||
            tour_value == "R-5035-WAGEN-5" ||
            tour_value == "R-5036-WAGEN-6" ||
            tour_value == "R-5037-WAGEN-7" ||
            tour_value == "R-5038-WAGEN-8" ||
            tour_value == "R-5039-WAGEN-9" ||
            tour_value == "R-5040-WAGEN-10" ||
            tour_value == "R-5041-WAGEN-1" ||
            tour_value == "Sperre-RMK" ||
            tour_value == "R-5043-WAGEN-3" ) {
            tour_sum_value = "Rems-Murr";

        } 
        else {
            tour_sum_value = tour_value;
        }

        
        // Create data object
        const newData = {
            id: idInput.value,
            type: typeSelector.value,
            tag: tagSelector.value,
            wagen: wagenNummerInput.value,
            gewicht: gewichtInput.value,
            kisten: kistenInput.value,
            tour:tour_sum_value,
            timestamp: new Date().toISOString()
        };
        
        // Add to data array
        warenausgangData.push(newData);
        
        // Save to localStorage
        localStorage.setItem('warenausgangData', JSON.stringify(warenausgangData));
        
        
        currentTourLabel.textContent = 'Tour: ' + tour_value;
        currentWagenWeight.textContent ='Gewicht: ' + newData.gewicht +' '+ 'kg';
        idInput_nummer = newData.id;
        tour_nummer_print = tour_value;
        gewicht_nummer_print = newData.gewicht;
        type_print = newData.type;

        
        let zplData = '';

        if (drucktypeSelector.value === 'lang_label'){
            zplData = generateZpl_lang(newData.id, newData.type, newData.gewicht, tour_value);
        } else {
            zplData = generateZpl_kurz(newData.id, newData.type, newData.gewicht, tour_value);
        }
        
            try {
                selectedDevice.send(zplData);
                console.log("Label sent to printer")
            } catch(error) {
                console.error("Druckfehler: ", error);
            }
        
        
        // Clear fields and generate new ID
        clearFields();
    }


    function createNewDataTable() {
        let datum = new Date().toLocaleDateString("de-DE");
        todayDateLabel.textContent = datum;
        localStorage.setItem('date', datum);

        localStorage.removeItem('warenausgangData');
        localStorage.removeItem('departureTimes');

        // refreshes the page
        location.reload();
    }
    
    function clearFields() {
        wagenNummerInput.value = '0';
        gewichtInput.value = '';
        kistenInput.value = '0';
        tourInput.value = '';
        idInput.value = generateID();
        tourInput.focus();
        typeSelector.value = 'wagen';
        tagSelector.value = 'T';
    }
    
    function generateZpl_lang(id, type, gewicht, tour) {
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

        ^FX Barcode positioned 90 dots from left
        
        ^FO480,400^BY3,2.5,100^B2R,60,N,N,N^FD${id}^FS
        
        ^FO485,900^A0R,40,40^FD${dateTimeString}^FS
        ^FO420,900^A0R,50,50^FD${type}^FS
        
        ^FO300,400^A0R,70,60^FD${tour}^FS
        ^FO150,400^A0R,80,80^FD${gewicht} kg^FS

        
        ^CI28
        ^FX Customer ID and date positioned 30 dots from left
        
        
        
        ^FX Customer name positioned 30 dots from left - removed centering
        
        
        
        
        ^XZ`;

        return zpl;
    }

    function generateZpl_kurz(id, type, gewicht, tour) {
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

        ^FX Barcode positioned 90 dots from left
        
        ^FO70,30^BY3,2.5,100^B2N,60,N,N,N^FD${id}^FS
        
        ^FO385,30^A0N,30,30^FD${dateTimeString}^FS
        ^FO400,70^A0N,40,40^FD${type}^FS
        
        ^FO20,120^A0N,70,55^FD${tour}^FS
        ^FO20,210^A0N,80,80^FD${gewicht} kg^FS

        
        ^CI28
        ^FX Customer ID and date positioned 30 dots from left
        
        
        
        ^FX Customer name positioned 30 dots from left - removed centering
        
        
        
        
        ^XZ`;

        return zpl;
    }

    
    function printLabel() {
        let zplData = '';

        if (drucktypeSelector.value === 'lang_label'){
            zplData = generateZpl_lang(idInput_nummer,type_print,gewicht_nummer_print,tour_nummer_print);
        } else {
            zplData = generateZpl_kurz(idInput_nummer,type_print,gewicht_nummer_print,tour_nummer_print);
        }

            try {
                selectedDevice.send(zplData);
                console.log("Label sent to printer")
            } catch(error) {
                console.error("Druckfehler: ", error);
            }
       
        alert('Etikett wird gedruckt...');
    }
    
    function cancelOrder() {
        const idToCancel = cancelOrderInput.value;
        
        if (!idToCancel) {
            alert('Bitte geben Sie eine ID zum Stornieren.');
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
        
        const storedDepartureTimes = localStorage.getItem('departureTimes');
        if (storedDepartureTimes) {
            departureTimes = JSON.parse(storedDepartureTimes);
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
                    wagenCount: item.type === 'wagen' ? 1 : 0,
                    palettenCount: item.type === 'palette' ? 1 : 0,
                    entries: [item],
                    lastUpdated: new Date(item.timestamp)
                };
            } else {
                groupedByTour[item.tour].kisten += parseInt(item.kisten) || 0;
                groupedByTour[item.tour].gewicht += parseFloat(item.gewicht) || 0;
                groupedByTour[item.tour].wagenCount += item.type === 'wagen' ? 1 : 0;
                groupedByTour[item.tour].palettenCount += item.type === 'palette' ? 1 : 0;
                groupedByTour[item.tour].entries.push(item);
                
                // Update last updated time to the most recent
                const entryDate = new Date(item.timestamp);
                if (entryDate > groupedByTour[item.tour].lastUpdated) {
                    groupedByTour[item.tour].lastUpdated = entryDate;
                }
            }
        });
        
        // Create table
        const table = document.createElement('table');
        table.className = 'bericht-table';
        
        // Create header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        //const headers = ['Tour', 'Anzahl Kisten', 'Gesamtgewicht (kg)', 'Anzahl Wagen', 'Anzahl Paletten', 'Tag', 'Abstellzeit', 'Abfahrtzeit'];
        const headers = ['Tour', 'Abstellzeit', 'Abfahrtzeit', 'Anzahl Kisten', 'Gesamtgewicht (kg)', 'Anzahl Wagen', 'Anzahl Paletten', 'Tag'];
        
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
            
            // Abstellzeit (last updated time)
            const abstellzeitCell = document.createElement('td');
            const abstellzeit = `${String(groupData.lastUpdated.getHours()).padStart(2, '0')}:${String(groupData.lastUpdated.getMinutes()).padStart(2, '0')}`;
            abstellzeitCell.textContent = abstellzeit;
            row.appendChild(abstellzeitCell);
            
            // Abfahrtzeit (departure time from route input)
            const abfahrtzeitCell = document.createElement('td');
            const departureTime = departureTimes[groupData.tour] || '-';
            abfahrtzeitCell.textContent = departureTime;
            row.appendChild(abfahrtzeitCell);
            
            // Kisten
            const kistenCell = document.createElement('td');
            kistenCell.textContent = groupData.kisten || 0;
            row.appendChild(kistenCell);
            
            // Gewicht
            const gewichtCell = document.createElement('td');
            gewichtCell.textContent = (groupData.gewicht || 0).toFixed(2);
            row.appendChild(gewichtCell);
            
            // Anzahl Wagen
            const wagenCell = document.createElement('td');
            wagenCell.textContent = groupData.wagenCount || 0;
            row.appendChild(wagenCell);
            
            // Anzahl Paletten
            const palettenCell = document.createElement('td');
            palettenCell.textContent = groupData.palettenCount || 0;
            row.appendChild(palettenCell);
            
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
        
        const wb = XLSX.utils.table_to_book(document.querySelector('.bericht-table'));
        XLSX.writeFile(wb, 'Versandbericht_' + new Date().toISOString().slice(0,10) + '.xlsx');
        
    }
    
    function exportToPDF() {
        alert('Export als PDF wird vorbereitet...');
        // In a real implementation, this would use a library like jsPDF to create PDF files
        
        // Example of how you might implement this with a library:
        
        const doc = new jsPDF();
        doc.autoTable({ html: '.bericht-table' });
        doc.save('Versandbericht_' + new Date().toISOString().slice(0,10) + '.pdf');
        
    }

    // Load any existing data when page loads
    loadDataFromStorage();
});