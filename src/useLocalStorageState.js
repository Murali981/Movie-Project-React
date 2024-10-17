import { useEffect, useState } from "react";

export function useLocalStorageState(initialState, key) {
  const [value, setValue] = useState(function () {
    // React will call this function on initial render and we will use the value that whatever is returned from the function as the initial
    // value of the state and this function has to be a pure function and cannot recieve any arguments and passing the arguments is not
    // going to work. Pure function is some function that will return something and the returned value is used by the react as the initial
    // state and please note that this callback function will be called only on the initial render and just once and simply ignored on
    // subsequent renders
    const storedValue = localStorage.getItem(key);
    // console.log(storedValue);
    return storedValue ? JSON.parse(storedValue) : initialState; // When we store the value in the local storage we have converted it into a string using
    // JSON.stringify() and now when we are getting the value from the local storage we are coverting back to it's original form from the
    // string using JSON.parse() method
  });

  useEffect(
    function () {
      localStorage.setItem(key, JSON.stringify([value])); // localStorage is available in all browsers and the method "setItem()" will take 2 arguments where
      // the first argument is "name of the key (or) the name of the data that we want to store" and the second argument is the actual data
      // that we want to store.
      //  and finally we have to convert this everything into string because in local storage we can store only the
      // key,value pairs where the value is a string so we are using a builtIn "JSON.stringify()" method to convert it into a string
    },
    [value, key]
  ); // We want to run this effect each time whenever the watched state is updated

  return [value, setValue];
}
