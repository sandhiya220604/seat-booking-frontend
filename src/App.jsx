import { useState, useEffect } from 'react';
import './App.css';

const PREMIUM_ROWS = ['A', 'B'];
const PREMIUM_PRICE = 300;
const REGULAR_PRICE = 150;

function getTier(rowLetter) {
  return PREMIUM_ROWS.includes(rowLetter) ? 'Premium' : 'Regular';
}

function getPrice(rowLetter) {
  return PREMIUM_ROWS.includes(rowLetter) ? PREMIUM_PRICE : REGULAR_PRICE;
}

function App() {
  const [seats, setSeats] = useState([]);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBooking, setIsBooking] = useState(false);

  const fetchSeats = () => {
    fetch('http://localhost:6060/api/seats')
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch seats');
        return response.json();
      })
      .then((data) => setSeats(data))
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    fetchSeats();
  }, []);

  const toggleSeat = (seat) => {
    if (seat.status === 'BOOKED') return;
    setMessage(null);
    setSelectedIds((prev) =>
      prev.includes(seat.id) ? prev.filter((id) => id !== seat.id) : [...prev, seat.id]
    );
  };

  const handleProceed = async () => {
    setIsBooking(true);
    setMessage(null);
    const results = [];

    for (const seatId of selectedIds) {
      try {
        const response = await fetch(`http://localhost:6060/api/seats/${seatId}/book`, {
          method: 'POST',
        });
        const text = await response.text();
        results.push({ seatId, ok: response.ok, text });
      } catch {
        results.push({ seatId, ok: false, text: 'Network error' });
      }
    }

    const failed = results.filter((r) => !r.ok);
    if (failed.length === 0) {
      setMessage({ type: 'success', text: `${results.length} seat(s) booked successfully` });
    } else {
      setMessage({
        type: 'error',
        text: `${failed.length} seat(s) could not be booked (already taken)`,
      });
    }

    setSelectedIds([]);
    setIsBooking(false);
    fetchSeats();
  };

  const seatsByRow = seats.reduce((rows, seat) => {
    const rowLetter = seat.seatNumber.charAt(0);
    if (!rows[rowLetter]) rows[rowLetter] = [];
    rows[rowLetter].push(seat);
    return rows;
  }, {});

  const availableCount = seats.filter((s) => s.status === 'AVAILABLE').length;

  const selectedTotal = selectedIds.reduce((sum, id) => {
    const seat = seats.find((s) => s.id === id);
    if (!seat) return sum;
    return sum + getPrice(seat.seatNumber.charAt(0));
  }, 0);

  return (
    <div className="page">
      <div className="app-card">
        <div className="movie-header">
          <div className="poster">🎬</div>
          <div className="movie-info">
            <h1>Midnight Premiere</h1>
            <p className="movie-meta">Screen 3 · Fri, 7:30 PM</p>
            <p className="subtitle">{availableCount} seats available</p>
          </div>
        </div>

        {error && <p className="banner error-banner">Error: {error}</p>}
        {message && (
          <p className={`banner ${message.type === 'success' ? 'success-banner' : 'error-banner'}`}>
            {message.text}
          </p>
        )}

        <div className="screen-wrap">
          <div className="screen-curve" />
          <p className="screen-label">All eyes this way please</p>
        </div>

        <div className="theater">
          {Object.entries(seatsByRow).map(([rowLetter, rowSeats]) => (
            <div key={rowLetter} className="seat-row">
              <span className="row-label">
                {rowLetter}
                <span className="tier-tag">{getTier(rowLetter) === 'Premium' ? '★' : ''}</span>
              </span>
              <div className="row-seats">
                {rowSeats.map((seat, index) => {
                  const isBooked = seat.status === 'BOOKED';
                  const isSelected = selectedIds.includes(seat.id);
                  const aisleAfter = index === 3;
                  return (
                    <button
                      key={seat.id}
                      className={[
                        'seat',
                        isBooked ? 'seat-booked' : isSelected ? 'seat-selected' : 'seat-available',
                        aisleAfter ? 'aisle-gap' : '',
                      ].join(' ')}
                      onClick={() => toggleSeat(seat)}
                      disabled={isBooked}
                      title={`${seat.seatNumber} — ${seat.status} — ${getTier(rowLetter)} ₹${getPrice(rowLetter)}`}
                    >
                      {seat.seatNumber.slice(1)}
                    </button>
                  );
                })}
              </div>
              <span className="row-label row-label-right">{rowLetter}</span>
            </div>
          ))}
        </div>

        <div className="tier-key">
          <span><strong>★ Premium</strong> ₹{PREMIUM_PRICE}</span>
          <span><strong>Regular</strong> ₹{REGULAR_PRICE}</span>
        </div>

        <div className="legend">
          <div className="legend-item">
            <span className="legend-swatch legend-available" /> Available
          </div>
          <div className="legend-item">
            <span className="legend-swatch legend-selected" /> Selected
          </div>
          <div className="legend-item">
            <span className="legend-swatch legend-booked" /> Booked
          </div>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="booking-bar">
          <div className="booking-bar-info">
            <span className="seat-count">{selectedIds.length} seat{selectedIds.length > 1 ? 's' : ''}</span>
            <span className="total-price">₹{selectedTotal}</span>
          </div>
          <button className="proceed-btn" onClick={handleProceed} disabled={isBooking}>
            {isBooking ? 'Booking...' : 'Proceed to Book'}
          </button>
        </div>
      )}
    </div>
  );
}

export default App;