const getRandomAlphabeticChars = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < 28; i++) {
        const randomIndex = Math.floor(Math.random() * alphabet.length);
        result += alphabet[randomIndex];
    }

    return result;
}

module.exports = getRandomAlphabeticChars;
