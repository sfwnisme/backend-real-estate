//---------------------
// HOC function handles the catch() block
// to avoid redundant code
//---------------------
module.exports = (asyncFunction) => {
  // the application req, res, and next
  return (req, res, next) => {
    // asyncFunction is the wrapped async function
    // its params come from the application
    asyncFunction(req, res, next).catch((error) => {
      // the next() middleware is the application's not the asyncFunction's
      next({error});
    });
  };
};
