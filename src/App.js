import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import base64 from 'base-64';
import './App.css';

function App() {
  const youtubeAPIKey = 'AIzaSyDSLoPdljX4fhCRc6Djh0GBNUepC3aPKvE';
  const spotifyClientId = '23d88094a31f49549bea0814f475c3ae';
  const spotifyClientSecret = 'f2e52193e82c4fcdbd61dc778ed6d8a0';

  const [inputLink, setInputLink] = useState('');
  const [musicData, setMusicData] = useState(null);
  const [convertedLink, setConvertedLink] = useState('');
  const [spotifyToken, setSpotifyToken] = useState('');

  const outputRef = useRef(null);

  useEffect(() => {
    const fetchSpotifyToken = async () => {
      const encodedCredentials = base64.encode(`${spotifyClientId}:${spotifyClientSecret}`);
      try {
        const response = await axios.post(
          'https://accounts.spotify.com/api/token',
          'grant_type=client_credentials',
          {
            headers: {
              Authorization: `Basic ${encodedCredentials}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );
        setSpotifyToken(response.data.access_token);
      } catch (error) {
        console.error('Error fetching Spotify access token:', error);
      }
    };

    fetchSpotifyToken();
  }, []);

  const handleInputChange = (event) => {
    console.log('Input changed!!!');
    setMusicData(null);
    setInputLink(event.target.value);
  };

  const handleFetchClick = async () => {
    console.log('Fetch Clicked!!!');
    try {
      const videoId = extractVideoId(inputLink);
      console.log('video id : ' + videoId);
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${youtubeAPIKey}`
      );
      const data = response.data;
      console.log(data);
      if (data.items.length > 0) {
        const musicInfo = {
          title: data.items[0].snippet.title,
          artist: data.items[0].snippet.channelTitle,
          thumbnail: {
            default: data.items[0].snippet.thumbnails.default.url,
            medium: data.items[0].snippet.thumbnails.medium.url,
            high: data.items[0].snippet.thumbnails.high.url,
          },
        };
        setMusicData(musicInfo);
      }
    } catch (error) {
      console.error('Error fetching music data:', error);
    }
  };

  const handleConvertClick = async () => {
    try {
      const response = await axios.get(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          musicData.title
        )}%20${encodeURIComponent(musicData.artist)}&type=track&limit=1`,
        {
          headers: {
            Authorization: `Bearer ${spotifyToken}`,
          },
        }
      );

      const data = response.data;
      if (data.tracks.items.length > 0) {
        const track = data.tracks.items[0];
        const spotifyLink = track.external_urls.spotify;
        setConvertedLink(spotifyLink);
      }
    } catch (error) {
      console.error('Error fetching Spotify data:', error);
    }
  };

  const extractVideoId = (url) => {
    console.log('Extracting Video Id');
    // Extract the video ID from a YouTube Music URL
    const match = url.match(
      /^(?:https?:\/\/)?(?:www\.)?(?:music\.)?youtube\.com\/(?:watch\?v=|embed\/|v\/|playlist\?list=|shorts\/)?(\S+)(?:\S+)?$/
    );
    console.log('matched video ids : ' + match);
    return match ? match[1] : null;
  };

  const handleCopyClick = () => {
    if (outputRef.current) {
      outputRef.current.select();
      document.execCommand('copy');
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="App">
      <div className="container">
        <div className="inputContainer">
          <input
            type="text"
            value={inputLink}
            onChange={handleInputChange}
            placeholder="Enter Link"
          />
        </div>
        {musicData ? (
          <div className="inputContainer">
            <button onClick={handleConvertClick}>Convert</button>
          </div>
        ) : (
          <div className="inputContainer">
            <button onClick={handleFetchClick}>Fetch Music Data</button>
          </div>
        )}
        {convertedLink && (
          <div className="outputContainer">
            <div className="outputText">
              <a href={convertedLink} target="_blank" rel="noopener noreferrer">
                <textarea
                  ref={outputRef}
                  type="text"
                  value={convertedLink}
                  readOnly
                />
              </a>
              <button className="copyButton" onClick={handleCopyClick}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard" viewBox="0 0 16 16">
                  <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/> <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
      {musicData && (
          <div className="musicDataContainer">
            <div className="musicData">
              <h2>{musicData.title}</h2>
              <p>Artist: {musicData.artist}</p>
              <img src={musicData.thumbnail.high} alt="Music Thumbnail" />
            </div>
          </div>
        )}
    </div>
  );
}

export default App;