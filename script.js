const categorySelect = document.getElementById("category-select");
const movieSelect = document.getElementById("movie-select");
const apiKey = "2c0b4052"; 

let movieDatabase = {}; 

async function loadMovieData() {
    try {
        const response = await fetch('movies.json'); 
        movieDatabase = await response.json();
        initializePage(); 
    } catch (error) {
        console.error("Could not load movie database:", error);
    }
}

function initializePage() {
    categorySelect.value = "action";
    categorySelect.dispatchEvent(new Event('change'));
}

categorySelect.addEventListener("change", (e) => {
    const genre = e.target.value;
    movieSelect.innerHTML = '<option value="">-- Choose a Movie --</option>';

    if(genre && movieDatabase[genre]) {
        movieDatabase[genre].forEach(movie => {
            const option = document.createElement('option');
            option.value = movie.id;
            option.textContent = movie.title;
            movieSelect.appendChild(option);
        });

        // Auto-select the first movie and trigger the fetch
        movieSelect.selectedIndex = 1;
        if(movieSelect.value) showMovieDetails(movieSelect.value);
    }
});


movieSelect.addEventListener("change", (e) => {
    const selectedId = e.target.value;
    if(selectedId) showMovieDetails(selectedId);
});

async function showMovieDetails(id) {
    const loader = document.getElementById("loader");
    const featuredSection = document.getElementById("featured-movie");

    if (loader) loader.style.display = "block";
    
    try {
        const url = `https://www.omdbapi.com/?i=${id}&plot=full&apikey=${apiKey}`;
        const response = await fetch(url);
        const movie = await response.json();

    
        featuredSection.innerHTML = `
            <div class="featured-card">
                <img src="${movie.Poster}" alt="${movie.Title}">
                <div class="featured-info">
                    <h1>${movie.Title} (${movie.Year})</h1>
                    <p class="rating">⭐ ${movie.imdbRating}</p>
                    <p><strong>Genre:</strong> ${movie.Genre}</p>
                    <p><strong>The Plot:</strong> ${movie.Plot}</p>
                    <button class="fav-btn" onclick="toggleFavorite('${movie.imdbID}', '${movie.Title.replace(/'/g, "\\'")}', '${movie.Poster}')">
                        Add to Watchlist
                    </button>
                </div>
            </div>
        `;
    } catch (error) {
        console.error("Failed to fetch featured movie:", error);
    } finally {
        if (loader) loader.style.display = "none";
    }
}

// Favorites Logic
let favorites = JSON.parse(localStorage.getItem("myMovies")) || [];

function toggleFavorite(id, title, poster) {
    const index = favorites.findIndex(movie => movie.id === id);

    if(index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push({ id, title, poster });
    }

    localStorage.setItem("myMovies", JSON.stringify(favorites));
    renderFavorites();
}

function renderFavorites() {
    const favContainer = document.getElementById("favorites-list");
    if(!favContainer) return;

    if(favorites.length === 0) {
        favContainer.innerHTML = "<p>Your watchlist is empty</p>";
        return;
    }

    favContainer.innerHTML = favorites.map(movie => `
        <div class="fav-item">
            <img src="${movie.poster}" width="50">
            <span>${movie.title}</span>
            <button onclick="toggleFavorite('${movie.id}')">🗑️</button>
        </div>
    `).join('');
}

// Initial Kickoff
loadMovieData();
renderFavorites(); // Show existing favorites on load