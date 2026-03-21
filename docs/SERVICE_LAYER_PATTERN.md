# Service Layer Pattern

## The Problem

In your current codebase, controllers directly access models and contain business logic. This works, but creates issues as the project grows.

## Current Approach (Without Service Layer)

```
Request → Route → Controller → Model → Database
                      ↓
              (Business Logic mixed here)
```

### Example: Your Current `createProperty` Controller

```javascript
// controllers/property.controllers.js
propertyControllers.createProperty = asyncWrapper(async (req, res, next) => {
  const { body } = req;
  const generateSlug = slugGenerator(body.title);
  const { tempId, ...rest } = body;
  const tempOwnerId = tempId;
  const isTemp = false;

  // Business logic: creating property
  const createdProperty = new Property({ ...rest, slug: generateSlug });
  const propertyCreation = await createdProperty.save();
  const propertyId = propertyCreation._id;

  // Business logic: finding and linking images
  const findMany = await Image.find({ ownerId: tempOwnerId });

  if (findMany.length === 0) {
    return res.status(201).json(
      formatApiResponse(201, STATUS_TEXT.SUCCESS, "property created...", propertyCreation)
    );
  }

  // Business logic: updating image ownership
  await Image.updateMany(
    { ownerId: tempOwnerId },
    { $set: { ownerId: propertyId, isTemp: isTemp } }
  );

  res.status(201).json(
    formatApiResponse(201, STATUS_TEXT.SUCCESS, "Property created", propertyCreation)
  );
});
```

### Problems with This Approach

| Problem | Impact |
|---------|--------|
| **Mixed responsibilities** | Controller handles HTTP + business logic + data access |
| **Hard to test** | Must mock HTTP request/response to test business logic |
| **Code duplication** | Same logic repeated if needed in another controller |
| **Tight coupling** | Changing database requires changing controllers |
| **Hard to reuse** | Can't call this logic from a CLI tool or background job |

---

## Better Approach (With Service Layer)

```
Request → Route → Controller → Service → Model → Database
                      ↓            ↓
              (HTTP handling)  (Business Logic)
```

### Step 1: Create the Service

```javascript
// services/property.service.js
const Property = require("../models/property.model");
const Image = require("../models/image.model");
const { slugGenerator } = require("../utils/utils");

const propertyService = module.exports;

/**
 * Creates a new property and links any temporary images to it
 * @param {Object} propertyData - The property data from request body
 * @returns {Object} - { property, imagesLinked }
 */
propertyService.createProperty = async (propertyData) => {
  const { tempId, ...rest } = propertyData;
  const slug = slugGenerator(rest.title);

  // Create the property
  const property = new Property({ ...rest, slug });
  await property.save();

  // Link temporary images if tempId was provided
  let imagesLinked = 0;
  if (tempId) {
    const result = await Image.updateMany(
      { ownerId: tempId },
      { $set: { ownerId: property._id, isTemp: false } }
    );
    imagesLinked = result.modifiedCount;
  }

  return { property, imagesLinked };
};

/**
 * Gets a property by slug
 * @param {string} slug - The property slug
 * @returns {Object|null} - The property or null
 */
propertyService.getBySlug = async (slug) => {
  return Property.findOne({ slug }, { __v: false }).lean();
};

/**
 * Gets paginated properties with optional filters
 * @param {Object} options - { page, pageSize, filter }
 * @returns {Object} - Paginated result
 */
propertyService.getPaginated = async ({ page = 1, pageSize = 10, filter = {} }) => {
  const skip = (page - 1) * pageSize;

  // Single query with $facet for better performance
  const [result] = await Property.aggregate([
    { $match: filter },
    {
      $facet: {
        data: [
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: pageSize },
          { $project: { __v: 0 } }
        ],
        totalCount: [{ $count: "count" }]
      }
    }
  ]);

  const total = result.totalCount[0]?.count || 0;
  const totalPages = Math.ceil(total / pageSize);

  return {
    data: result.data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
};

/**
 * Updates a property by ID
 * @param {string} propertyId - The property ID
 * @param {Object} updates - Fields to update
 * @returns {Object} - Updated property
 */
propertyService.updateById = async (propertyId, updates) => {
  return Property.findByIdAndUpdate(
    propertyId,
    updates,
    { new: true, runValidators: true }
  ).lean();
};

/**
 * Deletes a property and all associated images
 * @param {string} propertyId - The property ID
 * @returns {Object} - { property, imagesDeleted }
 */
propertyService.deleteWithImages = async (propertyId) => {
  const { deleteImageFromDBAndBucket } = require("../integrations/image.service");

  // Find associated images
  const images = await Image.find({ ownerId: propertyId, ownerModel: "Property" });

  // Delete the property
  const deleteResult = await Property.deleteOne({ _id: propertyId });

  if (deleteResult.deletedCount === 0) {
    return null; // Property not found
  }

  // Delete associated images from S3 and DB
  const imageDeletePromises = images.map((img) => deleteImageFromDBAndBucket(img._id));
  await Promise.all(imageDeletePromises);

  return {
    propertyDeleted: true,
    imagesDeleted: images.length
  };
};
```

### Step 2: Simplify the Controller

```javascript
// controllers/property.controllers.js
const { formatApiResponse } = require("../utils/response");
const { STATUS_TEXT } = require("../config/enum.config");
const asyncWrapper = require("../middlewares/asyncWrapper");
const propertyService = require("../services/property.service");
const AppError = require("../utils/appError");

const propertyControllers = module.exports;

// Clean and simple - only handles HTTP concerns
propertyControllers.createProperty = asyncWrapper(async (req, res) => {
  const { property, imagesLinked } = await propertyService.createProperty(req.body);

  const message = imagesLinked > 0
    ? `Property created with ${imagesLinked} images`
    : "Property created successfully";

  res.status(201).json(
    formatApiResponse(201, STATUS_TEXT.SUCCESS, message, property)
  );
});

propertyControllers.getProperty = asyncWrapper(async (req, res) => {
  const property = await propertyService.getBySlug(req.params.slug);

  res.status(200).json(
    formatApiResponse(200, STATUS_TEXT.SUCCESS, "Property retrieved", property)
  );
});

propertyControllers.getPaginatedProperties = asyncWrapper(async (req, res) => {
  const { page, pageSize } = req.query;
  const result = await propertyService.getPaginated({
    page: parseInt(page) || 1,
    pageSize: parseInt(pageSize) || 10
  });

  res.status(200).json(
    formatApiResponse(200, STATUS_TEXT.SUCCESS, "Properties retrieved", result)
  );
});

propertyControllers.updateProperty = asyncWrapper(async (req, res) => {
  const property = await propertyService.updateById(req.params.propertyId, req.body);

  res.status(200).json(
    formatApiResponse(200, STATUS_TEXT.SUCCESS, "Property updated", property)
  );
});

propertyControllers.deleteProperty = asyncWrapper(async (req, res, next) => {
  const result = await propertyService.deleteWithImages(req.params.propertyId);

  if (!result) {
    const error = new AppError();
    error.create(404, STATUS_TEXT.FAIL, "Property not found");
    return next(error);
  }

  res.status(200).json(
    formatApiResponse(200, STATUS_TEXT.SUCCESS, "Property deleted", result)
  );
});
```

---

## Comparison

### Before (Controller)

```javascript
// 50+ lines mixing HTTP, business logic, and data access
propertyControllers.createProperty = asyncWrapper(async (req, res, next) => {
  const { body } = req;
  const generateSlug = slugGenerator(body.title);
  const { tempId, ...rest } = body;
  // ... 40 more lines of mixed concerns
});
```

### After (Controller)

```javascript
// 8 lines - only HTTP handling
propertyControllers.createProperty = asyncWrapper(async (req, res) => {
  const { property, imagesLinked } = await propertyService.createProperty(req.body);
  const message = imagesLinked > 0 ? `Property created with ${imagesLinked} images` : "Property created";
  res.status(201).json(formatApiResponse(201, STATUS_TEXT.SUCCESS, message, property));
});
```

---

## Benefits of Service Layer

| Benefit | Explanation |
|---------|-------------|
| **Testable** | Test business logic without HTTP mocking |
| **Reusable** | Call `propertyService.createProperty()` from CLI, cron job, or another service |
| **Single responsibility** | Controllers handle HTTP, services handle business logic |
| **Easier to maintain** | Change business logic in one place |
| **Swappable** | Replace MongoDB with PostgreSQL without touching controllers |

---

## Testing Example

### Without Service Layer (Hard to Test)

```javascript
// Must mock req, res, next - complicated
test("createProperty", async () => {
  const req = { body: { title: "Test", ... } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();

  await propertyControllers.createProperty(req, res, next);

  expect(res.status).toHaveBeenCalledWith(201);
  // Hard to verify business logic
});
```

### With Service Layer (Easy to Test)

```javascript
// Direct function call - simple
test("createProperty", async () => {
  const result = await propertyService.createProperty({
    title: "Test Property",
    description: "A test property",
    price: 100000,
    // ...
  });

  expect(result.property.slug).toBe("test-property");
  expect(result.property.title).toBe("Test Property");
});
```

---

## Directory Structure with Services

```
src/
├── controllers/          # HTTP handling only
│   ├── property.controllers.js
│   ├── user.controllers.js
│   └── ...
├── services/             # Business logic
│   ├── property.service.js    ← NEW
│   ├── user.service.js        ← NEW
│   ├── image.service.js       ← NEW (move from integrations)
│   └── pagination.service.js
├── models/               # Data structure
├── routes/               # Route definitions
└── ...
```

---

## When to Add a Service Layer

| Project Size | Recommendation |
|--------------|----------------|
| Small/learning project | Optional - current approach is fine |
| Growing project | Recommended - easier refactoring later |
| Production/team project | Required - maintainability is critical |

For your current project, this is a learning opportunity. You could refactor one controller (like property) to use a service layer and see how it feels.

---

## Summary

**Controller's job:** Parse request → Call service → Format response

**Service's job:** Implement business logic → Access data → Return result

Keep them separate, and your code becomes easier to test, reuse, and maintain.
