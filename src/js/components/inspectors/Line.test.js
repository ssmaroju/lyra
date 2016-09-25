/* eslint no-unused-expressions:0 */
'use strict';

var expect = require('chai').expect;
var React = require('react');
var enzyme = require('enzyme');
var Line = require('./Line');
var Property = require('./Property');
var wrapper;

// this is shallow rendered tested since all the work is done in property.js
describe('Line Inspector <Line/> (shallow)', function() {
  beforeEach(function() {
    var mock = {
      from: {
        data: 'dummy_data'
      },
      properties: {
        update: {
          x: {value: 25},
          y: {value: 25},
          fill: {value: '#4682b4'},
          fillOpacity: {value: 1},
          stroke: {value: '#000000'},
          strokeWidth: {value: 0.25},
          tension: {value: 13},
          interpolate: {value: 'monotone'}
        }
      }
    };
    wrapper = enzyme.shallow(<Line primitive={mock}/>);
  });

  it('renders as a <div>', function() {
    expect(wrapper.type()).to.eql('div');
  });

  it('it should render 4 <Property/> components', function() {
    expect(wrapper.find(Property)).to.have.length(6);
  });

  it('it should render 3 h3 tags', function() {
    expect(wrapper.find('h3')).to.have.length(3);
  });
});


