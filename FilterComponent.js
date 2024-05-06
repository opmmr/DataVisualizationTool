import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DataFilterComponent = () => {
    const [filters, setFilters] = useState({
        dateRange: {
            startDate: '',
            endDate: ''
        },
        keyword: ''
    });
    const [fetchedData, setFetchedData] = useState([]);

    const DATA_API_ENDPOINT = process.env.REACT_APP_DATA_API_ENDPOINT || 'http://localhost:8000/data';

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        
        setFilters((currentFilters) => {
            const updatedFilters = { ...currentFilters };

            if (name === 'startDate' || name === 'endDate') {
                updatedFilters.dateRange[name] = value;
            } else {
                updatedFilters[name] = value;
            }
            
            return updatedFilters;
        });
    };

    const retrieveData = async () => {
        try {
            const { startDate, endDate } = filters.dateRange;
            const response = await axios.get(DATA_API_ENDPOINT, {
                params: {
                    start: startDate,
                    end: endDate,
                    keyword: filters.keyword
                }
            });
            setFetchedData(response.data);
        } catch (error) {
            console.error("Error fetching data: ", error);
        }
    };

    const onFiltersSubmit = (event) => {
        event.preventDefault();
        retrieveData();
    };

    useEffect(() => {
        retrieveData();
    }, []);

    return (
        <div>
            <form onSubmit={onFiltersSubmit}>
                <div>
                    <label htmlFor="startDate">Start Date</label>
                    <input 
                        type="date" 
                        id="startDate" 
                        name="startDate" 
                        value={filters.dateRange.startDate} 
                        onChange={handleFilterChange} 
                    />
                </div>
                <div>
                    <label htmlFor="endDate">End Date</label>
                    <input 
                        type="date" 
                        id="endDate" 
                        name="endDate" 
                        value={filters.dateRange.endDate} 
                        onChange={handleFilterChange} 
                    />
                </div>
                <div>
                    <label htmlFor="keyword">Keyword</label>
                    <input 
                        type="text" 
                        id="keyword" 
                        name="keyword" 
                        value={filters.keyword} 
                        onChange={handleFilterChange} 
                    />
                </div>
                <button type="submit">Apply Filters</button>
            </form>
            <div>
                <h2>Filtered Data</h2>
                <ul>
                    {fetchedData.map((dataItem, index) => (
                        <li key={index}>
                            {dataItem.description} - {dataItem.date}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default DataFilterComponent;