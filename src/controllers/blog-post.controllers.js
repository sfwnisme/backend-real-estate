const { formatApiResponse } = require("../utils/response.js");
const AppError = require("../utils/appError.js");
const asyncWrapper = require("../middlewares/asyncWrapper.js");
const BlogPost = require("../models/blog-post.model.js");
const Image = require("../models/image.model.js");
const { default: slugify } = require("slugify");
const {
  calculateReadingTime,
  setPublishedAt,
  setOgImage,
  slugGenerator,
} = require("../utils/utils.js");
const {
  BLOG_POST_STATUS,
  STATUS_TEXT,
  MODELS,
} = require("../config/enum.config.js");
const appError = new AppError();

const blogPostControllers = module.exports;

blogPostControllers.getBlogPosts = asyncWrapper(async (req, res) => {
  const blogPosts = await BlogPost.find({}, { __v: false }).lean();
  console.log("blogPost response", blogPosts);
  if (!blogPosts) {
    appError(404, STATUS_TEXT.FAIL, "not found");
  }

  res
    .status(200)
    .json(
      formatApiResponse(
        200,
        STATUS_TEXT.SUCCESS,
        "data fetched successfully",
        blogPosts
      )
    );
});

blogPostControllers.getPublishedBlogPosts = asyncWrapper(async (req, res) => {
  const queryPublishedOnly = { status: BLOG_POST_STATUS["PUBLISHED"] };
  const blogPosts = await BlogPost.find(queryPublishedOnly, {
    __v: false,
  }).lean();
  console.log("blogPost response", blogPosts);
  if (!blogPosts) {
    appError(404, STATUS_TEXT.FAIL, "not found");
  }

  res
    .status(200)
    .json(
      formatApiResponse(
        200,
        STATUS_TEXT.SUCCESS,
        "data fetched successfully",
        blogPosts
      )
    );
});

blogPostControllers.getDraftBlogPosts = asyncWrapper(async (req, res) => {
  const queryDraftOnly = { status: BLOG_POST_STATUS["DRAFT"] };
  const blogPosts = await BlogPost.find(queryDraftOnly, { __v: false }).lean();
  console.log("blogPost response", blogPosts);
  if (!blogPosts) {
    appError(404, STATUS_TEXT.FAIL, "not found");
  }

  res
    .status(200)
    .json(
      formatApiResponse(
        200,
        STATUS_TEXT.SUCCESS,
        "data fetched successfully",
        blogPosts
      )
    );
});

blogPostControllers.getBlogPost = asyncWrapper(async (req, res, next) => {
  const { slug } = req.params;
  const blog = await BlogPost.findOne({ slug: `${slug}` }, { __v: false });

  if (!blog) {
    appError.create(404, STATUS_TEXT.FAIL, "not found");
    return next(appError);
  }

  res
    .status(200)
    .json(
      formatApiResponse(200, STATUS_TEXT.SUCCESS, "operation success", blog)
    );
});

blogPostControllers.createBlogPost = asyncWrapper(async (req, res, next) => {
  const { body } = req;
  const { tempId, ...rest } = body;
  const tempOwnerId = tempId;
  const isTemp = false;
  const generateSlug = slugGenerator(rest.title);
  console.log("generate slug: ", generateSlug);
  console.log("title: ", rest.title);
  console.log("title:? ", rest?.title);
  console.log("meta.title: ", rest.meta.title);
  console.log("meta.title:? ", rest.meta?.title);
  const readingTime = calculateReadingTime(rest.content);
  const publishedAtDate = setPublishedAt(rest);
  const ogImage = rest.meta?.ogImage ? rest?.coverImage : null;

  const createdBlogPost = new BlogPost({
    ...rest,
    slug: generateSlug,
    meta: {
      ...rest.meta,
      ogImage: ogImage,
    },
    readingTime,
    publishedAt: publishedAtDate,
  });

  const blogPostCreation = await createdBlogPost.save();
  if (!blogPostCreation) {
    appError.create(
      400,
      STATUS_TEXT.FAIL,
      "blog post creation faild",
      blogPostCreation
    );
    return next(appError);
  }

  const blogPostId = blogPostCreation._id;

  const findMany = await Image.find({ ownerId: tempOwnerId });

  if (findMany.length === 0) {
    console.log("pass4");
    return res
      .status(201)
      .json(
        formatApiResponse(
          201,
          STATUS_TEXT.SUCCESS,
          "the blog post created successfully, but the images not found, you can add them by update the blog post",
          blogPostCreation
        )
      );
  }

  await Image.updateMany(
    { ownerId: tempOwnerId },
    { $set: { ownerId: blogPostId, isTemp: isTemp } }
  );

  res
    .status(201)
    .json(
      formatApiResponse(
        201,
        STATUS_TEXT.SUCCESS,
        "The blog created successfully",
        blogPostCreation
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
        STATUS_TEXT.SUCCESS,
        "operation success",
        updateBlogPost
      )
    );
});

blogPostControllers.deleteBlogPost = asyncWrapper(async (req, res, next) => {
  const { blogPostId } = req.params;

  // find blog-post image
  const findBlogPostImage = await Image.findOne({
    ownerId: blogPostId,
    ownerModel: MODELS.BLOG,
  });
  console.log("findBlogPostImage: ", findBlogPostImage);
  // delete blog-post
  const blogPostDeletion = await BlogPost.deleteOne({ _id: blogPostId });

  // blog-post not founc
  if (blogPostDeletion.deletedCount === 0) {
    return res
      .status(404)
      .json(
        formatApiResponse(
          404,
          STATUS_TEXT.SUCCESS,
          "blog deleted successfully",
          blogPostDeletion
        )
      );
  }

  // blog post found but no images
  if (!findBlogPostImage) {
    return res
      .status(204)
      .json(
        formatApiResponse(
          200,
          STATUS_TEXT.SUCCESS,
          "blog post deleted successfully, but no images found to be deleted",
          blogPostDeletion
        )
      );
  }
  const blogPostImageDeletion = await Image.deleteOne({
    _id: findBlogPostImage._id,
  });
  console.log("image deleted");
  return res
    .status(200)
    .json(
      formatApiResponse(
        200,
        STATUS_TEXT.SUCCESS,
        "blog post delete completely",
        blogPostDeletion
      )
    );
});

// delete this controller, it's only for testing
blogPostControllers.deleteManyBlogPosts = asyncWrapper(
  async (req, res, next) => {
    const { slug } = req.body;

    try {
      const deleteAll = await BlogPost.deleteMany({ slug: slug });
      return res
        .status(200)
        .json(
          formatApiResponse(
            200,
            STATUS_TEXT.SUCCESS,
            "blog posts deleted successfully",
            deleteAll
          )
        );
    } catch (error) {
      console.log(error);
    }
  }
);
