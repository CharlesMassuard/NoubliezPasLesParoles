document.getElementById('searchForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Empêche la soumission du formulaire

    const searchQuery = event.target.search.value;
    const trackName = encodeURIComponent(searchQuery.split(' - ')[0]);
    const artistName = encodeURIComponent(searchQuery.split(' - ')[1]);

    let motTrouves = [];

    // Supprimer l'élément avec l'ID 'divJeu' s'il existe
    const divJeu = document.getElementById('divJeu');
    if (divJeu) {
        divJeu.remove();
    }

    fetch(`https://lrclib.net/api/search?track_name=${trackName}&artist_name=${artistName}`)
        .then(response => response.json())
        .then(data => {
            let paroles = data[0]["plainLyrics"];
            let words = paroles.split(/\s+|\n/).map(word => word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ""));
            words = words.filter(word => word.length > 0);

            const longestWordLength = words.reduce((maxLength, word) => {
                return Math.max(maxLength, word.length);
            }, 0);

            let texteDefautCell = "";
            for (let i = 0; i < longestWordLength+5; i++) {
                texteDefautCell += "&#xA0;";
            }

            const divJeu = document.createElement('div');
            divJeu.id = 'divJeu';

            // Créer la table
            const table = document.createElement('table');
            const tbody = document.createElement('tbody');
            table.appendChild(tbody);
            document.body.appendChild(table);

            // Initialisation des variables pour gérer les colonnes
            let currentColumn = document.createElement('td');
            const firstRow = document.createElement('tr');
            firstRow.id = 'firstRow';
            firstRow.appendChild(currentColumn);
            tbody.appendChild(firstRow);

            let columnHeight = 0;
            const maxHeight = window.innerHeight - 100;

            // Fonction pour simplifier un mot (retirer les accents, ligatures, etc.)
            function simplifyWord(word) {
                return word
                    .normalize('NFD') // Décomposer les caractères accentués
                    .replace(/[\u0300-\u036f]/g, '') // Supprimer les diacritiques
                    .replace(/œ/g, 'oe') // Remplacer ligature œ
                    .toLowerCase(); // Mettre en minuscules
            }

            // Dictionnaire pour stocker les indices des mots (simplifiés) et leurs versions originales
            let wordIndices = {};

            let numCol = 0;
            let index = 0;
            words.forEach((word) => {
                const simplifiedWord = simplifyWord(word); // Version simplifiée du mot
                const row = document.createElement('tr');
                const cell = document.createElement('td');
                cell.innerHTML = texteDefautCell;
                cell.classList.add('cellJeu');

                row.appendChild(cell);
                currentColumn.appendChild(row);

                if (!wordIndices[simplifiedWord]) {
                    wordIndices[simplifiedWord] = {
                        originalWord: word, // Conserver la casse originale
                        positions: []
                    };
                }
                wordIndices[simplifiedWord].positions.push([numCol, index]);

                const rowHeight = row.offsetHeight || 20;
                columnHeight += rowHeight;

                if (columnHeight > maxHeight) {
                    currentColumn = document.createElement('td');
                    firstRow.appendChild(currentColumn);
                    columnHeight = rowHeight;
                    numCol++;
                    index = 0;
                }
                index++;
            });

            // Fonction pour afficher les cases du tableau en utilisant les indices
            function showTableCells(word) {
                const simplifiedWord = simplifyWord(word); // Simplifier la saisie de l'utilisateur
                if (wordIndices[simplifiedWord] && !motTrouves.includes(simplifiedWord)) {
                    const originalWord = wordIndices[simplifiedWord].originalWord; // Récupérer la version originale
                    wordIndices[simplifiedWord].positions.forEach((indices) => {
                        const col = indices[0];
                        const row = indices[1];
                        const cell = firstRow.children[col].children[row];
                        cell.children[0].style.display = 'table-cell';
                        cell.children[0].style.backgroundColor = 'rgb(16, 197, 0)';
                        cell.children[0].textContent = originalWord; // Affiche le mot original avec la bonne casse

                        //remettre le background par défaut
                        setTimeout(() => {
                            cell.children[0].style.backgroundColor = '';
                        }, 1000);
                    });
                    wordToShowInput.value = '';
                    motTrouves.push(simplifiedWord);
                }
            }

            // Ajouter le champ de saisie pour le mot à afficher
            const inputContainer = document.createElement('div');
            const wordToShowInput = document.createElement('input');
            wordToShowInput.setAttribute('type', 'text');
            wordToShowInput.setAttribute('placeholder', 'Mot à afficher');

            inputContainer.appendChild(wordToShowInput);
            document.body.appendChild(inputContainer);

            // Ajouter un écouteur d'événement pour le champ d'entrée
            wordToShowInput.addEventListener('input', () => {
                const wordToShow = wordToShowInput.value;
                showTableCells(wordToShow);
            });

            divJeu.appendChild(inputContainer);
            divJeu.appendChild(table);
            document.body.appendChild(divJeu);
        });
});
