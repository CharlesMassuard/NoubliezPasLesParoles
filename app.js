document.getElementById('searchForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Empêche la soumission du formulaire

    const searchQuery = event.target.search.value;
    const trackName = encodeURIComponent(searchQuery.split(' - ')[0]);
    const artistName = encodeURIComponent(searchQuery.split(' - ')[1]);

    let motTrouves = [];

    // Sélectionner l'élément avec l'ID 'divJeu'
    const divJeu = document.getElementById('divJeu');

    // Vérifier si l'élément existe et le supprimer
    if (divJeu) {
        divJeu.remove();
    }

    fetch(`https://lrclib.net/api/search?track_name=${trackName}&artist_name=${artistName}`)
        .then(response => response.json())
        .then(data => {
            let paroles = data[0]["plainLyrics"];
            // Split the lyrics by both spaces and newlines
            const words = paroles.split(/\s+|\n/); // Split by space, multiple spaces, or newline

            const longestWordLength = words.reduce((maxLength, word) => {
                return Math.max(maxLength, word.length);
            }, 0);

            let texteDefautCell = "";
            
            for(let i = 0; i < longestWordLength; i++) {
                texteDefautCell += "&#xA0;";
            }


            const divJeu = document.createElement('div');
            divJeu.id = 'divJeu';
            // Créer la table
            const table = document.createElement('table');
            const tbody = document.createElement('tbody');
            table.appendChild(tbody);
            document.body.appendChild(table);

            // Appliquer les styles pour centrer le tableau et ajouter des bordures
            table.style.margin = '0 auto';
            table.style.borderCollapse = 'collapse';
            table.style.width = '80%';

            // Initialisation des variables pour gérer les colonnes
            let currentColumn = document.createElement('td');
            const firstRow = document.createElement('tr');
            firstRow.id = 'firstRow';
            firstRow.appendChild(currentColumn);
            tbody.appendChild(firstRow);

            let columnHeight = 0;
            const maxHeight = window.innerHeight - 100; // Réduction pour tenir compte des marges

            // Dictionnaire pour stocker les indices des mots
            let wordIndices = {};

            let numCol = 0;
            let index = 0;
            words.forEach((word) => {
                // Créer une ligne et y ajouter un mot
                const row = document.createElement('tr');
                const cell = document.createElement('td');
                cell.innerHTML = texteDefautCell;
                cell.style.border = '1px solid black'; // Ajouter une bordure aux cellules
                cell.style.padding = '5px'; // Ajouter du padding aux cellules

                // Ajouter la ligne à la colonne actuelle
                row.appendChild(cell);
                currentColumn.appendChild(row);

                // Ajouter l'indice de la case au dictionnaire
                if (!wordIndices[word]) {
                    wordIndices[word] = [];
                }
                wordIndices[word].push([numCol, index]);

                // Obtenir la hauteur réelle après l'ajout
                const rowHeight = row.offsetHeight || 20; // Fallback si `offsetHeight` est 0
                columnHeight += rowHeight;

                // Si la hauteur dépasse l'écran, on commence une nouvelle colonne
                if (columnHeight > maxHeight) {
                    currentColumn = document.createElement('td');
                    firstRow.appendChild(currentColumn);
                    columnHeight = rowHeight; // Réinitialiser pour la nouvelle colonne
                    numCol++;
                    index = 0;
                }
                index++;
            });

            // Fonction pour afficher les cases du tableau en utilisant les indices
            function showTableCells(word) {
                const lowerCaseWord = word.toLowerCase();
                const lowerCaseWordIndices = Object.keys(wordIndices).reduce((acc, key) => {
                    acc[key.toLowerCase()] = key;
                    return acc;
                }, {});

                if (lowerCaseWordIndices[lowerCaseWord] && !motTrouves.includes(lowerCaseWord)) {
                    const originalWord = lowerCaseWordIndices[lowerCaseWord];
                    let firstTR = document.getElementById('firstRow');
                    wordIndices[originalWord].forEach((indices) => {
                        let col = indices[0];
                        let row = indices[1];
                        let cell = firstTR.children[col].children[row];
                        cell.children[0].style.display = 'table-cell';
                        cell.children[0].textContent = originalWord;
                        wordToShowInput.value = '';
                        motTrouves.push(lowerCaseWord);
                    });
                }
            }

            // Ajouter le champ de saisie pour le mot à afficher
            const inputContainer = document.createElement('div');
            const wordToShowInput = document.createElement('input');
            wordToShowInput.setAttribute('type', 'text');
            wordToShowInput.setAttribute('placeholder', 'Mot à afficher');

            inputContainer.appendChild(wordToShowInput);
            document.body.appendChild(inputContainer);

            // Ajouter un écouteur d'événement pour le bouton d'affichage
            wordToShowInput.addEventListener('input', () => {
                const wordToShow = wordToShowInput.value;
                showTableCells(wordToShow);
            });

            divJeu.appendChild(inputContainer);
            divJeu.appendChild(table);
            document.body.appendChild(divJeu);
        });
});