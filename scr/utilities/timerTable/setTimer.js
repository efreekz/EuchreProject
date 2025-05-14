function getTimePlus30Seconds() {
    const currentTime = new Date();
    currentTime.setSeconds(currentTime.getSeconds() + 30); // Add 30 seconds
    return currentTime.toISOString(); // Return in ISO format
}

function isCurrentTimeGreaterThan(isoTimeString) {
    const currentTime = new Date();
    const targetTime = new Date(isoTimeString); // Parse the ISO time string
    return currentTime >= targetTime;
}
function getRemainingSeconds(isoTimeString) {
    const currentTime = new Date();
    const targetTime = new Date(isoTimeString);
    const differenceInMillis = targetTime - currentTime;
    if (differenceInMillis <= 0) {
        return 0;
    }
    const differenceInSeconds = Math.floor(differenceInMillis / 1000);
    return differenceInSeconds;
}

// Example usage:
// const targetTime = "2024-12-31T23:59:59Z"; // ISO time string
// const remainingSeconds = getRemainingSeconds(targetTime);
// console.log(`Remaining seconds: ${remainingSeconds}`);


// Example usage
// const timePlus30 = getTimePlus30Seconds();
// console.log("Time Plus 30 Seconds:", timePlus30);

// const comparisonResult = isCurrentTimeGreaterThan(timePlus30);
// console.log("Is current time greater than time plus 30 seconds?", comparisonResult);


module.exports = { getTimePlus30Seconds, isCurrentTimeGreaterThan, getRemainingSeconds }