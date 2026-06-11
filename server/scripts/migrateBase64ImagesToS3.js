'use strict';

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const { uploadFileToS3, hasS3Config } = require('../utils/s3Upload');
const Post = require('../models/Post');

const MONGO_URI = process.env.MONGO_URL || process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URL (or MONGODB_URI) env var is required');
  process.exit(1);
}

if (!hasS3Config) {
  console.error('❌ AWS S3 env vars are not fully configured (need AWS_REGION, AWS_S3_BUCKET_NAME, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)');
  process.exit(1);
}

/**
 * Parse a data URI into { buffer, contentType, extension }.
 * Returns null if the value is not a data URI.
 */
function parseDataUri(dataUri) {
  if (!dataUri || !dataUri.startsWith('data:')) return null;
  const commaIndex = dataUri.indexOf(',');
  if (commaIndex === -1) return null;

  const meta = dataUri.slice(5, commaIndex); // e.g. "image/jpeg;base64"
  const data = dataUri.slice(commaIndex + 1);
  const [mimeAndEncoding] = meta.split(';');
  const contentType = mimeAndEncoding || 'application/octet-stream';

  const extMap = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
  };
  const extension = extMap[contentType.toLowerCase()] || '';

  let buffer;
  try {
    buffer = Buffer.from(data, 'base64');
  } catch {
    return null;
  }

  return { buffer, contentType, extension };
}

async function migrateImageUrl(dataUri, label) {
  const parsed = parseDataUri(dataUri);
  if (!parsed) {
    console.warn(`  ⚠️  Could not parse data URI for ${label}`);
    return null;
  }
  const { buffer, contentType, extension } = parsed;
  const originalName = `image${extension}`;
  const { url } = await uploadFileToS3({ buffer, contentType, originalName, folder: 'posts' });
  return url;
}

async function run() {
  console.log('🔗 Connecting to MongoDB…');
  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  });
  console.log('✅ Connected');

  const posts = await Post.find({
    $or: [
      { imageUrl: { $regex: /^data:/ } },
      { 'images.url': { $regex: /^data:/ } },
    ],
  });

  console.log(`📋 Found ${posts.length} post(s) with base64 images to migrate`);

  let migratedCount = 0;
  const errors = [];

  for (const post of posts) {
    try {
      let changed = false;

      // Migrate top-level imageUrl
      if (post.imageUrl && post.imageUrl.startsWith('data:')) {
        const newUrl = await migrateImageUrl(post.imageUrl, `imageUrl of post ${post._id}`);
        if (newUrl) {
          post.imageUrl = newUrl;
          changed = true;
        }
      }

      // Migrate images[] array
      for (let i = 0; i < post.images.length; i++) {
        const img = post.images[i];
        if (img.url && img.url.startsWith('data:')) {
          const newUrl = await migrateImageUrl(img.url, `images[${i}].url of post ${post._id}`);
          if (newUrl) {
            post.images[i].url = newUrl;
            changed = true;
          }
        }
      }

      if (changed) {
        await post.save();
        console.log(`✅ Migrated post ${post._id}: ${post.title}`);
        migratedCount++;
      }
    } catch (err) {
      const msg = `❌ Error migrating post ${post._id} (${post.title}): ${err.message}`;
      console.error(msg);
      errors.push(msg);
    }
  }

  console.log('\n── Migration complete ──');
  console.log(`  Total migrated: ${migratedCount}`);
  if (errors.length > 0) {
    console.log(`  Errors (${errors.length}):`);
    errors.forEach((e) => console.log(`    ${e}`));
  } else {
    console.log('  No errors');
  }

  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB');
}

run().catch((err) => {
  console.error('❌ Fatal error:', err);
  mongoose.disconnect().finally(() => process.exit(1));
});
