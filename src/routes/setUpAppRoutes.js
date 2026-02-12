module.exports.setUpAppRoutes = (app) => {
  const apiVersion = process.env.API_VERSION;
  const userRoutes = require("./user.routes");
  const propertyRoutes = require("./property.routes");
  const blogPostsRoutes = require("./blog-post.routes");
  const imagesRoutes = require("./image.routes");
  const siteInfoRoutes = require("./site-info.routes");

  app.use(`/${apiVersion}/users`, userRoutes);
  app.use(`/${apiVersion}/properties`, propertyRoutes);
  app.use(`/${apiVersion}/blog-posts`, blogPostsRoutes);
  app.use(`/${apiVersion}/images`, imagesRoutes);
  app.use(`/${apiVersion}/site-info`, siteInfoRoutes);

  app.get(`/${apiVersion}/health`, (req, res) => {
    res.status(200).json({ status: "OK", message: "Routes is healthy" });
  });
};
