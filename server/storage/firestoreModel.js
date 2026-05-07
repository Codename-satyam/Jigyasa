const LocalModel = require('./localModel');
const { getFirestore } = require('./firebase');

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function getByPath(obj, key) {
  return String(key)
    .split('.')
    .reduce((current, part) => (current == null ? undefined : current[part]), obj);
}

function matchesFilter(record, filter = {}) {
  return Object.entries(filter).every(([key, expected]) => {
    const actual = getByPath(record, key);
    if (expected && typeof expected === 'object' && !Array.isArray(expected)) {
      if ('$in' in expected) return expected.$in.map(String).includes(String(actual));
    }
    return String(actual) === String(expected);
  });
}

function compareBySort(sortSpec = {}) {
  const entries = Object.entries(sortSpec);
  return (left, right) => {
    for (const [field, direction] of entries) {
      const a = getByPath(left, field);
      const b = getByPath(right, field);
      if (a === b) continue;
      if (a == null) return 1;
      if (b == null) return -1;
      return (a > b ? 1 : -1) * (Number(direction) < 0 ? -1 : 1);
    }
    return 0;
  };
}

function applySelect(record, selectSpec) {
  if (!record || !selectSpec) return record;

  const fields = String(selectSpec).split(/\s+/).filter(Boolean);
  const excludes = fields.filter((field) => field.startsWith('-')).map((field) => field.slice(1));
  const includes = fields.filter((field) => !field.startsWith('-'));

  if (includes.length > 0) {
    const selected = {};
    includes.forEach((field) => {
      if (record[field] !== undefined) selected[field] = record[field];
    });
    if (record._id !== undefined) selected._id = record._id;
    if (record.id !== undefined) selected.id = record.id;
    return selected;
  }

  const next = clone(record);
  excludes.forEach((field) => delete next[field]);
  return next;
}

class FirestoreQuery {
  constructor(model, executor) {
    this.model = model;
    this.executor = executor;
    this.selectSpec = null;
    this.populateSpecs = [];
    this.sortSpec = null;
    this.limitCount = null;
    this.useLean = false;
  }

  select(spec) {
    this.selectSpec = spec;
    return this;
  }

  populate(field, select) {
    this.populateSpecs.push({ field, select });
    return this;
  }

  sort(spec) {
    this.sortSpec = spec;
    return this;
  }

  limit(count) {
    this.limitCount = Number(count);
    return this;
  }

  lean() {
    this.useLean = true;
    return this;
  }

  async exec() {
    let result = await this.executor({
      sortSpec: this.sortSpec,
      limitCount: this.limitCount,
    });
    const isArray = Array.isArray(result);
    let records = isArray ? result.map(clone) : clone(result);

    if (isArray && this.sortSpec) records.sort(compareBySort(this.sortSpec));
    if (isArray && Number.isInteger(this.limitCount)) records = records.slice(0, this.limitCount);

    for (const spec of this.populateSpecs) {
      records = await this.model.populateRecords(records, spec);
    }

    if (this.selectSpec) {
      records = isArray
        ? records.map((record) => applySelect(record, this.selectSpec))
        : applySelect(records, this.selectSpec);
    }

    if (!this.useLean && records) {
      return isArray
        ? records.map((record) => this.model.hydrate(record))
        : this.model.hydrate(records);
    }
    return records;
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }

  catch(reject) {
    return this.exec().catch(reject);
  }
}

function applyFirestoreFilters(query, filter = {}) {
  for (const [field, expected] of Object.entries(filter)) {
    if (expected && typeof expected === 'object' && !Array.isArray(expected)) {
      if ('$in' in expected) {
        query = query.where(field, 'in', expected.$in);
      }
      continue;
    }
    query = query.where(field, '==', expected);
  }
  return query;
}

function applyFirestoreSortAndLimit(query, sortSpec, limitCount) {
  if (sortSpec) {
    for (const [field, direction] of Object.entries(sortSpec)) {
      query = query.orderBy(field, Number(direction) < 0 ? 'desc' : 'asc');
    }
  }

  if (Number.isInteger(limitCount) && limitCount > 0) {
    query = query.limit(limitCount);
  }

  return query;
}

async function snapshotToRecords(snapshot) {
  return snapshot.docs.map((doc) => ({
    _id: doc.id,
    id: doc.id,
    ...doc.data(),
  }));
}

class FirestoreModel extends LocalModel {
  static collection() {
    const db = getFirestore();
    if (!db) return null;
    return db.collection(this.collectionName);
  }

  static async readAll() {
    const collection = this.collection();
    if (!collection) return super.readAll();

    const snapshot = await collection.get();
    return snapshot.docs.map((doc) => ({
      _id: doc.id,
      id: doc.id,
      ...doc.data(),
    }));
  }

  static async writeRecord(record) {
    const collection = this.collection();
    if (!collection) {
      const records = await super.readAll();
      const index = records.findIndex((item) => String(item._id) === String(record._id));
      if (index === -1) records.push(record);
      else records[index] = record;
      await super.writeAll(records);
      return;
    }

    const { _id, id, ...data } = record;
    await collection.doc(String(_id)).set({ ...data, id: id || _id }, { merge: false });
  }

  static find(filter = {}) {
    return new FirestoreQuery(this, async ({ sortSpec, limitCount } = {}) => {
      const collection = this.collection();
      if (collection) {
        try {
          const query = applyFirestoreSortAndLimit(
            applyFirestoreFilters(collection, filter),
            sortSpec,
            limitCount
          );
          return snapshotToRecords(await query.get());
        } catch (err) {
          console.warn(`[firestoreModel] Query fallback for ${this.collectionName}:`, err.message);
        }
      }

      const records = await this.readAll();
      return records.filter((record) => matchesFilter(record, filter));
    });
  }

  static findOne(filter = {}) {
    return new FirestoreQuery(this, async () => {
      const collection = this.collection();
      if (collection) {
        try {
          const query = applyFirestoreFilters(collection, filter).limit(1);
          const records = await snapshotToRecords(await query.get());
          return records[0] || null;
        } catch (err) {
          console.warn(`[firestoreModel] Query fallback for ${this.collectionName}:`, err.message);
        }
      }

      const records = await this.readAll();
      return records.find((record) => matchesFilter(record, filter)) || null;
    });
  }

  static findById(id) {
    return new FirestoreQuery(this, async () => {
      const collection = this.collection();
      if (!collection) {
        const records = await this.readAll();
        return records.find((record) => String(record._id) === String(id)) || null;
      }

      const doc = await collection.doc(String(id)).get();
      return doc.exists ? { _id: doc.id, id: doc.id, ...doc.data() } : null;
    });
  }

  static findByIdAndUpdate(id, update = {}, options = {}) {
    return new FirestoreQuery(this, async () => {
      const existing = await this.findById(id).lean();
      if (!existing) return null;

      const next = { ...existing, ...clone(update), _id: existing._id, id: existing.id || existing._id };
      await this.writeRecord(next);
      return options.new ? next : null;
    });
  }

  static findOneAndUpdate(filter = {}, update = {}, options = {}) {
    return new FirestoreQuery(this, async () => {
      const existing = await this.findOne(filter).lean();
      if (!existing) return null;

      const next = { ...existing, ...clone(update), _id: existing._id, id: existing.id || existing._id };
      await this.writeRecord(next);
      return options.new ? next : null;
    });
  }

  static findByIdAndDelete(id) {
    return new FirestoreQuery(this, async () => {
      const existing = await this.findById(id).lean();
      if (!existing) return null;

      const collection = this.collection();
      if (!collection) {
        await super.findByIdAndDelete(id);
      } else {
        await collection.doc(String(id)).delete();
      }
      return existing;
    });
  }

  async save() {
    if (typeof this.beforeSave === 'function') {
      await this.beforeSave();
    }

    if (!this._id) this._id = FirestoreModel.createId();
    if (!this.id) this.id = this._id;

    const plain = this.toObject();
    await this.constructor.writeRecord(plain);
    return this;
  }
}

module.exports = FirestoreModel;
