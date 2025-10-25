// -------------------------------
// Application main file
// -------------------------------

const app = require('./src/app')

// Create the server instance
const server = app.listen(process.env.PORT || 8000, () => {
  console.log(`Server working on port ${process.env.PORT || 8000}`);
});
