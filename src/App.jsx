import React, { useState } from 'react';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    try {
      const uri = `https://openlibrary.org/search.json?title=${query}`;
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      const { docs } = data;
      setResults(docs.slice(0, 30)); // Limit to 30 results
    } catch (error) {
      setError(error.message);
    }
  };

  const handleInputChange = (event) => {
    setQuery(event.target.value);
  };

  return (
    <div>
      <div>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search..."
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      {error && <div>{error}</div>}
      <div>
        <table>
          <thead>
            <tr>
              <th>Author(s)</th>
              <th>Title</th>
              <th>Published Year</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index}>
                <td>{result.author_name ? result.author_name.join(', ') : 'N/A'}</td>
                <td>{result.title}</td>
                <td>{result.first_publish_year ? result.first_publish_year[0] : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;