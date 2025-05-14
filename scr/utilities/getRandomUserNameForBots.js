class BotNameGenerator {
    constructor() {
        // Array of bot names
        this.botNames = [
            "EvanCardwell",
            "LucasDealtrey",
            "DianaTrumpton",
            "VictorSharpe",
            "EllaWinslow",
            "MasonPlayford",
            "SophiaDealman",
            "JackTrickson",
            "LiamCardston",
            "ChloeGambler",
            "ChuckShuffle",
            "AceMcDeal",
            "CardyMcCardface",
            "TrickyRicky",
            "ShuffleMuffin",
            "DealeyDan",
            "LuckyLucifer",
            "BennyBluff",
            "RummyTommy",
            "FlickerFred",
            "cleveland",
            "wilson",
            "taft",
            "hayes",
            "grant",
            "tyler",
            "buren",
            "jackson",
            "harrison",
            "adams",
        ];
    }

    // Function to get a random bot name
    getRandomBotName() {
        // Generate a random number between 0 and 9
        const randomIndex = Math.floor(Math.random() * 30);
        // Return the bot name at the random index
        return this.botNames[randomIndex];
    }
}
module.exports = BotNameGenerator;