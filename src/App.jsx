import React, { useState } from 'react';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [searchBy, setSearchBy] = useState('title');
  const [results, setResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [error, setError] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

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
        authors: result.author_name,
        publishers: result.publisher,
        languages: result.language,
        subjects: result.subject,
        publishYear: result.first_publish_year,
        isbn: result.isbn,
        key: result
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

  const handleResultClick = async (data) => {
    try {
      setSelectedResult({
        title: data.title,
        authors: data.authors,
        publishers: data.publishers ? data.publishers.join(', ') : 'N/A',
        languages: data.languages ? data.languages.join(', ') : 'N/A',
        subjects: data.subjects ? data.subjects.join(', ') : 'N/A',
        isbn: data.isbn ? data.isbn[0] : null
      });

      if (data.isbn && data.isbn[0]) {
        const isbn = data.isbn[0];
        const imageResponse = await fetch(`https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`);
        if (imageResponse.ok) {
          const imageURL = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;
          setCoverImage(imageURL);
        } else {
          setCoverImage(null);
        }
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleBackToSearch = () => {
    setSelectedResult(null);
    setCoverImage(null);
  };

  return (
    <div className='search-container'>
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
                <tr key={index} onClick={() => handleResultClick(result)}>
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
          <button className='details' onClick={handleBackToSearch}>Back to Search Results</button>
          <h2>{selectedResult.title}</h2>
          {coverImage && <img src={coverImage} alt="Book Cover" />}
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
