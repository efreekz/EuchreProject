// referralCode.js

// Function to generate a random 5-character referral code
function generateReferralCode(userId) {
    const characters = userId ? userId : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let referralCode = '';
    for (let i = 0; i < 5; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        referralCode += characters[randomIndex];
    }
    return referralCode;
}

// Export the function using module.exports
module.exports = generateReferralCode;
