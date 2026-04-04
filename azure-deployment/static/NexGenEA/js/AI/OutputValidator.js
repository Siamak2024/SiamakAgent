/**
 * OutputValidator.js — Schema validation for step task outputs.
 *
 * Validates that AI output objects contain required fields
 * and that field types match the expected schema.
 *
 * Used by StepEngine after parseOutput() to guard against
 * malformed or incomplete AI responses.
 */

const OutputValidator = (() => {

  /**
   * Validate an object against a simple schema definition.
   *
   * Schema shape:
   *   {
   *     fieldName: 'string'          // required string
   *     fieldName: 'string?'         // optional string
   *     fieldName: ['string']        // required array of strings
   *     fieldName: ['string?']       // optional array (may be empty)
   *     fieldName: 'number'          // required number
   *     fieldName: 'number?'         // optional number
   *     fieldName: 'boolean'         // required boolean
   *     fieldName: { ... }           // nested object (required)
   *   }
   *
   * @param {any}    obj    - The parsed output to validate
   * @param {object} schema - Schema definition
   * @returns {{ ok: boolean, errors: string[], warnings: string[] }}
   */
  function validate(obj, schema) {
    const errors   = [];
    const warnings = [];

    if (!obj || typeof obj !== 'object') {
      errors.push('Output is not an object');
      return { ok: false, errors, warnings };
    }

    for (const [key, spec] of Object.entries(schema)) {
      _checkField(obj, key, spec, errors, warnings);
    }

    return { ok: errors.length === 0, errors, warnings };
  }

  function _checkField(obj, key, spec, errors, warnings) {
    const value    = obj[key];
    const optional = typeof spec === 'string' && spec.endsWith('?');
    const baseType = typeof spec === 'string' ? spec.replace('?', '') : null;
    const isArray  = Array.isArray(spec);

    // Missing field
    if (value === undefined || value === null || value === '') {
      if (optional) {
        warnings.push(`Optional field "${key}" is missing or empty`);
      } else {
        errors.push(`Required field "${key}" is missing or empty`);
      }
      return;
    }

    // Array type check
    if (isArray) {
      if (!Array.isArray(value)) {
        errors.push(`Field "${key}" should be an array but got ${typeof value}`);
        return;
      }
      const itemSpec = spec[0] || 'string';
      const itemOptional = typeof itemSpec === 'string' && itemSpec.endsWith('?');
      if (!itemOptional && value.length === 0) {
        errors.push(`Required array "${key}" is empty`);
      }
      return;
    }

    // Primitive type checks
    if (baseType === 'string' && typeof value !== 'string') {
      errors.push(`Field "${key}" should be a string but got ${typeof value}`);
    } else if (baseType === 'number' && typeof value !== 'number') {
      errors.push(`Field "${key}" should be a number but got ${typeof value}`);
    } else if (baseType === 'boolean' && typeof value !== 'boolean') {
      errors.push(`Field "${key}" should be a boolean but got ${typeof value}`);
    }

    // Nested object
    if (spec && typeof spec === 'object' && !isArray) {
      if (typeof value !== 'object') {
        errors.push(`Field "${key}" should be an object but got ${typeof value}`);
        return;
      }
      const nested = validate(value, spec);
      nested.errors.forEach(e => errors.push(`${key}.${e}`));
      nested.warnings.forEach(w => warnings.push(`${key}.${w}`));
    }
  }

  /**
   * Assert validation passes, throw if not (strict mode).
   * Used in StepEngine when strict = true on a task.
   *
   * @param {any}    obj
   * @param {object} schema
   * @param {string} taskId - For error message context
   */
  function assert(obj, schema, taskId) {
    const result = validate(obj, schema);
    if (!result.ok) {
      throw new Error(
        `[OutputValidator] Task "${taskId}" output failed validation:\n` +
        result.errors.join('\n')
      );
    }
    if (result.warnings.length) {
      console.warn(
        `[OutputValidator] Task "${taskId}" warnings:\n${result.warnings.join('\n')}`
      );
    }
  }

  /**
   * Extract JSON from raw AI text (same logic as existing extractJSON).
   * @param {string} text
   * @returns {string}
   */
  function extractJSON(text) {
    const m = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (m) return m[1].trim();
    const a = text.indexOf('['), b = text.indexOf('{');
    const start = a === -1 ? b : b === -1 ? a : Math.min(a, b);
    if (start === -1) return text;
    return text.slice(start, Math.max(text.lastIndexOf(']'), text.lastIndexOf('}')) + 1);
  }

  /**
   * Parse JSON from raw AI output, with clear error messages.
   * @param {string} raw   - Raw AI response text
   * @param {string} taskId - For error context
   * @returns {any}
   */
  function parseJSON(raw, taskId) {
    try {
      return JSON.parse(extractJSON(raw));
    } catch (e) {
      throw new Error(
        `[OutputValidator] Task "${taskId}" JSON parse failed: ${e.message}\n` +
        `Raw output (first 300 chars): ${String(raw || '').slice(0, 300)}`
      );
    }
  }

  return { validate, assert, extractJSON, parseJSON };

})();
