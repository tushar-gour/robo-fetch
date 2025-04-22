import axios from 'axios';

const subservers = [
  "http://localhost:4000",
  "http://localhost:4001",
  "http://localhost:4002",
];

let currentServerIndex = 0;

export const fetchWithFailover = async (userId, cursor, remaining) => {
  const startIndex = currentServerIndex;
  let attempts = 0;

  while (attempts < subservers.length) {
    const server = subservers[currentServerIndex];
    currentServerIndex = (currentServerIndex + 1) % subservers.length;

    try {
      const response = await axios.get(`${server}/avatar`, {
        params: { userId, cursor },
      });
      const { data, nextPageCursor } = response.data;

      if (data.length < remaining) {
        remaining -= data.length;
      } else {
        remaining = 0; // We’ve fetched the needed outfits
      }

      return { data, nextPageCursor, remaining };
    } catch (e) {
      const status = e.response?.status;
      const msg = e.response?.data?.error || e.message;

      if (status === 429) {
        console.warn(`Server ${server} hit rate limit. Trying next...`);
        attempts++;
        continue;
      } else {
        console.error(`Non-rate-limit error from ${server}:`, msg);
        throw e; // Stop retrying on non-429 error
      }
    }
  }

  throw new Error("All servers hit rate limit. Please try again later.");
};
