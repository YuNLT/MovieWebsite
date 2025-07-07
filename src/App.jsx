import React from 'react'
import Search from './components/search'
import { useEffect, useState } from 'react'
import Spinner from './components/spinner.jsx'
import MovieCard from './components/MovieCard.jsx';

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
  const [isLoading, setLoading] = useState(true);

  // Fetch movies or TV shows based on the search term
  const fetchMovies = async () => {

    setLoading(true);
    setErrorMessage('');
    try{
      const endpoint = `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

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
    }catch (error){
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Failed to fetch movies. Please try again later.');
    }
    finally{
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMovies();
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
      <section className="all-movies">
        <h2 className='mt-[40px]'>All Movies</h2>

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