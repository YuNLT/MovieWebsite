import React, { use } from 'react'
import Search from './components/search'
import { useEffect, useState } from 'react'
import Spinner from './components/spinner.jsx'
import MovieCard from './components/MovieCard.jsx';
import { useDebounce } from 'react-use';
import { updateSearchCount } from './appwrite.js';
import { getTrendingMovies } from './appwrite.js';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_KEY;

const API_OPTIONS ={
  method: 'GET',
  headers : {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

const App =() => {

  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [debouncedsearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce the search term to avoid too many API calls
  // This will wait for 500ms after the last change to searchTerm before updating deb
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);
  // Fetch movies or TV shows based on the search term
  const fetchMovies = async (query = "") => {

    setLoading(true);
    setErrorMessage('');
    try{
      const endpoint = query 
      ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);

      if(!response.ok){
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if(data.response === 'false'){
        setErrorMessage('No movies found. Please try a different search term.');
        setMovieList([]);
        return; //Exist if no movies found
      }
      setMovieList(data.results || []);

      if(query && data.results.length > 0){
        await updateSearchCount(query, data.results[0]); // Update search count for the first movie
      } 
    }catch (error){
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Failed to fetch movies. Please try again later.');
    }
    finally{
      setLoading(false);
    }
  }

  const loadTrendingMovies = async () => {
    try{
      const movie = await getTrendingMovies();
      setTrendingMovies(movie);
    }catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  }

  useEffect(() => {
    fetchMovies(debouncedsearchTerm);
  }, [debouncedsearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return(
    <main>
    <div className="pattern" />

    <div className="wrapper">
      <header>
        <img src="./hero.png" alt="Hero Banner"/>
        <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>

        <Search searchTerm ={searchTerm} setSearchTerm={setSearchTerm} />
      </header>

      {trendingMovies.length > 0 && (
      <section className="trending">
      <h2>Trending Movies</h2>
      <ul>
        {trendingMovies.map((movie, index) => (
          <li key={movie.$id}>
            <p>{index+1}</p>
            <img src={movie.poster_url} alt={movie.title} />
          </li>
        ))}
      </ul>
      </section>
      )}

      <section className="all-movies">
        <h2>All Movies</h2>

        {isLoading ? (
          <Spinner />
        ) : errorMessage ? (
            <p className="text-red">{errorMessage}</p> 
        ) : (
          <ul>
              {movieList.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
          ))}
          </ul>
        )}
      </section>
    </div>
    </main>
  )
}

export default App;