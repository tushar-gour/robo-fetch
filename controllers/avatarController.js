import { fetchWithFailover } from '../services/fetchService.js';

export const getAvatarOutfits = async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
    }

    let allOutfits = [];
    let cursor = null;
    let remaining = 100; // Assume 100 outfits max (can be adjusted dynamically or as per user request)

    try {
        while (remaining > 0) {
            const {
                data,
                nextPageCursor,
                remaining: updatedRemaining,
            } = await fetchWithFailover(userId, cursor, remaining);

            allOutfits.push(...data);

            if (!nextPageCursor) break;

            cursor = nextPageCursor;
            remaining = updatedRemaining;
        }

        res.json(allOutfits);
    } catch (e) {
        console.error(`Failed to fetch outfits:`, e.message);
        res.status(500).json({ error: "Failed to fetch avatar data from all sources" });
    }
};
