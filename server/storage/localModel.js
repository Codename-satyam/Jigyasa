const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

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

function stripFunctions(record) {
  if (!record) return record;
  const plain = {};
  Object.keys(record).forEach((key) => {
    if (typeof record[key] !== 'function') plain[key] = record[key];
  });
  return plain;
}

class LocalQuery {
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
    let result = await this.executor();
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

class LocalModel {
  constructor(data = {}) {
    Object.assign(this, data);
    if (!this._id) this._id = LocalModel.createId();
    if (!this.id) this.id = this._id;
  }

  static createId() {
    return crypto.randomBytes(12).toString('hex');
  }

  static get collectionName() {
    throw new Error('collectionName must be defined');
  }

  static get filePath() {
    return path.join(DATA_DIR, `${this.collectionName}.json`);
  }

  static async readAll() {
    ensureDataDir();
    if (!fs.existsSync(this.filePath)) return [];
    const raw = await fs.promises.readFile(this.filePath, 'utf8');
    if (!raw.trim()) return [];
    return JSON.parse(raw);
  }

  static async writeAll(records) {
    ensureDataDir();
    await fs.promises.writeFile(this.filePath, JSON.stringify(records, null, 2));
  }

  static hydrate(record) {
    return record ? new this(record) : null;
  }

  static async populateRecords(records, { field, select }) {
    if (!records) return records;
    const mapper = this.populateMap?.[field];
    if (!mapper) return records;
    const modelPath = mapper.startsWith('./')
      ? path.join(__dirname, '..', 'models', mapper.slice(2))
      : mapper;
    const RelatedModel = require(modelPath);
    const list = Array.isArray(records) ? records : [records];

    for (const record of list) {
      const id = record?.[field];
      if (!id || typeof id === 'object') continue;
      const related = await RelatedModel.findById(id).select(select || '').lean();
      if (related) record[field] = related;
    }

    return Array.isArray(records) ? list : list[0];
  }

  static find(filter = {}) {
    return new LocalQuery(this, async () => {
      const records = await this.readAll();
      return records.filter((record) => matchesFilter(record, filter));
    });
  }

  static findOne(filter = {}) {
    return new LocalQuery(this, async () => {
      const records = await this.readAll();
      return records.find((record) => matchesFilter(record, filter)) || null;
    });
  }

  static findById(id) {
    return new LocalQuery(this, async () => {
      const records = await this.readAll();
      return records.find((record) => String(record._id) === String(id)) || null;
    });
  }

  static findByIdAndUpdate(id, update = {}, options = {}) {
    return new LocalQuery(this, async () => {
      const records = await this.readAll();
      const index = records.findIndex((record) => String(record._id) === String(id));
      if (index === -1) return null;

      records[index] = { ...records[index], ...clone(update), id: records[index].id || records[index]._id };
      await this.writeAll(records);
      return options.new ? records[index] : null;
    });
  }

  static findOneAndUpdate(filter = {}, update = {}, options = {}) {
    return new LocalQuery(this, async () => {
      const records = await this.readAll();
      const index = records.findIndex((record) => matchesFilter(record, filter));
      if (index === -1) return null;

      records[index] = { ...records[index], ...clone(update), id: records[index].id || records[index]._id };
      await this.writeAll(records);
      return options.new ? records[index] : null;
    });
  }

  static findByIdAndDelete(id) {
    return new LocalQuery(this, async () => {
      const records = await this.readAll();
      const index = records.findIndex((record) => String(record._id) === String(id));
      if (index === -1) return null;

      const [deleted] = records.splice(index, 1);
      await this.writeAll(records);
      return deleted;
    });
  }

  async save() {
    if (typeof this.beforeSave === 'function') {
      await this.beforeSave();
    }

    if (!this._id) this._id = LocalModel.createId();
    if (!this.id) this.id = this._id;

    const Model = this.constructor;
    const records = await Model.readAll();
    const index = records.findIndex((record) => String(record._id) === String(this._id));
    const plain = stripFunctions(this);

    if (index === -1) records.push(plain);
    else records[index] = plain;

    await Model.writeAll(records);
    return this;
  }

  toObject() {
    return stripFunctions(this);
  }

  toJSON() {
    return this.toObject();
  }
}

module.exports = LocalModel;
