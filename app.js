document.getElementById('searchForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Empêche la soumission du formulaire

    const searchQuery = event.target.search.value;
    const trackName = encodeURIComponent(searchQuery.split(' - ')[0]);
    const artistName = encodeURIComponent(searchQuery.split(' - ')[1]);

    console.log('Track name:', trackName);

    fetch(`https://lrclib.net/api/search?track_name=${trackName}&artist_name=${artistName}`)
        .then(response => response.json())
        .then(data => {
            let paroles = data[0]["plainLyrics"];
            
            // Split the lyrics by both spaces and newlines
            const words = paroles.split(/\s+|\n/); // Split by space, multiple spaces, or newline

            // Créer la table
            const table = document.createElement('table');
            const tbody = document.createElement('tbody');
            table.appendChild(tbody);
            document.body.appendChild(table);

            // Initialisation des variables pour gérer les colonnes
            let currentColumn = document.createElement('td');
            const firstRow = document.createElement('tr');
            firstRow.appendChild(currentColumn);
            tbody.appendChild(firstRow);

            let columnHeight = 0;
            const maxHeight = window.innerHeight - 100; // Réduction pour tenir compte des marges

            // Dictionnaire pour stocker les indices des mots
            let wordIndices = {};

            words.forEach((word, index) => {
                // Créer une ligne et y ajouter un mot
                const row = document.createElement('tr');
                const cell = document.createElement('td');
                cell.textContent = word;

                // Ajouter la ligne à la colonne actuelle
                row.appendChild(cell);
                currentColumn.appendChild(row);

                // Ajouter l'indice de la case au dictionnaire
                if (!wordIndices[word]) {
                    wordIndices[word] = [];
                }
                wordIndices[word].push(index);

                // Obtenir la hauteur réelle après l'ajout
                const rowHeight = row.offsetHeight || 20; // Fallback si `offsetHeight` est 0
                columnHeight += rowHeight;

                // Si la hauteur dépasse l'écran, on commence une nouvelle colonne
                if (columnHeight > maxHeight) {
                    currentColumn = document.createElement('td');
                    firstRow.appendChild(currentColumn);
                    columnHeight = rowHeight; // Réinitialiser pour la nouvelle colonne
                }
            });

            console.log('wordIndices:', wordIndices);

            // Fonction pour modifier les cases du tableau en utilisant les indices
            function modifyTableCells(word, newText) {
                if (wordIndices[word]) {
                    wordIndices[word].forEach(index => {
                        const cell = tbody.querySelectorAll('td')[index+1];
                        if (cell) {
                            cell.textContent = newText;
                        }
                    });
                }
            }

            // Exemple d'utilisation
            modifyTableCells('puis', 'nouveau texte');
        });
});