import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const ffmpeg = createFFmpeg({ log: true });

export const downloadAudio = async (videoUrl, filename) => {
  try {
    await ffmpeg.load();
    
    // Fetch video
    const videoData = await fetchFile(videoUrl);
    ffmpeg.FS('writeFile', 'input.mp4', videoData);
    
    // Convert to MP3
    await ffmpeg.run(
      '-i', 'input.mp4',
      '-vn',
      '-acodec', 'libmp3lame',
      '-q:a', '2',
      'output.mp3'
    );
    
    // Download file
    const data = ffmpeg.FS('readFile', 'output.mp3');
    const blob = new Blob([data.buffer], { type: 'audio/mp3' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.mp3`;
    a.click();
    
    // Cleanup
    URL.revokeObjectURL(url);
    ffmpeg.FS('unlink', 'input.mp4');
    ffmpeg.FS('unlink', 'output.mp3');
  } catch (error) {
    console.error('Error downloading audio:', error);
    throw error;
  }
};
