import { useState, useEffect } from 'react';
import PopUpTable from './user-item'; // Adjust the path based on your file structure
import axios from 'axios';

const Cobain = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [mapData, setMapData] = useState<any>({ data: [] }); // Initialize mapData with an empty array for data
  const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00:00`);

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(today.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;

  // Fetch the jadwal view data
  useEffect(() => {
    getJadwalView(formattedDate, formattedDate);
  }, []);

  // Open and close the popup
  const openPopup = () => {
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  // Get the jadwal view data from API
  const getJadwalView = async (tglAwal: string, tglAkhir: string) => {
    const url = `${import.meta.env.VITE_API_LINK}/ppic/jadwalProduksiView`;
    try {
      const response = await axios.get(url, {
        params: {
          start_date: tglAwal,
          end_date: tglAkhir,
        },
        withCredentials: true,
      });
      console.log('jadwal view', response.data.data[0]);
      setMapData(response.data.data[0] || { data: [] }); // Ensure we set mapData with default { data: []} in case it's null or undefined
    } catch (error) {
      console.error('Error fetching data:', error);
      setMapData({ data: [] }); // Fallback to empty data on error
    }
  };

  return (
    <div>
      {/* Button to open the pop-up */}
      <button onClick={openPopup}>Open Pop-Up</button>

      {/* Conditionally render the PopUpTable */}
      {isPopupOpen && (
        <PopUpTable dataMap={mapData}
        />
      )}
    </div>
  );
};

export default Cobain;
