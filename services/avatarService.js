import axios from 'axios';
import NodeCache from 'node-cache';
import pLimit from 'p-limit';

// Initialize cache (stores data for 1 hour)
const avatarCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

// Limit concurrent requests to 1 (to prevent hitting the rate limit too quickly)
const limit = pLimit(1);

export const fetchOutfits = async (userId) => {
    const cachedData = avatarCache.get(userId);
    if (cachedData) {
        return cachedData.data; // Only return the "data" array
    }

    try {
        console.log(`Fetching outfits for user ${userId} from Roblox API...`);
        
        // Throttle the requests (ensure only 1 request at a time)
        const response = await limit(() => axios.get(`https://avatar.roblox.com/v1/users/${userId}/outfits`));
        const outfitData = response.data;

        // Check if "data" exists and is not empty
        if (!outfitData || !outfitData.data || outfitData.data.length === 0) {
            console.warn(`No outfits found for user ${userId}`);
            return []; // Return empty array if no outfits found
        }

        // Cache the response
        avatarCache.set(userId, outfitData);
        return outfitData; // Return only the "data" array
    } catch (error) { 
        if (error.response?.data?.errors[0]?.message === 'Too many requests') {
            console.warn('Rate limit exceeded. Retrying...');
            // Retry after a delay
            await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for 10 seconds
            return fetchOutfits(userId); // Retry the request after delay
        }

        console.error(`Error fetching outfits for user ${userId}:`, error.response?.data || error.message);
        return []; // Return empty array if there’s an error
    }
};
