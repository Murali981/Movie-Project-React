import { useEffect, useState } from "react";
import StarRating from "./StarRating";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "beb8ebb1";

/* SIDE EFFECTS REGISTERED WITH USEEFFECT HOOK => Side effects registered with useEffect hook will only be executed after certain
 renders , For example only after a initial render . Registering a side effect means  that we want the code which is inside the 
 useEffect hook not to run as the component renders but actually after it has painted to the screen this is exactly what useEffect does */

/* SIDE EFFECT - This is an interaction between a React component and the world outside the component . We can create side effects in
 two different places in react and the first one is inside the event handlers and event handlers are simply functions which are triggered
 whenever there are listening to an event which happens like onClick , onSubmit. However simply reacting to events is sometimes not
 enough for what an application needs. Instead in some situations we need to write some code that will be executed automatically
 as the component renders. So here we can create a so called effect which is called a side effect. So by creating an effect we can basically
 write some code that will run at different moments of a component instance life cycle like when the component mounts , rerenders and unmounts
  rerenders can happen depending upon the dependency array. Each side effect can return a cleanup function that will be called before the 
  component rerenders (or) unmounts. This cleanup function will be called before the component rerenders (or) unmounts*/

/* The real reason why the effects exist is  not to run the code at the different points of the life cycle but to keep a component 
synchronised with some external system. In this example we are keepin this component in sync with the movie data that comes from some
 external API */

/* Event handlers are always the preferred way of creating the side effects */

/* Every state variable and props that is used inside the useEffect must be included in the dependency array */

export default function App() {
  const [movies, setMovies] = useState([""]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null); // Why are we storing only the id of the movie but not the entire movie object
  // itself. The reason for this is , The movies that we get from the search are very limited. So we get the data about the title , year
  // and the poster here

  /*
  useEffect(function () {
    // Effects will only run after the browser paint
    console.log("After initial render");
  }, []);

  useEffect(function () {
    console.log("After every render");
  });

  useEffect(
    function () {
      console.log("D");
    },
    [query]
  );

  console.log("During render"); // This console.log() runs because this is the one it first executes as this is render logic which runs first
 */

  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]); // We will get the current watched movies array and then we will create a brand new
    // one based on all the elements of the array and then the brand new movie object
  }

  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  useEffect(
    function () {
      // Using a Abort controller , Why are we using Abort controller because let us say when you have searched for a movie inception
      // in the search bar then when you go to networks tab and filter only the "fetch" requests then you can see multiple requests are
      // which are HTTP requests are going , You can observe let us say when you have searched for inception then you can see multiple
      // requests are going where one is for "i" , "in" , "inc" , "incep" ... like this there will be multiple http requests going
      // with every key word that you are searching and also you can observe that for every request there is some data being
      // downloaded and here all the http requests are in a race condition where all of them are in a race to put the requested data on
      // to the browser and for us only this "inception" http request matters because this request is complete keyword which is
      // searching for inception and this is the last http request that was sent and it will respond with the complete data but
      // some requests can be delayed where let us say the http request with the keyword "incep" can be delayed by 5 seconds and
      // it has come in the last request then this request data will be downloaded which is not the full data that we have searched
      // for the keyword "inception" so this will be a race condition. To prevent this from occuring we are using the Abort controller.

      /* TO CREATE A ABORT CONTROLLER FOLLOW THE BELOW STEPS */
      const controller = new AbortController(); // This AbortController is a native browser API which is nothing to do with react.
      // To connect the AbortController to the below fetch function we have to pass a second argument to the below fetch request

      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError(""); // Before we start fetching the data we have to reset the error state. Don't forget this
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );
          if (!res.ok) {
            throw new Error("Something went wrong when fetching the movies");
          }

          const data = await res.json();
          if (data.response === "False") {
            throw new Error("Movie not found");
          }
          setMovies(data.Search); // after this state is set in this line of code (or) actually when we instructed the React to set the
          // state but this doesn't mean that this setting of state will happen immediately but this setting of state will happen after
          // the below fetchMovies() function has completed its execution
          // console.log(data.Search);
          // // console.log(movies); // Here we have a stale state which means basically we have the old value as the state was before and before
          // // // there is this empty array which is the initial state.
          setError(""); // After the end of fetching the data we have to reset the error state. Don't forget this
        } catch (error) {
          console.log(error.message);

          if (error.name !== "AbortError") {
            // When we are using the AbortController then we will get an AbortError which is
            // catched by our javascript code and  as multiple http requests got cancelled as we are using the AbortController
            // and only the last request is considered so to skip the "AbortError" which is causing an error on our webpage
            // So we are skipping this error and rendering the data onto the browser which is received by the last request
            setError(error.message);
          }
        } finally {
          // This block of code will always be executed at the very end
          setIsLoading(false);
        }
      }

      if (!query.length || query.length < 3) {
        // When we have more than three characters in the query state then only we are sending an
        // http request to the API to fetch the movies , You can check this in networks tab
        setMovies([]); // Setting the movies state back to an empty array where we are removing all the movies from the user interface.
        setError("");
        return;
      }

      handleCloseMovie(); // As we did a new search then the movie which is opened to the right side will be closed
      fetchMovies(); // We are calling this fetchMovies() function here

      return function () {
        // In this cleanup function we will be returning a function that will be executed when the App component unmounts
        // we are calling the controller.abort() function here. Between every two rerenders this cleanup function will be called
        controller.abort();
      };
    },
    [query]
  ); // If we have specified empty array in the dependency array then it will be executed only once which is only on mount.
  // This will only renders when the App component renders for the first time

  return (
    <>
      {/* In the below NavBar we are using the component composition technique as we are passing the children prop into the NavBar */}
      <NavBar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        {/* Into the below Box component we are passing the MovieList component as a explicit prop called element={} */}
        {/* <Box element={<MovieList movies={movies} />} /> */}
        {/* Into the below Box component we are passing the WatchedSummary and WatchedMoviesList component as a explicit prop 
        called element={} but this time multiple elements instead of using the children prop but result is exactly the same */}
        {/* <Box
          element={
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList watched={watched} />
            </>
          }
        /> */}
        {/* <Box>{isLoading ? <Loader /> : <MovieList movies={movies} />}</Box> */}

        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watched={watched}
              // In this MovieDetails component only we are adding the button to add the movie to our watched list
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>🚫</span>
      {message}
    </p>
  );
}

function NavBar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies?.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

/* function WatchedBox() {
  const [watched, setWatched] = useState(tempWatchedData);

  const [isOpen2, setIsOpen2] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen2((open) => !open)}
      >
        {isOpen2 ? "–" : "+"}
      </button>
      {isOpen2 && (
        <>
          <WatchedSummary watched={watched} />
          <WatchedMoviesList watched={watched} />
        </>
      )}
    </div>
  );
} */

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
  // Whenever this MovieDetails component is about to mount , we want to fetch the mvie of the corresponding selected id which is basically
  // loading the currently selected movie and since we want to do each time the component mounts then that means we want to use useEffect.
  const [movie, setMovie] = useState({}); // When this is initially mounted this movie is an empty object here.
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);

  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  console.log(title, year); // When this "title" and "year" which are read from the empty object is simply undefined in the initial
  // mount

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
    };
    onAddWatched(newWatchedMovie); // After adding a movie we want to immediately close the movie.
    onCloseMovie();
  }

  /* We are creating another side effect here where we are listening to the global keypress event which is "Escape" by attaching a 
  event handler to our entire application and here we are manipulating the DOM so this has to be done in a side effect by using the 
  useEffect hook */

  useEffect(
    // We are putting this useEffect() hook of listening to the escape key because we want to close the movie
    // when the user presses the escape key and also this has to happen inside the MovieDetails component only as we are calling the
    // onCloseMovie() function from the MovieDetails component to work only when we open the MovieDetails component
    function () {
      function callback(e) {
        if (e.code === "Escape") {
          // When you click on the escape button of your keyboard then you are calling the closeMovie() function
          onCloseMovie();
          console.log("CLOSING");
        }
      }
      // This effect should run on mount.
      document.addEventListener("keydown", callback); // here we are doing some DOM manipulation and we are stepping really outside of the react here which
      // is the reason the React team also calls the useEffect() an escape hatch.\

      // We have to return a cleanup function here which will be called before the component rerenders (or) unmounts

      return function () {
        document.removeEventListener("keydown", callback); // As soon as the MovieDetails component unmounts then the
        // event listener which is attached to the escape key will be removed preventing in attaching multiple event listeners
        // attaching to the entire document which is not what we want.
      };
    },
    [onCloseMovie] // We have to include this onCloseMovie() in the dependency array as React is telling to do this
  );

  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
        );
        const data = await res.json();
        setMovie(data);
        setIsLoading(false);
      }
      getMovieDetails();
    },
    [selectedId]
  ); // We want this to happen whenever this component mounts for the first time , So the dependency array
  // should be empty.

  useEffect(
    function () {
      if (!title) {
        return;
      }
      document.title = `Movie | ${title}`;

      // Cleanup function is simply a function that we return from the useEffect
      return function () {
        document.title = "usePopcorn";
        console.log(`Clean up effect movie for movie ${title}`);
      }; // Clean up function will run after each render (or) it will runs between renders
    },
    [title]
  );

  /* COMPONENT UNMOUNTS => Cleanup function => We need a way to execute some code as the component unmounts and we can do exactly that
  by returning a so called cleanup function from the effect. The clean-up function that we return from the useEffect will also be executed
  on rerenders where the  next effect is executed again */

  /* WHEN DO WE NEED A CLEAN UP FUNCTION ?
   We need a clean up function whenever the side effect is happening after the compount has re-rendered (or) unmounted. For example
   you might be doing an HTTP request in your effect. Now if the compount has rerendered while the first request is still running a
   second request will be fired off and this might create a bug called race condition and therefore it is a good idea to cancel
   the request in a clean-up function whenever the component rerenders (or) unmounts . We can take another example where when you
   subscribe to some API service , you should cancel the subscription. When you start a timer you should stop the timer in 
   cleanup function (or) if you add an event listener , you should clean up by removing it */

  /* Each useEffect() hook should do only one thing. If you need to create multiple effects in your components which is completely
  normal then just use multiple useEffect hooks. This not only makes each  effect much easier to understand but it also  makes effects
  easier to understand but it also makes effects easier to clean up using a clean-up function */

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${movie} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>

          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>
                  You have already rated this movie {watchedUserRating}{" "}
                  <span>⭐</span>
                </p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>

          {/* When you are passing anything to the handler function then only we will write () => onCloseMovie(argument) 
      instead of onCloseMovie() */}
        </>
      )}
    </div>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMoviesList({ watched, onDeleteWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onDeleteWatched={onDeleteWatched}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>

        <button
          className="btn-delete"
          onClick={() => onDeleteWatched(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}

/* COMPONENT COMPOSITION 
  This component doesnot include a  predefined component but instead it accepts children with children prop
  Component composition is combining different components by using the children prop (or explicitly defined props)
  We need the component composition for 2 big reasons (or) in 2 important situations 
  Situation 1 :
  When we want to create highly reusable and  flexible components such as the Modal Window (or) a million other reusable components that 
  we can think of
  Situation 2 :
  To Fix a prop drilling problem (great for layouts) 
  Note*** -> Components no need to know their children in advance which allows us to leave the empty slots inside of the components in the 
  form of children props
  
  */
