import React from 'react';
import expect from 'expect';
import {shallow} from 'enzyme';
import Prediction from "./Prediction";
import TestFeatures from "./Features";
import formatProbability from "./ProbabilityFormatter";

describe('Prediction component', () => {
  describe('Renders', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallow(<Prediction feature={TestFeatures[0]} />);
    });

    it('with a container div', () => {
      expect(wrapper.at(0).prop('className')).toBe('prediction');
    });

    it('with a prediction label', () => {
      const label = wrapper.childAt(0);

      expect(label.prop('className')).toBe('prediction__label');
      expect(label.text()).toBe('cheeseburger');
    });

    it('with a prediction probability', () => {
      const label = wrapper.childAt(1);

      expect(label.prop('className')).toBe('prediction__probability');
      expect(label.text()).toBe(formatProbability(TestFeatures[0].probability));
    });
  });
});