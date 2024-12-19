document.getElementById('rechercherParoles').addEventListener('click', function(event) {
    event.preventDefault(); // Empêche la soumission du formulaire
    const trackName = encodeURIComponent(document.getElementById('searchInputSon').value);
    const artistName = encodeURIComponent(document.getElementById('searchInputArtiste').value);

    let motTrouves = [];
    let total_mots_trouves = 0;

    // Supprimer l'élément avec l'ID 'divJeu' s'il existe
    const divJeu = document.getElementById('divJeu');
    if (divJeu) {
        divJeu.remove();
    }

    fetch(`https://lrclib.net/api/search?track_name=${trackName}&artist_name=${artistName}`)
        .then(response => response.json())
        .then(data => {
            let paroles = data[0]["plainLyrics"];   
            let words = paroles.split(/\s+|\n/).map(word => word.replace(/[.,\/#!$%\^&\*;:{}=\_`~()]/g, ""));
            nbr_mots = words.length;
            words = words.filter(word => word.length > 0);

            const longestWordLength = words.reduce((maxLength, word) => {
                return Math.max(maxLength, word.length);
            }, 0);

            let texteDefautCell = "";
            for (let i = 0; i < longestWordLength+7; i++) {
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

                const rowHeight = row.offsetHeight || 20;
                columnHeight += rowHeight;
                if (columnHeight > maxHeight) {
                    currentColumn = document.createElement('td');
                    firstRow.appendChild(currentColumn);
                    columnHeight = rowHeight;
                    numCol++;
                    index = 0;
                }

                cell.innerHTML = texteDefautCell;
                cell.classList.add('cellJeu');

                if (!wordIndices[simplifiedWord]) {
                    wordIndices[simplifiedWord] = {
                        originalWord: word, // Conserver la casse originale
                        positions: []
                    };
                }
                wordIndices[simplifiedWord].positions.push([numCol, index]);
                row.appendChild(cell);
                currentColumn.appendChild(row);
                columnHeight += rowHeight; // Mettre à jour la hauteur de la colonne
                index++;

            });

            // Fonction pour afficher les cases du tableau en utilisant les indices
            function showTableCells(word, lost=false) {
                const simplifiedWord = simplifyWord(word); // Simplifier la saisie de l'utilisateur
                if (wordIndices[simplifiedWord] && !motTrouves.includes(simplifiedWord)) {
                    const originalWord = wordIndices[simplifiedWord].originalWord; // Récupérer la version originale
                    wordIndices[simplifiedWord].positions.forEach((indices) => {
                        const colIndex = indices[0];
                        const rowIndex = indices[1];
            
                        // Vérifier si la colonne et la ligne existent avant d'accéder
                        const column = firstRow.children[colIndex];
                        if (column) {
                            const cellRow = column.children[rowIndex];
                            if (cellRow && cellRow.firstChild) {
                                const cell = cellRow.firstChild;
                                cell.style.display = 'table-cell';
                                if (lost){
                                    cell.style.backgroundColor = 'rgba(255, 0, 0, 0.38)';
                                }else{
                                    cell.style.backgroundColor = 'rgb(16, 197, 0)';
                                    total_mots_trouves++;
                                    // Remettre le fond par défaut après un délai
                                    setTimeout(() => {
                                        cell.style.backgroundColor = '';
                                    }, 1000);
                                }
                                cell.textContent = originalWord; // Affiche le mot original avec la bonne casse
    
                            }
                        }
                    });
                    
                    wordToShowInput.value = '';
                    motTrouves.push(simplifiedWord);
                    text_mot.innerHTML = total_mots_trouves + "/" + nbr_mots + " paroles trouvées";
                }
            }
            

            // Ajouter le champ de saisie pour le mot à afficher
            const inputContainer = document.createElement('div');
            const wordToShowInput = document.createElement('input');
            wordToShowInput.setAttribute('type', 'text');
            wordToShowInput.setAttribute('placeholder', 'Mot à afficher');
            wordToShowInput.id = "wordToShowInput";
            const buttonVoirAllParoles = document.createElement('button');
            buttonVoirAllParoles.innerHTML = "Voir toutes les paroles";
            buttonVoirAllParoles.addEventListener('click', () => {
                words.forEach((word) => {
                    showTableCells(word, true);
                });
            });

            let text_mot = document.createElement('p');
            text_mot.innerHTML = "0/" + nbr_mots + " paroles trouvées";

            inputContainer.appendChild(wordToShowInput);
            inputContainer.appendChild(buttonVoirAllParoles);
            document.body.appendChild(inputContainer);

            // Ajouter un écouteur d'événement pour le champ d'entrée
            wordToShowInput.addEventListener('input', () => {
                const wordToShow = wordToShowInput.value;
                showTableCells(wordToShow);
            });

            divJeu.appendChild(inputContainer);
            divJeu.appendChild(text_mot);
            divJeu.appendChild(table);
            document.body.appendChild(divJeu);
            document.getElementById('wordToShowInput').focus();
        });
});

document.getElementById("searchInputSon").addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        let searchInputArtiste = document.getElementById("searchInputArtiste");
        searchInputArtiste.focus();
        if(searchInputArtiste.value.length > 0){
            searchInputArtiste.setSelectionRange(0, searchInputArtiste.value.length);
        }
    }
    if (event.key === "ArrowRight") {
        const cursorPosition = this.selectionStart;
        if (cursorPosition === this.value.length && wasAtEnd) {
            event.preventDefault();
            const searchInputArtiste = document.getElementById("searchInputArtiste");
            searchInputArtiste.focus();
        }
        wasAtEnd = cursorPosition === this.value.length;
    } else {
        wasAtEnd = false;
    }
});

document.getElementById("searchInputArtiste").addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        rechercherParoles.click();
    }
    if (event.key === "ArrowLeft") {
        const cursorPosition = this.selectionStart;
        if (cursorPosition === 0 && wasAtStart) {
            event.preventDefault();
            const searchInputSon = document.getElementById("searchInputSon");
            searchInputSon.focus();
        }
        wasAtStart = cursorPosition === 0;
    } else {
        wasAtStart = false;
    }
});
