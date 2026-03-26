window.HighScore = (function () {
    const KEY = 'marie-highscore';
    return {
        get() {
            return parseInt(localStorage.getItem(KEY) || '0', 10);
        },
        // Salva se for maior que o recorde atual. Retorna true se for novo recorde.
        check(score) {
            if (score > this.get()) {
                localStorage.setItem(KEY, String(score));
                return true;
            }
            return false;
        }
    };
})();
