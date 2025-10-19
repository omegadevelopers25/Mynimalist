const express = require('express');
const ytdl = require('ytdl-core');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Download endpoint
app.get('/download/:videoId', async (req, res) => {
    try {
        const videoId = req.params.videoId;
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        
        // Validate video URL
        if (!ytdl.validateURL(videoUrl)) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }
        
        // Get video info
        const info = await ytdl.getInfo(videoId);
        const title = info.videoDetails.title.replace(/[^\w\s-]/g, '').trim();
        
        // Set headers for download
        res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
        res.header('Content-Type', 'audio/mpeg');
        
        // Stream the audio
        const audioStream = ytdl(videoUrl, {
            filter: 'audioonly',
            quality: 'highestaudio',
            format: 'mp3'
        });
        
        audioStream.pipe(res);
        
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Failed to download video' });
    }
});

// Get video info endpoint
app.get('/info/:videoId', async (req, res) => {
    try {
        const videoId = req.params.videoId;
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        
        if (!ytdl.validateURL(videoUrl)) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }
        
        const info = await ytdl.getInfo(videoId);
        
        res.json({
            title: info.videoDetails.title,
            author: info.videoDetails.author.name,
            duration: info.videoDetails.lengthSeconds,
            thumbnail: info.videoDetails.thumbnails[0].url
        });
        
    } catch (error) {
        console.error('Info error:', error);
        res.status(500).json({ error: 'Failed to get video info' });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Note: This is a demo server. For production use, implement proper error handling and security measures.');
});