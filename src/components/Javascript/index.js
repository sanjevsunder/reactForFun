import React, { Component } from 'react';
import { Grid, Row } from 'react-bootstrap';
import Table from '../Table/index';
import { Button, Loading } from '../Button/index';
import Search from '../Search/index';

import {
    DEFAULT_QUERY,
    DEFAULT_PAGE,
    DEFAULT_HPP,
    PATH_BASE,
    PATH_SEARCH,
    PARAM_SEARCH,
    PARAM_PAGE,
    PARAM_HPP
} from '../../contants/index'

const url = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${DEFAULT_QUERY}&${PARAM_PAGE}&${PARAM_HPP}${DEFAULT_HPP}`;
console.log(url);


// filter the results by search
// higher order function
// is a function that returns another function
/*
 function isSearched(searchTerm) {
 return function(item) {
 return !searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase());
 }
 }
 */

// higher order component
const withLoading = (Component) => ( isLoading, ...rest) =>
    isLoading ? <Loading /> : <Component {...rest} />

// higher order component
const updateTopStories = (hits, page) => prevState => {
    const { results, searchKey } = prevState;
    const oldHits = results && results[searchKey] ? results[searchKey] : [];
    const updatedHits = [...oldHits, ...hits];

    return { results: { ...results, [searchKey]: { hits: updatedHits, page } },
        isLoading:false
    }
}



class Javascript extends Component {

    // setting up
    constructor(props) {
        // super props sets this.props to the constructor
        super(props);

        // setting up state
        this.state = {
            results: null,
            searchKey: '',
            searchTerm: 'javascript',
            isLoading: false,
        }

        // bind functions to this (app component)
        this.removeItem = this.removeItem.bind(this);
        this.searchValue = this.searchValue.bind(this);
        this.fetchTopStories = this.fetchTopStories.bind(this);
        this.setTopStories = this.setTopStories.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.checkTopStoriesSearchTerm = this.checkTopStoriesSearchTerm.bind(this);
    }


    // check top stories search term
    checkTopStoriesSearchTerm(searchTerm) {
        return !this.state.results[searchTerm];
    }

    // set top stories
    setTopStories(result) {
        // get the hits and page from results
        const { hits, page } = result;

        this.setState(updateTopStories(hits, page))
    }

    // fetch top stories
    fetchTopStories(searchTerm, page) {

        this.setState({ isLoading: true });

        fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}
        &${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
            .then(response => response.json())
            .then(result => this.setTopStories(result))
            .catch(e => e);

    }

    // One of the component life cycle methods
    // Component did mount
    // This function runs once the component is mounted but before render is executed
    componentDidMount() {
        const { searchTerm } = this.state;
        this.setState({ searchKey: searchTerm });
        this.fetchTopStories(searchTerm, DEFAULT_PAGE);
    }

    // on search submit function
    onSubmit(event) {
        const { searchTerm } = this.state;
        this.setState({ searchKey: searchTerm });

        if(this.checkTopStoriesSearchTerm(searchTerm)) {
            this.fetchTopStories(this.state.searchTerm, DEFAULT_PAGE);
        }

        // to stop default onSubmmit behavior; browser reload
        event.preventDefault();
    }



    removeItem(id) {
        const { results, searchKey } = this.state;
        const { hits, page } = results[searchKey];

        const updatedList = hits.filter(item => item.objectID !== id);

        // spread operator examples
        this.setState({ results: {...results, [searchKey]: {hits: updatedList, page}} });


    }

    // get input field from search form
    searchValue(event) {
        this.setState({ searchTerm: event.target.value });
    }

    render() {

        const { results, searchTerm, searchKey,
            isLoading} = this.state;

        //if(!result) { return null }

        // Return page number else default to 0
        const page = (results && results[searchKey] && results[searchKey].page) || 0;

        const list = (results && results[searchKey] && results[searchKey].hits) || [];

        console.log(this);

        return (
            <div>

                <Grid>
                    <Row>
                        <Table
                            list={ list }
                            removeItem={ this.removeItem }
                        />
                        <div className="text-center alert">
                            <ButtonWithLoading
                                isLoading={ isLoading }
                                className="btn btn-success"
                                onClick={ () => this.fetchTopStories(searchTerm, page + 1) }>
                                Load More
                            </ButtonWithLoading>
                        </div>
                    </Row>
                </Grid>
            </div>
        );
    }
}

const ButtonWithLoading = withLoading(Button);

export default Javascript;
