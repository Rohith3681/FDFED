import redisClient from '../config/redisClient.js';

export const cacheMiddleware = async (req, res, next) => {
    try {
        const key = req.originalUrl;
        const cachedData = await redisClient.get(key);
        
        if (cachedData) {
            return res.json(JSON.parse(cachedData));
        }
        
        res.sendResponse = res.json;
        res.json = async (data) => {
            await redisClient.setEx(key, 3600, JSON.stringify(data)); // Cache for 1 hour
            res.sendResponse(data);
        };
        
        next();
    } catch (error) {
        console.error('Cache middleware error:', error);
        next();
    }
};