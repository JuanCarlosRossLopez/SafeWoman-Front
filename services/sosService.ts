import axios from 'axios';

const API_URL = 'http://192.168.100.205:5000/api/sos';

export const sosService = {
  async sendLocation(uid: string, latitude: number, longitude: number) {
    try {
      const response = await axios.post(`${API_URL}/send-location`, {
  uid,
  latitude,
  longitude,
});

      return response.data;
    } catch (error) {
      console.error('❌ Error al enviar ubicación:', error);
      throw error;
    }
  }
};
