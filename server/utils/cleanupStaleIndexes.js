const mongoose = require('mongoose');

// This MongoDB database has a recurring legacy issue: several collections
// (already seen on products, coupons, and orders) carry over a unique
// index named "id_1" from an old schema version that used a custom `id`
// field. None of our current Mongoose schemas define an `id` field (they
// all rely on the default `_id`), so every document ends up with
// `id: null` — and the SECOND document inserted into any such collection
// trips a duplicate-key error (E11000) on that stale index.
//
// Rather than special-casing this per-route every time it turns up again,
// this runs once at server startup and drops that stale index (if present)
// from every registered collection.
async function cleanupStaleIndexes() {
  const modelNames = mongoose.modelNames();

  for (const modelName of modelNames) {
    const collection = mongoose.model(modelName).collection;
    try {
      const indexes = await collection.indexes();
      for (const idx of indexes) {
        if (idx.name === 'id_1') {
          console.log(`[cleanupStaleIndexes] Dropping stale "id_1" index on "${collection.collectionName}"`);
          await collection.dropIndex('id_1').catch(() => {});
        }
      }
    } catch (err) {
      // Collection may not exist yet (e.g. first run before any documents
      // are inserted) — that's fine, nothing to clean up.
    }
  }
}

module.exports = cleanupStaleIndexes;
