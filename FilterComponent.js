import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FilterComponent = () => {
    const [filters, setFilters] = useState({
        dateRange: {
            start: '',
            end: ''
        },
        keyword: ''
    });
    const [data, setData] = useState([]);

    const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000/data';

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'start' || name === 'end') {
            setFilters((prevState) => ({
                ...prevState,
                dateRange: {
                    ...prevState.dateRange,
                    [name]: value
                }
            }));
        } else {
            setFilters((prevState) => ({
                ...prevState,
                [name]: value
            }));
        }
    };

    const fetchData = async () => {
        try {
            const response = await axios.get(`${API_ENDPOINT}`, {
                params: {
                    start: filters.dateRange.start,
                    end: filters.dateRange.end,
                    keyword: filters.keyword
                }
            });
            setData(response.data);
        } catch (error) {
            console.error("Error fetching data: ", error);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchData();
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="start">Start Date</label>
                    <input type="date" id="start" name="start" value={filters.dateRange.start} onChange={handleInputChange} />
                </div>
                <div>
                    <label htmlFor="end">End Date</label>
                    <input type="date" id="end" name="end" value={filters.dateRange.end} onChange={handleInputChange} />
                </div>
                <div>
                    <label htmlFor="keyword">Keyword</label>
                    <input type="text" id="keyword" name="keyword" value={filters.keyword} onChange={handleInputChange} />
                </div>
                <button type="submit">Apply Filters</button>
            </form>
            <div>
                <h2>Data</h2>
                <ul>
                    {data.map((item, index) => (
                        <li key={index}>
                            {item.description} - {item.date}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default FilterComponent;