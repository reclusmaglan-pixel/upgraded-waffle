const playPauseBtn = document.getElementById('play-pause-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const totalDurationEl = document.getElementById('total-duration');
const playerTitle = document.getElementById('player-title');
const playerArtist = document.getElementById('player-artist');
const volumeBar = document.getElementById('volume-bar');

const trendingListEl = document.getElementById('trending-list');
const offlineListEl = document.getElementById('offline-list');
const offlineCountEl = document.getElementById('offline-count');

// Orodha kuu ya nyimbo
const songs = [
    { id: 1, title: "Gamba Empya", artist: "Siletian", duration: "03:45", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { id: 2, title: "Niko Sawa", artist: "Diamond Platnumz", duration: "03:20", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
    { id: 3, title: "Mapozi", artist: "Zuchu", duration: "03:18", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }
];

let currentPlaylist = songs;
let songIndex = 0;
let audio = new Audio();
let isPlaying = false;

// Kuonyesha nyimbo za Trending kwenye Home
function renderTrendingSongs() {
    trendingListEl.innerHTML = "";
    songs.forEach((song, index) => {
        trendingListEl.innerHTML += `
            <li>
                <div class="song-details" onclick="playSongFromList(${index}, songs)">
                    <h4>${song.title}</h4>
                    <p>${song.artist} • ${song.duration}</p>
                </div>
                <div class="action-btns">
                    <i class="fa-solid fa-download" onclick="saveOffline(${song.id})" title="Pakua Offline"></i>
                </div>
            </li>
        `;
    });
}

// Kuhifadhi wimbo Offline kwenye LocalStorage
function saveOffline(songId) {
    let songToSave = songs.find(s => s.id === songId);
    let offlineSongs = JSON.parse(localStorage.getItem('offlineSongs')) || [];
    
    let exists = offlineSongs.some(s => s.id === songId);
    if (!exists) {
        offlineSongs.push(songToSave);
        localStorage.setItem('offlineSongs', JSON.stringify(offlineSongs));
        alert(`"${songToSave.title}" imehifadhiwa Offline! 📥`);
        renderOfflineSongs();
    } else {
        alert("Wimbo huu upo tayari kwenye Downloads zako.");
    }
}

// Kuonyesha nyimbo za Offline
function renderOfflineSongs() {
    let offlineSongs = JSON.parse(localStorage.getItem('offlineSongs')) || [];
    offlineCountEl.innerText = offlineSongs.length;
    offlineListEl.innerHTML = "";

    if (offlineSongs.length === 0) {
        offlineListEl.innerHTML = "<p style='color: #8e89a3; padding: 10px;'>Hakuna nyimbo zilizopakuliwa bado.</p>";
        return;
    }

    offlineSongs.forEach((song, index) => {
        offlineListEl.innerHTML += `
            <li>
                <div class="song-details" onclick="playSongFromList(${index}, offlineSongs)">
                    <h4>${song.title}</h4>
                    <p>${song.artist} • ${song.duration}</p>
                </div>
                <div class="action-btns">
                    <i class="fa-solid fa-trash" onclick="removeOffline(${song.id})" title="Futa"></i>
                </div>
            </li>
        `;
    });
}

// Kufuta wimbo wa offline
function removeOffline(songId) {
    let offlineSongs = JSON.parse(localStorage.getItem('offlineSongs')) || [];
    offlineSongs = offlineSongs.filter(s => s.id !== songId);
    localStorage.setItem('offlineSongs', JSON.stringify(offlineSongs));
    renderOfflineSongs();
}

// Kubadilisha tabs (Home na Downloads)
function switchTab(tab) {
    document.getElementById('home-section').style.display = tab === 'home' ? 'block' : 'none';
    document.getElementById('downloads-section').style.display = tab === 'downloads' ? 'block' : 'none';
    
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    event.currentTarget.classList.add('active');
}

// Kucheza wimbo kutoka kwenye list husika
function playSongFromList(index, playlist) {
    currentPlaylist = playlist;
    songIndex = index;
    loadSong(songIndex);
    playAudio();
}

function loadSong(index) {
    let song = currentPlaylist[index];
    playerTitle.innerText = song.title;
    playerArtist.innerText = song.artist;
    totalDurationEl.innerText = song.duration;
    audio.src = song.src;
}

function playAudio() {
    isPlaying = true;
    audio.play();
    playPauseBtn.classList.remove('fa-circle-play');
    playPauseBtn.classList.add('fa-circle-pause');
}

function pauseAudio() {
    isPlaying = false;
    audio.pause();
    playPauseBtn.classList.remove('fa-circle-pause');
    playPauseBtn.classList.add('fa-circle-play');
}

playPauseBtn.addEventListener('click', () => {
    if (isPlaying) { pauseAudio(); } else { if(audio.src) audio.play(), playAudio(); }
});

nextBtn.addEventListener('click', () => {
    songIndex = (songIndex + 1) % currentPlaylist.length;
    loadSong(songIndex);
    playAudio();
});

prevBtn.addEventListener('click', () => {
    songIndex = (songIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
    loadSong(songIndex);
    playAudio();
});

audio.addEventListener('timeupdate', () => {
    const progressPercent = (audio.currentTime / audio.duration) * 100;
    progressBar.value = progressPercent || 0;

    let currentMinutes = Math.floor(audio.currentTime / 60);
    let currentSeconds = Math.floor(audio.currentTime % 60);
    if (currentSeconds < 10) currentSeconds = `0${currentSeconds}`;
    currentTimeEl.innerText = `${currentMinutes}:${currentSeconds}`;
});

progressBar.addEventListener('input', () => {
    audio.currentTime = (progressBar.value / 100) * audio.duration;
});

volumeBar.addEventListener('input', () => {
    audio.volume = volumeBar.value;
});

// Anzisha app
renderTrendingSongs();
renderOfflineSongs();
