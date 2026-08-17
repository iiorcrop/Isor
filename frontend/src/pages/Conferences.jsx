import React from 'react';
import EventCategoryPage from '../components/EventCategoryPage';

const Conferences = () => {
    return (
        <EventCategoryPage 
            categoryType="conference"
            title="Conferences"
            subtitle="National and International scientific conferences organized and hosted by the Indian Society of Oilseeds Research."
        />
    );
};

export default Conferences;
