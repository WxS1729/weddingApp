/**
 * WXSS Parser Utility
 * Parses WXSS content and extracts selectors, properties, and keyframes
 */

/**
 * Parse WXSS content and extract all rules
 * @param {string} content - WXSS content
 * @returns {Object} Parsed rules including selectors, properties, and keyframes
 */
function parseWXSS(content) {
  const result = {
    selectors: [],
    properties: [],
    keyframes: [],
    imports: [],
    errors: []
  };

  if (!content || typeof content !== 'string') {
    result.errors.push('Invalid WXSS content: content is empty or not a string');
    return result;
  }

  // Extract @import statements
  const importRegex = /@import\s+['"]([^'"]+)['"]\s*;/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    result.imports.push(match[1]);
  }

  // Remove comments
  const contentWithoutComments = content.replace(/\/\*[\s\S]*?\*\//g, '');

  // Extract @keyframes
  const keyframeRegex = /@keyframes\s+([a-zA-Z0-9_-]+)\s*\{([\s\S]*?)\}/g;
  while ((match = keyframeRegex.exec(contentWithoutComments)) !== null) {
    const keyframeName = match[1];
    const keyframeContent = match[2];
    const steps = [];

    // Parse keyframe steps
    const stepRegex = /(\d+(?:\.\d+)?%)\s*\{([\s\S]*?)\}/g;
    let stepMatch;
    while ((stepMatch = stepRegex.exec(keyframeContent)) !== null) {
      steps.push({
        percent: stepMatch[1],
        properties: parseProperties(stepMatch[2])
      });
    }

    result.keyframes.push({
      name: keyframeName,
      steps: steps
    });
  }

  // Extract CSS rules (selector { properties })
  const ruleRegex = /([^{}]+)\s*\{([^{}]*)\}/g;
  while ((match = ruleRegex.exec(contentWithoutComments)) !== null) {
    const selector = match[1].trim();
    const propertiesContent = match[2];

    // Skip @keyframes and @import (already processed)
    if (selector.startsWith('@keyframes') || selector.startsWith('@import')) {
      continue;
    }

    // Skip pseudo-elements with content (::after, ::before) that have content: ''
    if (selector.includes('::after') || selector.includes('::before')) {
      // Handle these specially
      const selectors = selector.split(',').map(s => s.trim());
      selectors.forEach(sel => {
        if (sel) {
          result.selectors.push(sel);
          result.properties.push(...parseProperties(propertiesContent));
        }
      });
      continue;
    }

    if (selector) {
      // Handle multiple selectors separated by comma
      const selectors = selector.split(',').map(s => s.trim()).filter(s => s);
      result.selectors.push(...selectors);
      result.properties.push(...parseProperties(propertiesContent));
    }
  }

  return result;
}

/**
 * Parse CSS properties from a rule body
 * @param {string} propertiesContent - CSS properties content
 * @returns {Array} Array of property objects
 */
function parseProperties(propertiesContent) {
  const properties = [];
  const propRegex = /([a-zA-Z0-9-]+)\s*:\s*([^;]+);/g;
  let match;

  while ((match = propRegex.exec(propertiesContent)) !== null) {
    properties.push({
      name: match[1].trim(),
      value: match[2].trim()
    });
  }

  return properties;
}

/**
 * Validate a CSS property value
 * @param {string} propertyName - CSS property name
 * @param {string} value - CSS property value
 * @returns {Object} Validation result
 */
function validatePropertyValue(propertyName, value) {
  const errors = [];

  // Check for invalid values
  if (value === '' || value === undefined) {
    errors.push(`Empty value for property: ${propertyName}`);
  }

  // Check for NaN-like values
  if (value === 'NaN' || value.includes('undefined') || value.includes('null')) {
    errors.push(`Invalid value "${value}" for property: ${propertyName}`);
  }

  // Validate specific property types
  const unitProperties = {
    width: ['rpx', 'px', '%', 'vh', 'vw', 'auto'],
    height: ['rpx', 'px', '%', 'vh', 'vw', 'auto'],
    margin: ['rpx', 'px', '%', 'auto'],
    marginTop: ['rpx', 'px', '%', 'auto'],
    marginBottom: ['rpx', 'px', '%', 'auto'],
    marginLeft: ['rpx', 'px', '%', 'auto'],
    marginRight: ['rpx', 'px', '%', 'auto'],
    padding: ['rpx', 'px', '%'],
    paddingRight: ['rpx', 'px', '%'],
    top: ['rpx', 'px', '%', 'auto'],
    bottom: ['rpx', 'px', '%', 'auto'],
    left: ['rpx', 'px', '%', 'auto'],
    right: ['rpx', 'px', '%', 'auto'],
    borderRadius: ['rpx', 'px', '%'],
    fontSize: ['rpx', 'px'],
    lineHeight: ['rpx', 'px', 'em', 'rem', ''], // Can be unitless
    borderTop: ['rpx', 'px'],
    border: ['rpx', 'px'],
    zIndex: ['auto', 'inherit', 'initial']
  };

  if (unitProperties[propertyName]) {
    const validUnits = unitProperties[propertyName];
    const hasValidUnit = validUnits.some(unit => {
      if (unit === '') {
        // Unitless value (like line-height: 1.5)
        return /^-?\d+(\.\d+)?$/.test(value);
      }
      return value.includes(unit);
    });

    if (!hasValidUnit && !errors.length) {
      // Only add warning if no other errors
      const numericMatch = value.match(/^(-?\d+(\.\d+)?)/);
      if (numericMatch && !validUnits.includes('')) {
        // It's a number but doesn't have a valid unit
        errors.push(`Invalid unit in value "${value}" for property: ${propertyName}`);
      }
    }
  }

  // Validate color values
  const colorProperties = ['color', 'background', 'background-color', 'border-color'];
  if (colorProperties.includes(propertyName)) {
    const colorRegex = /^(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|transparent|inherit|initial|unset|currentColor)/;
    if (!colorRegex.test(value) && !errors.length) {
      // Check if it looks like a color value anyway
      if (value.includes('rgb') || value.includes('#') || value === 'white' || value === 'black' || value === 'red') {
        // It's probably a valid color, no error
      } else if (!/^[a-zA-Z]+$/.test(value) && !value.startsWith('rgba') && !value.startsWith('#')) {
        errors.push(`Potentially invalid color value "${value}" for property: ${propertyName}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Extract all class names from WXML content
 * @param {string} wxmlContent - WXML content
 * @returns {Array} Array of class names
 */
function extractClassesFromWXML(wxmlContent) {
  const classes = [];
  const classRegex = /class\s*=\s*["']([^"']+)["']/g;
  let match;

  while ((match = classRegex.exec(wxmlContent)) !== null) {
    const classString = match[1];
    // Split by whitespace to handle multiple classes
    const classNames = classString.split(/\s+/).filter(c => c);
    classes.push(...classNames);
  }

  return [...new Set(classes)]; // Remove duplicates
}

/**
 * Extract element selectors from WXML content
 * @param {string} wxmlContent - WXML content
 * @returns {Array} Array of element names
 */
function extractElementsFromWXML(wxmlContent) {
  const elements = [];
  // Match opening tags like <view, <image, <text, etc.
  const elementRegex = /<([a-z]+)(?:\s|>|/)/gi;
  let match;

  while ((match = elementRegex.exec(wxmlContent)) !== null) {
    elements.push(match[1].toLowerCase());
  }

  return [...new Set(elements)];
}

module.exports = {
  parseWXSS,
  parseProperties,
  validatePropertyValue,
  extractClassesFromWXML,
  extractElementsFromWXML
};
