/**
 * Mapeo snake_case (DB) <-> camelCase (Frontend)
 */

const toCamel = (str) => str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
const toSnake = (str) => str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

function mapRowToCamel(row) {
  if (!row) return null;
  const result = {};
  for (const [key, value] of Object.entries(row)) {
    result[toCamel(key)] = value;
  }
  return result;
}

function mapRowsToCamel(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map(mapRowToCamel);
}

function mapObjToSnake(obj) {
  if (!obj) return {};
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) result[toSnake(key)] = value;
  }
  return result;
}

module.exports = { mapRowToCamel, mapRowsToCamel, mapObjToSnake, toCamel, toSnake };
