import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DataFilteringComponent = () => {
    const [filterCriteria, setFilterCriteria] = useState({
        dateRange: {
            startDate: '',
            endDate: ''
        },
        keyword: ''
    });
    const [filteredData, setFilteredData] = useState([]);

    const API_ENDPOINT = process.env.REACT_APP_DATA_API_ENDPOINT || 'http://localhost:8000/data';

    const handleCriteriaChange = (e) => {
        const { name, value } = e.target;

        setFilterCriteria(currentCriteria => {
            const updatedCriteria = { ...currentCriteria };

            if (name === 'startDate' || name === 'endDate') {
                updatedCriteria.dateRange[name] = value;
            } else {
                updatedCriteria[name] = value;
            }

            return updatedCriteria;
        });
    };

    const fetchDataBasedOnFilters = async () => {
        try {
            const { startDate, endDate } = filterCriteria.dateRange;
            const response = await axios.get(API_ENDPOINT, {
                params: {
                    start: startDate,
                    end: endDate,
                    keyword: filterCriteria.keyword
                }
            });

            setFilteredData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleFilterApplication = (e) => {
        e.preventDefault();
        fetchDataBasedOnFilters();
    };

    useEffect(() => {
        fetchDataBasedOnFilters();
    }, []);

    return (
        <div>
            <form onSubmit={handleFilterApplication}>
                <div>
                    <label htmlFor="startDate">Start Date</label>
                    <input 
                        type="date" 
                        id="startDate" 
                        name="startDate" 
                        value={filterCriteria.dateRange.startDate} 
                        onChange={handleCriteriaChange} 
                    />
                </div>
                <div>
                    <label htmlFor="endDate">End Date</label>
                    <input 
                        type="date" 
                        id="endDate" 
                        name="endDate" 
                        value={filterCriteria.dateRange.endDate} 
                        onChange={handleCriteriaChange} 
                    />
                </div>
                <div>
                    <label htmlFor="keyword">Keyword</label>
                    <input 
                        type="text" 
                        id="keyword" 
                        name="keyword" 
                        value={filterCriteria.keyword} 
                        onChange={handleCriteriaChange} 
                    />
                </div>
                <button type="submit">Apply Filters</button>
            </form>
            <div>
                <h2>Filtered Data</h2>
                <ul>
                    {filteredData.map((item, index) => (
                        <li key={index}>
                            {item.description} - {item.date}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default DataFilteringComponent;