import express from 'express';
import axios from 'axios';
import NodeCache from 'node-cache';

const app = express();
const PORT = 3000;

// Initialize cache (stores data for 1 hour)
const avatarCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

// Function to fetch outfits from Roblox API
const fetchOutfits = async (userId) => {
    const cachedData = avatarCache.get(userId);
    if (cachedData) {
        return cachedData.data; // Only return the "data" array
    }

    try {
        console.log(`Fetching outfits for user ${userId} from Roblox API...`);
        const response = await axios.get(`https://avatar.roblox.com/v1/users/${userId}/outfits`);
        const outfitData = response.data;

        // Check if "data" exists and is not empty
        if (!outfitData || !outfitData.data || outfitData.data.length === 0) {
            console.warn(`No outfits found for user ${userId}`);
            return []; // Return empty array if no outfits found
        }

        // Cache the response
        avatarCache.set(userId, outfitData);
        return outfitData.data; // Return only the "data" array
    } catch (error) {
        console.error(`Error fetching outfits for user ${userId}:`, error.response?.data || error.message);
        return []; // Return empty array if there’s an error
    }
};

// API Endpoint: Fetch outfits for a single user
app.get('/avatar', async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ error: 'No userId provided' });
    }

    const outfits = await fetchOutfits(userId);
    res.json(outfits); // Directly return the "data" array
});

// Start the server
app.listen(PORT, () => console.log(`RoboFetch is running on http://localhost:${PORT}`));
