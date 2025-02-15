document.addEventListener('DOMContentLoaded', function () {
    const objectTable = document.getElementById('objectTable').getElementsByTagName('tbody')[0];
    const zeroStockTable = document.getElementById('zeroStockTable').getElementsByTagName('tbody')[0];
    const addBtn = document.getElementById('addBtn');
    const searchBtn = document.getElementById('searchBtn');
    const printBtn = document.getElementById('printBtn');
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const importFile = document.getElementById('importFile');
    const saveObjectBtn = document.getElementById('saveObjectBtn');
    const objectModal = new bootstrap.Modal(document.getElementById('objectModal'));
    const objectForm = document.getElementById('objectForm');

    let objects = JSON.parse(localStorage.getItem('objects')) || [];
    let editIndex = null;
    let filteredObjects = [];

    // Funzione per aggiornare le tabelle
    function updateTables(objectsToShow = objects) {
        objectTable.innerHTML = '';
        zeroStockTable.innerHTML = '';

        if (objectsToShow.length === 0) {
            const row = objectTable.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 4;
            cell.textContent = 'Nessun oggetto trovato';
            cell.className = 'text-center text-muted';
        } else {
            objectsToShow.forEach((object, index) => {
                const row = object.quantity == 0 ? zeroStockTable.insertRow() : objectTable.insertRow();
                row.insertCell(0).textContent = object.name;
                row.insertCell(1).textContent = object.quantity;
                row.insertCell(2).textContent = object.location;
                const actionsCell = row.insertCell(3);
                actionsCell.className = 'actions';

                const editBtn = document.createElement('button');
                editBtn.textContent = 'Modifica';
                editBtn.className = 'btn btn-warning btn-sm';
                editBtn.addEventListener('click', () => openEditModal(object));
                actionsCell.appendChild(editBtn);

                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Elimina';
                deleteBtn.className = 'btn btn-danger btn-sm';
                deleteBtn.addEventListener('click', () => deleteObject(object));
                actionsCell.appendChild(deleteBtn);
            });
        }
    }

    // Apri il modal per aggiungere/modificare un oggetto
    function openEditModal(object = null) {
        if (object) {
            editIndex = objects.findIndex(o => o.name === object.name && o.quantity === object.quantity && o.location === object.location);
            document.getElementById('objectName').value = object.name;
            document.getElementById('objectQuantity').value = object.quantity;
            document.getElementById('objectLocation').value = object.location;
        } else {
            editIndex = null;
            objectForm.reset();
        }
        objectModal.show();
    }

    // Salva l'oggetto
    saveObjectBtn.addEventListener('click', function () {
        const name = document.getElementById('objectName').value;
        const quantity = Number(document.getElementById('objectQuantity').value);
        const location = document.getElementById('objectLocation').value;

        if (name && !isNaN(quantity) && location) {
            const object = { name, quantity, location };
            if (editIndex !== null) {
                objects[editIndex] = object;
            } else {
                objects.push(object);
            }
            localStorage.setItem('objects', JSON.stringify(objects));
            updateTables(filteredObjects.length > 0 ? filteredObjects : objects);
            objectModal.hide();
        } else {
            alert("Compila tutti i campi correttamente!");
        }
    });

    // Elimina un oggetto
    function deleteObject(object) {
        if (confirm("Sei sicuro di voler eliminare questo oggetto?")) {
            const index = objects.findIndex(o => o.name === object.name && o.quantity === object.quantity && o.location === object.location);
            if (index !== -1) {
                objects.splice(index, 1);
                localStorage.setItem('objects', JSON.stringify(objects));
                updateTables(filteredObjects.length > 0 ? filteredObjects : objects);
            }
        }
    }

    // Cerca un oggetto
    searchBtn.addEventListener('click', function () {
        const searchTerm = prompt("Cerca oggetto per nome:").toLowerCase();
        if (searchTerm) {
            filteredObjects = objects.filter(object => object.name.toLowerCase().includes(searchTerm));
            updateTables(filteredObjects);
        } else {
            filteredObjects = [];
            updateTables(objects);
        }
    });

    // Stampa la lista
    printBtn.addEventListener('click', function () {
        window.print();
    });

    // Esporta gli oggetti in formato JSON
    exportBtn.addEventListener('click', function () {
        try {
            const dataStr = JSON.stringify(objects, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const file = new File([blob], 'objects.json', { type: 'application/json' });

            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                navigator.share({ files: [file], title: 'Oggetti HomeInventory', text: 'Lista oggetti' })
                    .then(() => alert("File esportato con successo!"))
                    .catch(() => mostraTestoJsonPerCopia(dataStr));
            } else {
                mostraTestoJsonPerCopia(dataStr);
            }
        } catch (error) {
            console.error("Errore durante l'esportazione:", error);
            alert("Si è verificato un errore durante l'esportazione dei dati.");
        }
    });

    function mostraTestoJsonPerCopia(dataStr) {
        alert("Esportazione non supportata. Puoi copiare il testo JSON qui sotto:");
        const textarea = document.createElement('textarea');
        textarea.value = dataStr;
        textarea.rows = 10;
        textarea.cols = 50;
        document.body.appendChild(textarea);
        const selectAllButton = document.createElement('button');
        selectAllButton.textContent = 'Seleziona tutto';
        selectAllButton.onclick = () => textarea.select();
        document.body.appendChild(selectAllButton);
    }

    // Gestisci l'importazione degli oggetti
    importBtn.addEventListener('click', function () {
        importFile.click();
    });

    importFile.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const importedObjects = JSON.parse(e.target.result);
                    objects = importedObjects;
                    localStorage.setItem('objects', JSON.stringify(objects));
                    updateTables();
                    alert("Oggetti importati con successo!");
                } catch (error) {
                    alert("Errore durante l'importazione. Assicurati che il file sia un JSON valido.");
                }
            };
            reader.readAsText(file);
        }
    });

    // Apri il modal per aggiungere un nuovo oggetto
    addBtn.addEventListener('click', function () {
        openEditModal();
    });

    // Inizializza le tabelle
    updateTables();
});