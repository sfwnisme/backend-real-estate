const { formatApiResponse } = require("../utils/response.js");
const statusText = require("../config/statusText.config.js");
const AppError = require("../utils/appError.js");
const asyncWrapper = require("../middlewares/asyncWrapper.js");
const BlogPost = require("../models/blog-post.model.js");
const { default: slugify } = require("slugify");
const {
  calculateReadingTime,
  setPublishedAt,
  setOgImage,
} = require("../utils/utils.js");
const { BLOG_POST_STATUS } = require("../config/enum.config.js");
const appError = new AppError();

const blogPostControllers = module.exports;

blogPostControllers.getBlogPosts = asyncWrapper(async (req, res) => {
  const blogPosts = await BlogPost.find({}, { __v: false }).lean();
  console.log("blogPost response", blogPosts);
  if (!blogPosts) {
    appError(404, statusText.FAIL, "not found");
  }

  res
    .status(200)
    .json(
      formatApiResponse(
        200,
        statusText.SUCCESS,
        "data fetched successfully",
        blogPosts
      )
    );
});
blogPostControllers.getPublishedBlogPosts = asyncWrapper(async (req, res) => {
  const queryPublishedOnly = {status: BLOG_POST_STATUS["PUBLISHED"]}
  const blogPosts = await BlogPost.find(queryPublishedOnly, { __v: false }).lean();
  console.log("blogPost response", blogPosts);
  if (!blogPosts) {
    appError(404, statusText.FAIL, "not found");
  }

  res
    .status(200)
    .json(
      formatApiResponse(
        200,
        statusText.SUCCESS,
        "data fetched successfully",
        blogPosts
      )
    );
});
blogPostControllers.getDraftBlogPosts = asyncWrapper(async (req, res) => {
  const queryDraftOnly = {status: BLOG_POST_STATUS["DRAFT"]}
  const blogPosts = await BlogPost.find(queryDraftOnly, { __v: false }).lean();
  console.log("blogPost response", blogPosts);
  if (!blogPosts) {
    appError(404, statusText.FAIL, "not found");
  }

  res
    .status(200)
    .json(
      formatApiResponse(
        200,
        statusText.SUCCESS,
        "data fetched successfully",
        blogPosts
      )
    );
});

blogPostControllers.getBlogPost = asyncWrapper(async (req, res, next) => {
  const { slug } = req.params;
  const blog = await BlogPost.findOne({ slug: `${slug}` }, { __v: false });

  if (!blog) {
    appError.create(404, statusText.FAIL, "not found");
    return next(appError);
  }

  res
    .status(200)
    .json(
      formatApiResponse(200, statusText.SUCCESS, "operation success", blog)
    );
});

blogPostControllers.createBlogPost = asyncWrapper(async (req, res, next) => {
  const { body } = req;
  const generateSlug = slugify(body.meta?.title ?? body.title);
  const readingTime = calculateReadingTime(body.content);
  const publishedAtDate = setPublishedAt(body);
  const ogImageSetUp = setOgImage(body);

  const createdBlogPost = new BlogPost({
    ...body,
    slug: generateSlug,
    meta: {
      ...body.meta,
      ogImage: ogImageSetUp,
    },
    readingTime,
    publishedAt: publishedAtDate,
  });
  await createdBlogPost.save();
  const populatedBlog = await BlogPost.findById(createdBlogPost._id).lean();

  res
    .status(201)
    .json(
      formatApiResponse(
        201,
        statusText.SUCCESS,
        "The blog created successfully",
        populatedBlog
      )
    );
});

blogPostControllers.updateBlogPost = asyncWrapper(async (req, res, next) => {
  const {
    body,
    params: { blogPostId },
  } = req;

  await BlogPost.updateOne(
    { _id: blogPostId },
    { ...body },
    { runValidators: true }
  );
  const updateBlogPost = await BlogPost.findById(blogPostId);

  res
    .status(200)
    .json(
      formatApiResponse(
        200,
        statusText.SUCCESS,
        "operation success",
        updateBlogPost
      )
    );
});

blogPostControllers.deleteBlogPost = asyncWrapper(async (req, res, next) => {
  const { blogPostId } = req.params;

  const deletedBlogPost = await BlogPost.deleteOne({ _id: blogPostId });
  return res
    .status(200)
    .json(
      formatApiResponse(
        200,
        statusText.SUCCESS,
        "blog deleted successfully",
        deletedBlogPost
      )
    );
});
