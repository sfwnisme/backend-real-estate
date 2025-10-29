module.exports.setUpAppRoutes = (app) => {
  const userRoutes = require("./user.routes");
  const propertyRoutes = require("./property.routes");
  const blogPostsRoutes = require("./blog-post.routes");
  const imagesRoutes = require("./image.routes");

  app.use("/api/users", userRoutes);
  app.use("/api/properties", propertyRoutes);
  app.use("/api/blog-posts", blogPostsRoutes);
  app.use("/api/images", imagesRoutes);

  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "OK", message: "Routes is healthy" });
  });
};
