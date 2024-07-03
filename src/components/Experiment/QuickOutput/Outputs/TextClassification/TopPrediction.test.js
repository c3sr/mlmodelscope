import React from 'react';
import expect from 'expect';
import {shallow} from 'enzyme';
import TopPrediction from "./TopPrediction";
import Rating from "./Rating";

const TestClassification = {
    "classification": {
        "index": 933,
        "label": "n07697313 cheeseburger"
    },
    "id": "61afb91c7cc38300018b8a74",
    "probability": 0.64689136,
    "type": "CLASSIFICATION"
}

describe('Top Prediction Component', () => {
    describe('Renders', () => {
        let wrapper;

        beforeEach(() => {
            wrapper = shallow(<TopPrediction feature={TestClassification}/>);
        });

        it('with a container div', () => {
            expect(wrapper.at(0).type()).toBe('div');
            expect(wrapper.at(0).prop('className')).toBe('top-prediction');
        });

        it('with a prediction', () => {
            expect(wrapper.childAt(0).type()).toBe('div');
            expect(wrapper.childAt(0).prop('className')).toBe('top-prediction__prediction');
            expect(wrapper.childAt(0).text()).toBe('cheeseburger');
        });

        it('with a probability', () => {
            expect(wrapper.childAt(1).type()).toBe('div');
            expect(wrapper.childAt(1).prop('className')).toBe('top-prediction__probability');
            expect(wrapper.childAt(1).text()).toBe('65%');
        });

        it('with a rating component', () => {
            expect(wrapper.find(Rating).length).toBe(1);
        })
    });
});