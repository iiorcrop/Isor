import React from 'react';
import EventCategoryPage from '../components/EventCategoryPage';

const Seminars = () => {
    return (
        <EventCategoryPage 
            categoryType="seminar"
            title="Seminars"
            subtitle="Academic and scientific seminars, keynote lectures, and research presentations on oilseeds development."
        />
    );
};

export default Seminars;
