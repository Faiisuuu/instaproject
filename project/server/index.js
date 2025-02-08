import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Updated Instagram configuration
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';

// Updated helper function to get video ID
const getVideoId = (url) => {
    const regex = /\/(?:reel|p)\/([A-Za-z0-9_-]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
};

app.post('/api/download', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const videoId = getVideoId(url);
        if (!videoId) {
            return res.status(400).json({ error: 'Invalid Instagram URL' });
        }

        // First, get the media info
        const response = await axios.get(`https://www.instagram.com/reel/${videoId}/?__a=1&__d=dis`, {
            headers: {
                'User-Agent': USER_AGENT,
                'Accept': 'application/json',
                'Accept-Language': 'en-US,en;q=0.5',
                'Origin': 'https://www.instagram.com',
                'Referer': 'https://www.instagram.com/',
                'Cookie': 'ig_did=; csrftoken=; sessionid=;', // You'll need to add valid cookies here
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin',
            }
        });

        // Handle the new Instagram response structure
        const mediaData = response.data.items?.[0] || response.data.graphql?.shortcode_media;
        
        if (!mediaData) {
            return res.status(404).json({ error: 'Video data not found' });
        }

        // Get video URL from different possible locations in response
        const videoUrl = mediaData.video_url || 
                        mediaData.video_versions?.[0]?.url ||
                        mediaData.carousel_media?.[0]?.video_versions?.[0]?.url;

        if (!videoUrl) {
            return res.status(404).json({ error: 'Video URL not found' });
        }

        // Get video metadata
        const videoResponse = await axios.head(videoUrl, {
            headers: {
                'User-Agent': USER_AGENT,
                'Referer': 'https://www.instagram.com/'
            }
        });

        res.json({
            videoUrl,
            size: videoResponse.headers['content-length'],
            type: videoResponse.headers['content-type']
        });

    } catch (error) {
        console.error('Error downloading video:', error);
        let errorMessage = 'Failed to download video';
        
        if (error.response) {
            if (error.response.status === 404) {
                errorMessage = 'Video not found or may be private';
            } else if (error.response.status === 429) {
                errorMessage = 'Too many requests. Please try again later';
            } else if (error.response.status === 401) {
                errorMessage = 'Authentication required. Please provide valid Instagram cookies';
            }
        }
        
        res.status(500).json({ 
            error: errorMessage,
            details: error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});