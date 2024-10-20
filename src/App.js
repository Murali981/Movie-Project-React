import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";

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

/* WHY WE NEED REFS IN REACT
  Let's manually select a DOM element  so that you see why we actually need ref's in react.
  What are Refs ?
  ref stands for reference and this ref is like a box where we can put any data that we want to preserve between renders. Now in
  technical terms when we use useRef then React will give us an object with a mutable current property and then we can write any data
  into this current property and of course you can read from this current property
     const myRef = useRef(23) => The current property is first set to the initial value which is "23" and then we changed it to 
     1000 using "myRef.current = 1000" and you can see that this current property is actually mutable so unlike everything else in
     react but what really special about refs is , these are persisted across the renders so there current property value stays same 
     between multiple renders
     
     TWO BIG USE CASES OF REF'S
     1) Creating a variable that stays same between renders(eg setTimeout id , previous state etc....)

     2) Selecting and storing the DOM elements

     *)  Ref's are for the data that is not rendered: Usually only appear in event handlers (or) effects , not in jsx(otherwise useState)

     *)  Donot read (or) write .current in render logic (like state)

     *) Ref's are like state but with less powers

     The common thing between useState and useRef is these both are persisted across the renders, So the component remembers these 
     values  even after re-rendering but the big difference is updating the state will actually cause the component to re-render while
     updating the ref's does not cause the component to re-render. So the big takeaway from this is that , We will use state when we 
     want to store the data that should re-render the component and ref's for the data that only be remembered by the component over
     time but never re-render it.

     *) State is immutable but ref's are mutable and also the state is updated asynchronously which means that we cannot use the new state
       immediately after updating it and on the other hand ref's are not updated asynchronously and so we can actually read a new 
       current property immediately after updating the ref
*/

/* WHAT ARE CUSTOM HOOKS ? WHEN TO CREATE ONE ?

   Custom hook is all about reusability. In react we have two types of things that we can reuse which is a piece of UI (or) a piece 
    of logic . If we want to reuse a piece of UI  then we already know that we use a component , On the other hand if we want to reuse 
    the logic in react then you need to ask the first question which is , Does the logic that i want to reuse have any hooks ? if not 
    then the answer is a regular function which can live outside (or) inside of the component. However if the logic contain any react
    hook then you cannot extract the logic into a regular function Instead you have to create a custom hook. Basically custom hooks allows
    us to reuse the stateful logic among multiple components and actually not only the stateful logic but really any logic that contains
    one (or) more react hooks. So we can say that custom hooks allows us to reuse the non-visual logic which is a more generic term
    Now just like regular functions (or) effects , One hook should only serve one purpose

    Custom hook is just really a javascript function where it can recieve and return any data  that is relevant to this custom hook and
    it is very common to return a object (or) an array from a custom hook. The difference between  regular functions and custom hooks is 
    that custom hooks need to use one (or) more react hooks


*/

export default function App() {
  // There are two strategies to decide whether we want to create a new custom hook (or) not. First part is we want to reuse some part
  // of our non visual logic and the second factor might be we want to extract a huge part of our component out into some custom hook

  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null); // Why are we storing only the id of the movie but not the entire movie object
  // itself. The reason for this is , The movies that we get from the search are very limited. So we get the data about the title , year
  // and the poster here
  // const [watched, setWatched] = useState([]);

  const { movies, isLoading, error } = useMovies(query, handleCloseMovie); // This useMovies(query) custom hook return an object and we are destructuring
  // them immediately. If you see in the above we are passing "handleCloseMovie" before it has been declared and it will work because
  // in javascript the function declarations are hoisted but the callback functions are not hoisted.

  const [watched, setWatched] = useLocalStorageState([], "watched");

  // const [watched, setWatched] = useState(function () {
  //   // React will call this function on initial render and we will use the value that whatever is returned from the function as the initial
  //   // value of the state and this function has to be a pure function and cannot recieve any arguments and passing the arguments is not
  //   // going to work. Pure function is some function that will return something and the returned value is used by the react as the initial
  //   // state and please note that this callback function will be called only on the initial render and just once and simply ignored on
  //   // subsequent renders
  //   const storedValue = localStorage.getItem("watched");
  //   return JSON.parse(storedValue); // When we store the value in the local storage we have converted it into a string using
  //   // JSON.stringify() and now when we are getting the value from the local storage we are coverting back to it's original form from the
  //   // string using JSON.parse() method
  // });
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
    // After adding the movies to the watch list ,  we are going to store them in the local storage
    // Local storage is a (key,value) pair storage that is available in the browser and we can store data for each domain.
    // The data that we store in the local storage will only be available in this url "localhost:3000"
    // localStorage.setItem("watched", JSON.stringify([...watched, movie])); // [...watched ,  JSON.stringify([...watched, movie])] => We are building a new array based on watched which is the current state
    // plus the new movie
  }

  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

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
  // We are using a useEffect hook here to manually select a DOM Element whenever this Search component mounts for the first time
  // useEffect(function () {
  //   const searchElement = document.querySelector(".search"); // Here are using the "className" which is "search" to select input field
  //   // where we are using to search any movie. And selecting the DOM elements in this way is not the right way in doing react as in
  //   // react we will not manually add the eventlisteners to the DOM as you can see if you want to select any element from the DOM
  //   // We have to manually add a className to it and select it using "document.querySelector()" method but in react we will use the
  //   // useRef() hook
  //   console.log(searchElement);
  //   searchElement.focus(); // We are calling the focus() method on the selected input searchElement and this is basic dom manipulation
  // }, []);

  // Using a Ref with a DOM element happens in 3 steps
  // Step 1: We create a ref using the useRef() hook where we will pass the initial value that has to be in the current property.
  const inputEl = useRef(null); // When we are working with a DOM element the initial value will be null

  // Step 2: Go to the element that you want to select by  passing the ref={inputEl} that you have created a ref using useRef() hook

  // Step 3: We have to use our created ref anywhere , Here in this case we are using it in the below useEffect() hook.

  useKey("Enter", function () {
    if (document.activeElement === inputEl.current) {
      // document.activeElement is the element that is currently being focused
      return;
    }

    if (inputEl.current) {
      inputEl.current.focus(); // We are reading the current property from our created ref element which is "inputEl" , current property is
      // like which is basically a box where whatever we store in the ref will get stored "inputEl.current" is the DOM element itself
      // So here we can call our focus() method on
    }

    setQuery("");
  });

  // useEffect(
  //   function () {
  //     function callback(e) {
  //       if (e.code === "Enter") {
  //         if (document.activeElement === inputEl.current) {
  //           // document.activeElement is the element that is currently being focused
  //           return;
  //         }

  //         if (inputEl.current) {
  //           inputEl.current.focus(); // We are reading the current property from our created ref element which is "inputEl" , current property is
  //           // like which is basically a box where whatever we store in the ref will get stored "inputEl.current" is the DOM element itself
  //           // So here we can call our focus() method on
  //         }

  //         setQuery("");
  //       }
  //     }

  //     document.addEventListener("keydown", callback);
  //     // useEffect() runs after the DOM has been loaded and to select our input element after the DOM has been loaded this is the
  //     // best case where we can use our created ref element in this useEffect() hook.

  //     return () => document.addEventListener("keydown", callback);
  //   },
  //   [setQuery]
  // );

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl} // Step 2: Go to the element that you want to select by  passing the ref={inputEl} that you have created a ref using useRef() hook
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

  const countRef = useRef(0);

  // We are updating the ref (or) mutating the ref in the below useEffect() because remember that we should not update the ref inside
  // the render logic.

  useEffect(
    function () {
      if (userRating) {
        countRef.current = countRef.current + 1;
      } // In the initial mount of the MovieDetails component the initial state of the userRating is an empty string("") , So this is
      // the reason we have written the above "If" condition. In useRef() hook we don't have the setter property as useState() hook
      // but we will update the current property which is there inside the ref.
    },
    [userRating]
  ); // We want to update the ref whenever the user rates the movie again and this is the reason
  // I am writing the userRating in the dependency array as the userRating state updates then this causes MovieDetails component to
  // re-render

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

  // const [avgRating, setAvgRating] = useState(0); // Whenever we want to do something on the screen then we need a state

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
      countRatingDecisions: countRef.current,
    };
    onAddWatched(newWatchedMovie); // After adding a movie we want to immediately close the movie.
    // setAvgRating(Number(imdbRating));
    // setAvgRating((avgRating) => (avgRating + userRating) / 2);
    onCloseMovie();
  }

  /* We are creating another side effect here where we are listening to the global keypress event which is "Escape" by attaching a 
  event handler to our entire application and here we are manipulating the DOM so this has to be done in a side effect by using the 
  useEffect hook */

  useKey("Escape", onCloseMovie);

  // useEffect(
  //   // We are putting this useEffect() hook of listening to the escape key because we want to close the movie
  //   // when the user presses the escape key and also this has to happen inside the MovieDetails component only as we are calling the
  //   // onCloseMovie() function from the MovieDetails component to work only when we open the MovieDetails component
  //   function () {
  //     function callback(e) {
  //       if (e.code === "Escape") {
  //         // When you click on the escape button of your keyboard then you are calling the closeMovie() function
  //         onCloseMovie();
  //         console.log("CLOSING");
  //       }
  //     }
  //     // This effect should run on mount.
  //     document.addEventListener("keydown", callback); // here we are doing some DOM manipulation and we are stepping really outside of the react here which
  //     // is the reason the React team also calls the useEffect() an escape hatch.\

  //     // We have to return a cleanup function here which will be called before the component rerenders (or) unmounts

  //     return function () {
  //       document.removeEventListener("keydown", callback); // As soon as the MovieDetails component unmounts then the
  //       // event listener which is attached to the escape key will be removed preventing in attaching multiple event listeners
  //       // attaching to the entire document which is not what we want.
  //     };
  //   },
  //   [onCloseMovie] // We have to include this onCloseMovie() in the dependency array as React is telling to do this
  // );

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

          {/* <p>{avgRating}</p> */}

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
