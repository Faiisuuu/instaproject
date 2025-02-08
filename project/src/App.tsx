import React, { useState } from 'react';
import { Download, Instagram, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface VideoData {
  videoUrl: string;
  size: number;
  type: string;
}

function App() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [videoData, setVideoData] = useState<VideoData | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      setError('Please enter an Instagram URL');
      setStatus('error');
      return;
    }

    if (!url.includes('instagram.com')) {
      setError('Please enter a valid Instagram URL');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to download video');
      }

      const data = await response.json();
      setVideoData(data);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download video');
      setStatus('error');
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDownload = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <Instagram className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Instagram Video Downloader
            </h1>
            <p className="text-white/80">
              Download your favorite Instagram videos in high quality
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label 
                  htmlFor="url" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Instagram Video URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.instagram.com/reel/..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className={`w-full flex items-center justify-center px-6 py-3 rounded-lg text-white font-medium transition-all
                  ${status === 'loading' 
                    ? 'bg-purple-400 cursor-not-allowed' 
                    : 'bg-purple-600 hover:bg-purple-700'}`}
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Download Video
                  </>
                )}
              </button>
            </form>

            {/* Status Messages */}
            {status === 'error' && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {status === 'success' && videoData && (
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-green-50 rounded-lg flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                  <p className="text-green-700">Video processed successfully!</p>
                </div>
                
                <div className="p-6 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-4">Download Options</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => handleDownload(videoData.videoUrl)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div>
                        <span className="text-gray-700 block">Original Quality</span>
                        <span className="text-gray-500 text-sm">
                          Size: {formatFileSize(parseInt(videoData.size))}
                        </span>
                      </div>
                      <Download className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                How to Download Instagram Videos
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li>Open Instagram and find the video you want to download</li>
                <li>Click the three dots (⋯) above the post</li>
                <li>Select "Copy Link" from the menu</li>
                <li>Paste the link in the input field above</li>
                <li>Click "Download Video" and choose your preferred quality</li>
              </ol>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-8 text-center text-white/80 text-sm">
            <p>This tool is for personal use only. Please respect copyright and Instagram's terms of service.</p>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default App;