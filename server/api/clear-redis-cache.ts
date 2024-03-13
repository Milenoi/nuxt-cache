export default defineEventHandler(async (event) => {
    try {
        // List all keys with Redis cache
        const cacheKeys = await useStorage('redis').getKeys();

        // Remove each item from the Redis cache
        await Promise.all(cacheKeys.map(cacheKey => useStorage('redis').removeItem(cacheKey)));

        // Return success message
        return {
            status: 200,
            message: 'Redis cache cleared successfully. Refresh the page to see the changes.'
        };
    } catch (error) {
        // Return error message if an error occurs
        return {
            status: 500,
            error: 'Internal Server Error',
            message: 'Failed to clear Redis cache.'
        };
    }
});
