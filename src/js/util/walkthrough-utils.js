'use strict';
var isMatch = require('lodash.ismatch');

/**
 * Walkthrough Utility has functions used in the walkthrough react components
 * that need to be well tested and can exist outside of the ui
 */

/**
 * The container for the property values in the store. These differ by primitive type.
 * @TODO update these when guide and scales are added into redux
 * @type {Object}
 */
var PROPERTY_CONTAINER = {
  marks: 'properties.update',
  guides: 'property',
  scales: ''
};

/**
 * Get the properties off the primitive
 * @param  {Object} object - a primitive object
 * @param  {String} type - either marks, guides or scales
 * @returns {Object} - object of the primitives properties
 */
function getProperties(object, type) {
  var props = PROPERTY_CONTAINER[type].split('.');
  var propertyObj = object;
  for (var i = 0; i < props.length; i++) {
    propertyObj = propertyObj ? propertyObj[props[i]] : propertyObj;
  }
  return propertyObj;
}

/**
 * Get an array of all elements with a certain type
 * @param  {string} elemType - a string that will match the key in each state element
 * @param  {Array} stateArray - an array of objects to test against
 * @param  {string} key - key to filter by
 * @returns {Array} All matching elements
 */
function filterBy(elemType, stateArray, key) {
  return stateArray.filter(function(o) {
    return o[key] === elemType;
  });
}

/**
 * Test that the type exists in the state
 * @param  {string} elemType - a string that will match the 'type' key in each state element
 * @param  {Array} stateArray - an array of objects to test against
 * @param  {number} min - minimum required to be found to pass test
 * @returns {Boolean} Success or failure of the type existence test
 */
function testTypeExistence(elemType, stateArray, min) {
  var minimum = min || 1;
  var found = filterBy(elemType, stateArray, 'type');

  return (found.length >= minimum);
}

/**
 * Test that an element exists with all properties needed
 * @param  {Object} match - the matching element
 * @param  {Object} elem - an object to match against
 * @param  {String} type - the type in the store eg - Marks, Scales, Guide
 * @returns {Boolean} Success or failure of the test
 */
function matchPropertyExistence(match, elem, type) {
  // get the container of the properties by type
  var matchProps = getProperties(match, type),
      elemProps = getProperties(elem, type);
  return isMatch(elemProps, matchProps);
}

/**
 * Test state array for match on an element with all properties
 * @param  {Object} match - the matching element
 * @param  {Array} stateArray - array of all state elements
 * @param  {String} type  - the type in the store eg - Marks, Scales, Guide
 * @returns {Boolean} Success or failure of the test
 */
function testPropertyExistence(match, stateArray, type) {
  var status = false;
  if (getProperties(match, type)) {
    for (var i = 0; i < stateArray.length; i++) {
      if (matchPropertyExistence(match, stateArray[i], type)) {
        status = true;
        break;
      }
    }
  } else {
    status = true;
  }
  return status;
}

/**
 * Validate one store object against another.
 * @param  {Object} currentState  - the current state that is being tested against
 * @param  {Object} expectedState - the expected state required to go on to the next walkthrough
 * @param  {String} type - marks, guides, or scales
 * @returns {Object} An object containing success or error messaging
 */
function validate(currentState, expectedState) {
  var status = true,
      errors = [];

  var markSpec = currentState.marks;
  // Marks -------------
  if (markSpec) {
    for (var i = 0; i < expectedState.marks.length; i++) {
      // find types in current state
      // find how many we are looking for
      var markType = expectedState.marks[i].type,
          min = filterBy(markType, expectedState.marks, 'type').length;
      // test type existence ----------------------
      if (!testTypeExistence(markType, markSpec, min)) {
        status = false;
        errors.push('No ' + markType.toUpperCase() + ' mark found');
        break;
      }

      // test property existence ------------------
      var expectedProps = getProperties(expectedState.marks[i], 'marks');
      if (expectedProps && !testPropertyExistence(expectedState.marks[i], markSpec, 'marks')) {
        status = false;
        errors.push('Missing a ' + markType.toUpperCase() + ' element with properties: ' + JSON.stringify(expectedProps));
      }
    }
  }

  // Scales -------------
  if (currentState.scales) {
    // TODO
  }

  // Axes -------------
  if (currentState.axes) {
    // TODO
  }

  return {
    success_status: status,
    errors: errors
  };
}

module.exports = {
  validate: validate
};
