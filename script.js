const API_URL = "https://backend-music-player-f1lk.onrender.com/api/songs";
const PLAYLIST_URL = "https://backend-music-player-f1lk.onrender.com/api/playlist";
// Select elements
const allSongsContainer = document.getElementById("allSongs");
const mainAudio = document.getElementById("mainAudio");
const musicCover = document.getElementById("musicCover");
const musicTitle = document.querySelector(".musicDetail h2");
const musicSinger = document.querySelector(".musicDetail p");
const genreFilter = document.getElementById("genre");
const searchInput = document.querySelector(".searchInput");
const prevBtn = document.querySelector(".musicFlow button:first-child");
const nextBtn = document.querySelector(".musicFlow button:last-child");

// for playlist 
const playlistList = document.getElementById("playlistList"); // container where playlists will appear
const newPlaylistInput = document.getElementById("newPlaylistName"); // input box (you can add in HTML)
const createPlaylistBtn = document.getElementById("createPlaylistBtn"); // create button


let allSongs = [];
let currentSongIndex = 0;

// Fetch all songs
async function getAllSongs() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    allSongs = data.songs;
    displaySongs(allSongs);

    // Load first song
    if (allSongs.length > 0) {
      loadSong(allSongs[0]);
    }

    // Fill genre dropdown dynamically
    const genres = [...new Set(allSongs.map(song => song.type))];
    genreFilter.innerHTML = `<option value="">All</option>` +
      genres.map(g => `<option value="${g}">${g}</option>`).join('');
  } catch (err) {
    console.log("Error loading songs:", err.message);
    allSongsContainer.innerHTML = "<p>Failed to load songs.</p>";
  }
}

// Display songs on the page
function displaySongs(songs) {
  allSongsContainer.innerHTML = "";

  if (!songs || songs.length === 0) {
    allSongsContainer.innerHTML = "<p>No songs found.</p>";
    return;
  }

  songs.forEach((song, index) => {
    const songItem = document.createElement("div");
    songItem.className = "song-list";
    songItem.innerHTML = `<span>${song.name}</span>`;

    songItem.addEventListener("click", () => {
      currentSongIndex = index;
      loadSong(song);
    });

    allSongsContainer.appendChild(songItem);
  });
}

// Load selected song
function loadSong(song) {
  musicTitle.textContent = song.name;
  musicSinger.textContent = song.type;
  musicCover.style.backgroundImage = `url('${song.cover}')`;
  musicCover.style.backgroundSize = "cover";
  mainAudio.src = song.link;
  mainAudio.load();

  mainAudio.addEventListener("canplay", () => {
    mainAudio.play().catch((err) => {
      console.log("Play error:", err.message);
    });
  }, { once: true });
}

// Next and Previous
function nextSong() {
  if (allSongs.length === 0) return;
  currentSongIndex = (currentSongIndex + 1) % allSongs.length;
  loadSong(allSongs[currentSongIndex]);
}

function prevSong() {
  if (allSongs.length === 0) return;
  currentSongIndex = (currentSongIndex - 1 + allSongs.length) % allSongs.length;
  loadSong(allSongs[currentSongIndex]);
}

// Filter by genre
genreFilter.addEventListener("change", () => {
  const genre = genreFilter.value;
  if (genre === "") {
    displaySongs(allSongs);
  } else {
    const filtered = allSongs.filter(song => song.type.toLowerCase() === genre.toLowerCase());
    displaySongs(filtered);
  }
});

// Debounce helper
function debounce(func, delay) {
  let timeout;
  return function () {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, arguments);
    }, delay);
  };
}

// Search songs from backend
async function searchSongs(name) {
  try {
    const res = await fetch(`${API_URL}/search/by-name?name=${name}`);
    const data = await res.json();
    displaySongs(data.songs);
  } catch (err) {
    console.log("Search error:", err.message);
  }
}

// Debounced search
const handleSearch = debounce((e) => {
  const value = e.target.value.trim();
  if (value === "") {
    displaySongs(allSongs);
  } else {
    searchSongs(value);
  }
}, 300);



// Function to send a POST Request to create a new Playlist
async function createPlaylist() {
  const name = newPlaylistInput.value.trim();
  if (!name) {
    alert("Please enter a playlist name.");
    return;
  }

  try {
    const res = await fetch(`${PLAYLIST_URL}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, songs: [] }) // initially empty
    });

    const data = await res.json();
    alert("✅ Playlist created!");
    newPlaylistInput.value = "";
    fetchPlaylists(); // refresh the UI
  } catch (err) {
    console.error("Error creating playlist:", err.message);
  }
}

// Fetch all the playlist and display 

async function fetchPlaylists() {
  try {
    const res = await fetch(PLAYLIST_URL);
    const data = await res.json();
    const playlists = data.playlists;

    // Clear the UI
    playlistList.innerHTML = "";

    // Add each playlist to DOM
    playlists.forEach((playlist) => {
      const div = document.createElement("div");
      div.className = "allPlaylist";

      let innerHTML = `<h3>${playlist.name}</h3>`;

      playlist.songs.forEach((song) => {
        innerHTML += `
          <div class="song-list">
            <span>${song.name}</span>
          </div>
        `;
      });

      div.innerHTML = innerHTML;
      playlistList.appendChild(div);
    });
  } catch (err) {
    console.error("Error loading playlists:", err.message);
    playlistList.innerHTML = "<p>❌ Failed to load playlists</p>";
  }
}
document.addEventListener("DOMContentLoaded", () => {
  getAllSongs();
  fetchPlaylists();
});


createPlaylistBtn.addEventListener("click", createPlaylist);

searchInput.addEventListener("input", handleSearch);
nextBtn.addEventListener("click", nextSong);
prevBtn.addEventListener("click", prevSong);
document.addEventListener("DOMContentLoaded", getAllSongs);
