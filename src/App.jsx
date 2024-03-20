import React, { useState } from 'react';
import './App.css';
import bookSearch from './assets/bookSearch.png';

// Rotkomponent App
function App() {
  // State hooks för att hantera olika states
  const [query, setQuery] = useState(''); // Sökning som anges av användaren
  const [searchBy, setSearchBy] = useState('title'); // Sökkriterier (titel, författare, ämne)
  const [results, setResults] = useState([]); // Array som lagrar sökresultat
  const [totalResults, setTotalResults] = useState(0); // Totalt antal sökresultat
  const [error, setError] = useState(null); // Felmeddelande vid nätverksfel
  const [selectedResult, setSelectedResult] = useState(null); // Uppgifter om den valda boken
  const [coverImage, setCoverImage] = useState(null); // Webbadress till den valda bokens omslagsbild

  // Funktion för att hantera sökfunktionaliteten
  const handleSearch = async () => {
    try {
      // Sammanställer API endpoint URL baserat på kriteria och fråga
      const uri = `https://openlibrary.org/search.json?${searchBy}=${query}`;
      // Hämtar data från API
      const response = await fetch(uri);
      // Kontrollerar om respons funkar
      if (!response.ok) {
        // Om respons inte funkar, ge ett felmeddelande
        throw new Error('Network response was not ok');
      }
      // Gör om respons datan till JSON format
      const data = await response.json();
      // Hämtar nödvändiga nycklar från respons datan
      const { docs, numFound } = data;
      // Uppdaterar totalResults state med total mängd av resultat
      setTotalResults(numFound);
      // Begränsa till 30 resultat och hämta följande nycklar
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
      })));
    } catch (error) {
      // Om ett fel uppkommer under sökfunktionen, ställ ett error state
      setError(error.message);
    }
  };

  // Funktion som hanterar ändringar i <input> inuti sökrutan
  const handleInputChange = (event) => {
    setQuery(event.target.value); // Uppdaterar query state med det värde som anges i sökfältet
  };

  // Funktion för att hantera ändring av sökkriterier i dropdown (titel, författare, ämne)
  const handleSelectChange = (event) => {
    setSearchBy(event.target.value); // Uppdaterar searchBy state med de valda sökvillkoren
  };

  // Funktion för att hantera klickval på specifikt sökresultat
  const handleResultClick = async (data) => {
    try {
      // Ställ det valda result state med information om det valda resultatet
      setSelectedResult({
        title: data.title,
        authors: data.authors ? data.authors.join(', ') : 'N/A',
        publishers: data.publishers ? data.publishers.join(', ') : 'N/A',
        languages: data.languages ? data.languages.join(', ') : 'N/A',
        subjects: data.subjects ? data.subjects.join(', ') : 'N/A',
        isbn: data.isbn ? data.isbn[0] : null
      });

      // Om det valda resultatet har en ISBN, hämta bokomslagsbilden
      if (data.isbn && data.isbn[0]) {
        const isbn = data.isbn[0];
        const imageResponse = await fetch(`https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`);
        // Om hämtning av bild är framgångsrik, lägg in cover image state
        if (imageResponse.ok) {
          const imageURL = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;
          setCoverImage(imageURL);
        } else {
          // Om hämtning av bild misslyckas, lägg in state till null
          setCoverImage(null);
        }
      }
    } catch (error) {
      // Om ett fel inträffar vid klick hantering, lägg till error state
      setError(error.message);
    }
  };

  // Funktion som hanterar tillbaka visning till sökresultat från bokdetaljvisning
  const handleBackToSearch = () => {
    setSelectedResult(null); // Ta bort det valda resultatet
    setCoverImage(null); // Ta bort bokomslagsbilden
  };

  // JSX struktur för App komponenten
  return (
    <div className='search-container'>
      {/* Conditional rendering baserat på selectedResult state */}
      {!selectedResult && (
        <div>
          {/* Logga */}
          <img src={bookSearch} className="logo react" alt="Search books" />
          {/* Informativ text */}
          <p className="read-the-docs">
            Use the search bar to access the Open Library API.
          </p>
          {/* Dropdown med sökkriterier */}
          <select value={searchBy} onChange={handleSelectChange}>
            <option value="title">Title</option>
            <option value="author">Author</option>
            <option value="subject">Subject</option>
          </select>
          {/* Inmatningsfält för sökruta */}
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder={`Search by ${searchBy}...`}
          />
          {/* Sök knapp */}
          <button onClick={handleSearch}>Search</button>
          </div>
    )}
    {/* Visa felmeddelande om error state inte är null */}
    {error && <div>{error}</div>}
    {/* Visar totalt antal sökresultat om totalResults värde är större än 0 och selectedResult är falsy */}
    {totalResults > 0 && !selectedResult && <p>{totalResults} results found.</p>}
    {/* Visar resultattabell om selectedResult är falsy */}
    {!selectedResult && (
      <div>
        <table id="customers">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Published Year</th>
            </tr>
          </thead>
          <tbody>
            {/* Söker igenom results array och visar varje result i en rad inuti tabellen */}
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
    {/* Visar detaljinformation av valt resultat om selectedResult är truthy */}
    {selectedResult && (
      <div>
        {/* Knapp för att backa tillbaka till sökresultat */}
        <button className='details' onClick={handleBackToSearch}>Back to Search Results</button>
        {/* Visar titel för valt resultat */}
        <h2>{selectedResult.title}</h2>
        {/* Visar bokomslagsbild om coverImage är truthy */}
        {coverImage && <img src={coverImage} alt="Book Cover" />}
        {/* Visar författare */}
        <p><strong>Author(s):</strong> {selectedResult.authors}</p>
        {/* Visar utgivare */}
        <p><strong>Publishers:</strong> {selectedResult.publishers}</p>
        {/* Visar språk */}
        <p><strong>Languages:</strong> {selectedResult.languages}</p>
        {/* Visar ämnen */}
        <p><strong>Subjects:</strong> {selectedResult.subjects}</p>
      </div>
    )}
    {/* Footer */}
    <footer>
      <p>Powered by <a href="https://openlibrary.org">Open Library</a></p>
    </footer>
  </div>
);

}

export default App;
