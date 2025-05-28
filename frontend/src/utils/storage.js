export const saveBooking = (sessionId, bookingData) => {
    const data = {
      ...bookingData,
      sessionId,
      timestamp: Date.now()
    };
    localStorage.setItem('currentBooking', JSON.stringify(data));
  };
  
  export const loadBooking = (sessionId) => {
    try {
      const data = JSON.parse(localStorage.getItem('currentBooking'));
      
      if (!data || 
          data.sessionId !== sessionId ||
          Date.now() - data.timestamp > 900000
      ) {
        localStorage.removeItem('currentBooking');
        return null;
      }
      
      return data;
    } catch {
      return null;
    }
  };