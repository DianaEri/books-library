import React, { useState } from 'react';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    try {
      const uri = `https://openlibrary.org/search.json?title=${query}`;
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      const { docs, numFound } = data;
      setTotalResults(numFound);
      setResults(docs.slice(0, 30).map(result => ({
        title: result.title,
        author: result.author_name ? result.author_name[0] : 'N/A',
        publishYear: result.first_publish_year
      }))); // Limit to 30 results and extract necessary fields
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
      {totalResults > 0 && <p>{totalResults} results found.</p>}
      <div>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Published Year</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index}>
                <td>{result.title}</td>
                <td>{result.author}</td>
                <td>{result.publishYear}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
