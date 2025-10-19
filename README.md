# Minimalist YouTube Music App

A beautiful, minimalist music application built with YouTube API integration, featuring download capabilities, playlist management, and a modern dark/light theme.

## Features

- 🎵 **YouTube Music Integration** - Search and play music from YouTube
- 📱 **Minimalist Design** - Clean, modern interface with smooth animations
- 🌙 **Dark/Light Theme** - Toggle between dark and light modes
- 📥 **Download Support** - Download tracks as MP3 files
- 📋 **Playlist Management** - Create and manage custom playlists
- ❤️ **Like System** - Save your favorite tracks
- 🔀 **Shuffle & Repeat** - Control playback modes
- ⌨️ **Keyboard Shortcuts** - Quick controls with keyboard
- 💾 **Local Storage** - All data saved locally in your browser

## Keyboard Shortcuts

- `Space` - Play/Pause
- `←` - Previous track
- `→` - Next track
- `L` - Like/Unlike current track
- `S` - Toggle shuffle
- `R` - Toggle repeat mode

## Installation & Setup

### Option 1: Simple Version (No Downloads)
```bash
# Install dependencies
npm install

# Run simple server
npm run simple
```

Then open `http://localhost:8000` in your browser.

### Option 2: Full Version (With Downloads)
```bash
# Install dependencies
npm install

# Start the server
npm start
```

Then open `http://localhost:3000` in your browser.

## API Configuration

The app uses the provided YouTube API key: `AIzaSyCov9Fdbq1T0LS2z5xUClFYnyTdcnGGMUU`

**Note**: This is a demo API key. For production use, you should:
1. Create your own YouTube API key
2. Enable the YouTube Data API v3
3. Replace the key in `script.js`

## Project Structure

```
├── index.html          # Main HTML file
├── styles.css          # CSS styles and themes
├── script.js           # Main JavaScript application
├── server.js           # Express server for downloads
├── package.json        # Dependencies and scripts
└── README.md          # This file
```

## Features Breakdown

### Search & Play
- Search for music using YouTube's API
- Play tracks directly in the browser
- Add tracks to queue
- View search results with thumbnails

### Player Controls
- Play/Pause functionality
- Previous/Next track navigation
- Progress bar with seeking
- Shuffle and repeat modes
- Volume control (coming soon)

### Playlist Management
- Create custom playlists
- Add tracks to playlists
- View playlist details
- Play entire playlists

### Download System
- Download tracks as MP3 files
- Server-side processing with ytdl-core
- Automatic filename generation
- Progress tracking

### Theme System
- Dark mode (default)
- Light mode
- Smooth transitions
- Persistent theme selection

## Technical Details

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with Flexbox/Grid
- **Vanilla JavaScript** - No frameworks, pure JS
- **Local Storage** - Data persistence
- **YouTube API v3** - Music search and metadata

### Backend (Optional)
- **Express.js** - Web server
- **ytdl-core** - YouTube video downloading
- **CORS** - Cross-origin requests
- **Streaming** - Efficient file downloads

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Limitations

1. **CORS Restrictions** - Direct YouTube audio playback is limited due to CORS policies
2. **Demo API Key** - The provided key has usage limits
3. **Server Dependency** - Downloads require the Express server
4. **Audio Quality** - Limited to available YouTube audio formats

## Future Enhancements

- [ ] User authentication
- [ ] Cloud playlist sync
- [ ] Social features (sharing, following)
- [ ] Advanced audio controls (equalizer, effects)
- [ ] Mobile app version
- [ ] Offline playback
- [ ] Lyrics display
- [ ] Music recommendations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions:
1. Check the browser console for errors
2. Ensure the server is running (for downloads)
3. Verify your internet connection
4. Try refreshing the page

## Disclaimer

This application is for educational purposes. Please respect YouTube's Terms of Service and copyright laws when using this application. The download feature should only be used for personal use and with content you have the right to download.