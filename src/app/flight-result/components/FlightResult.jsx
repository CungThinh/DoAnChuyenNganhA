// flight-result/components/FlightResult.jsx
import React from 'react';
import FlightCard from './FlightCard';
import FlightFilter from './FlightFilter';

const FlightList = ({ flights }) => {
    return (
        <div className="container mx-auto max-w-[min(100%,1440px)] -mt-2 flex flex-col space-y-4 pb-10 max-sm:px-0 sm:mt-0 sm:space-y-6">
            <div className="relative flex gap-x-6 mt-10">
                <FlightFilter />
                <div className="flex min-h-[80vh] max-w-full grow flex-col space-y-2 md:max-w-[calc(100%_-_282px-24px)]">
                    <div className="infinite-scroll-component relative divide-y md:space-y-1.5 md:divide-y-0">
                        <div className="min-h-[200px] space-y-2 ">
                            {flights.map((flight, index) => (
                                <FlightCard flight={flight} key={index} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlightList;
