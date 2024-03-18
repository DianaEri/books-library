import React, { useState } from 'react';

function App() {
  const [query, setQuery] = useState('');
  const [searchBy, setSearchBy] = useState('title');
  const [results, setResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [error, setError] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);

  const handleSearch = async () => {
    try {
      const uri = `https://openlibrary.org/search.json?${searchBy}=${query}`;
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
        publishYear: result.publish_year ? result.publish_year[0] : 'N/A',
        key: result.key
      }))); // Limit to 30 results and extract necessary fields
    } catch (error) {
      setError(error.message);
    }
  };

  const handleInputChange = (event) => {
    setQuery(event.target.value);
  };

  const handleSelectChange = (event) => {
    setSearchBy(event.target.value);
  };

  const handleResultClick = async (key) => {
    try {
      const response = await fetch(`https://openlibrary.org${key}.json`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setSelectedResult({
        title: data.title,
        authors: data.author_name,
        publishers: data.publisher,
        languages: data.language,
        subjects: data.subject
      });
    } catch (error) {
      setError(error.message);
    }
  };

  const handleBackToSearch = () => {
    setSelectedResult(null);
  };

  return (
    <div>
      {!selectedResult && (
        <div>
          <select value={searchBy} onChange={handleSelectChange}>
            <option value="title">Title</option>
            <option value="author">Author</option>
            <option value="subject">Subject</option>
          </select>
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder={`Search by ${searchBy}...`}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
      )}
      {error && <div>{error}</div>}
      {totalResults > 0 && !selectedResult && <p>{totalResults} results found.</p>}
      {!selectedResult && (
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
                <tr key={index} onClick={() => handleResultClick(result.key)}>
                  <td>{result.title}</td>
                  <td>{result.author}</td>
                  <td>{result.publishYear}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {selectedResult && (
        <div>
          <button onClick={handleBackToSearch}>Back to Search Results</button>
          <h2>{selectedResult.title}</h2>
          <p><strong>Author(s):</strong> {selectedResult.authors}</p>
          <p><strong>Publishers:</strong> {selectedResult.publishers}</p>
          <p><strong>Languages:</strong> {selectedResult.languages}</p>
          <p><strong>Subjects:</strong> {selectedResult.subjects}</p>
        </div>
      )}
    </div>
  );
}

export default App;
