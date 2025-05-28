const updateSessionStatus = function (next) {
    const now = new Date();
  
    if (this.startTime <= now && this.endTime > now) {
      this.status = 'active'; // Сеанс активний
    } else if (this.endTime <= now) {
      this.status = 'completed'; // Сеанс завершений
    } else {
      this.status = 'scheduled'; // Сеанс запланований
    }
  
    next();
  };