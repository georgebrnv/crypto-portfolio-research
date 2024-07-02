document.addEventListener('DOMContentLoaded', function() {
    var addNoteBtn = document.getElementById('addNoteBtn');
    var generateNoteBtn = document.getElementById('generateNoteBtn');
    var addNoteModal = document.getElementById('addNoteModal');
    var generateNoteModal = document.getElementById('generateNoteModal');
    var closeAddNoteModal = document.getElementById('closeAddNoteModal');
    var closeGenerateNoteModal = document.getElementById('closeGenerateNoteModal');

    addNoteBtn.addEventListener('click', function() {
        addNoteModal.style.display = 'block';
    });

    generateNoteBtn.addEventListener('click', function() {
        generateNoteModal.style.display = 'block';
    });

    closeAddNoteModal.addEventListener('click', function() {
        addNoteModal.style.display = 'none';
    });

    closeGenerateNoteModal.addEventListener('click', function() {
        generateNoteModal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target == addNoteModal) {
            addNoteModal.style.display = 'none';
        }
        if (event.target == generateNoteModal) {
            generateNoteModal.style.display = 'none';
        }
    });
});