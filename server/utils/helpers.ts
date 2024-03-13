import crypto from "crypto";

/**
 * Get the formatted date string based on the input date string.
 *
 * @param {string} dateString - The input date string to be formatted.
 * @return {string} The formatted date string.
 */
const getFormatDate = (dateString: string): string => {
    const date = new Date(dateString);

    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };

    return date.toLocaleDateString('en-US', options);
}

/**
 * Get a formatted counter using the given number.
 *
 * @param {number} number - The number to be formatted
 * @return {string} The formatted counter
 */
const getFormattedCounter = (number: number): string => {
    return new Intl.NumberFormat('de-De').format(number);
}

/**
 * Split the string into an array of values
 *
 * @param {string} str - the input string
 * @return {string} the combined hash key
 */
function createHashKeyFromString(str: string): string {
    // Split the string into an array of values
    const values = str.split(',');

    // Hash each value individually
    const hashedValues = values.map(value => {
        return crypto.createHash('sha256').update(value.trim()).digest('hex');
    });

    // Combine the hashed values into a single hash key
    return hashedValues.join('');
}

export {
    getFormatDate,
    getFormattedCounter,
    createHashKeyFromString
}
