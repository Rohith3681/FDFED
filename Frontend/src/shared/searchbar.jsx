import React, { useRef } from 'react';
import './search-bar.css';
import { Form, FormGroup, Col } from 'reactstrap';

export const Searchbar = () => {
    const locationRef = useRef(null);
    const dateRef = useRef(null);
    const maxPeopleRef = useRef(null);

    const searchHandler = () => {
        const location = locationRef.current.value;
        const date = dateRef.current.value;
        const maxPeople = maxPeopleRef.current.value;
        if (location === '' || date === '' || maxPeople === '') {
            return alert('All fields are required!');
        }
        // Navigate to search results with location as a parameter
        window.location.href = `/search-results/${location}`;
    };

    return (
        <Col lg="12">
            <div className="search_bar">
                <Form className="d-flex align-items-center gap-4">
                    <FormGroup className="d-flex gap-3 form_group form_group-fast">
                        <span>
                            <i className="ri-map-pin-line"></i>
                        </span>
                        <div>
                            <h6>Location</h6>
                            <input 
                                type="text" 
                                placeholder="Where are you going?" 
                                ref={locationRef} 
                            />
                        </div>
                    </FormGroup>
                    <FormGroup className="d-flex gap-3 form_group form_group-fast">
                        <span>
                            <i className="ri-calendar-line"></i>
                        </span>
                        <div>
                            <h6>Date</h6>
                            <input 
                                type="date" 
                                placeholder="Date" 
                                ref={dateRef} 
                            />
                        </div>
                    </FormGroup>
                    <FormGroup className="d-flex gap-3 form_group form_group-fast">
                        <span>
                            <i className="ri-group-line"></i>
                        </span>
                        <div>
                            <h6>Max People</h6>
                            <input 
                                type="number" 
                                placeholder="0" 
                                ref={maxPeopleRef} 
                            />
                        </div>
                    </FormGroup>
                    <span className="search_icon" onClick={searchHandler}>
                        <i className="ri-search-line"></i>
                    </span>
                </Form>
            </div>
        </Col>
    );
};
