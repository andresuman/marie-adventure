window.QuizStats = (function () {
    const KEY_TOTAL   = 'marie-quiz-total';
    const KEY_ACERTOS = 'marie-quiz-acertos';
    return {
        getTotal()   { return parseInt(localStorage.getItem(KEY_TOTAL)   || '0', 10); },
        getAcertos() { return parseInt(localStorage.getItem(KEY_ACERTOS) || '0', 10); },
        registrar(acertou) {
            localStorage.setItem(KEY_TOTAL, String(this.getTotal() + 1));
            if (acertou) localStorage.setItem(KEY_ACERTOS, String(this.getAcertos() + 1));
        }
    };
})();
