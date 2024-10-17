import { useEffect, useState } from "react";

const KEY = "beb8ebb1";

export function useMovies(query, callback) {
  const [movies, setMovies] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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

      callback?.(); // This callback() function will only be called if it actually exists means if the callback function exists then only we
      // will call this callback() function

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

      //   handleCloseMovie(); // As we did a new search then the movie which is opened to the right side will be closed
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

  return { movies, isLoading, error };
}
