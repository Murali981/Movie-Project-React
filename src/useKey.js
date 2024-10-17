import { useEffect } from "react";

export function useKey(key, action) {
  useEffect(
    // We are putting this useEffect() hook of listening to the escape key because we want to close the movie
    // when the user presses the escape key and also this has to happen inside the MovieDetails component only as we are calling the
    // onCloseMovie() function from the MovieDetails component to work only when we open the MovieDetails component
    function () {
      function callback(e) {
        if (e.code.toLowerCase() === key.toLowerCase()) {
          // When you click on the escape button of your keyboard then you are calling the closeMovie() function
          action();
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
    [action, key] // We have to include this onCloseMovie() in the dependency array as React is telling to do this
  );
}
