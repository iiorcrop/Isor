import React from 'react';
import EventCategoryPage from '../components/EventCategoryPage';

const UpcomingEvents = () => {
    return (
        <EventCategoryPage 
            categoryType="upcoming events"
            title="Upcoming Events"
            subtitle="Upcoming conferences, seminars, call for papers, and ISOR meetings scheduled across India."
        />
    );
};

export default UpcomingEvents;
