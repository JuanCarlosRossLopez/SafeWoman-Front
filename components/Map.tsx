import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoiam9tYXJ1MDMiLCJhIjoiY21iM3lob3R0MHp2YzJyb2xpZGFrMnF6YyJ9.6v932iS1D9k2eh6D0EzYNw';

const Map = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [policeStations, setPoliceStations] = useState<
    Array<{ latitude: number; longitude: number; name: string }>
  >([]);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permiso de ubicación denegado');
          Alert.alert('Error', 'Permiso de ubicación denegado');
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);

        // Consultar Mapbox Places API para estaciones de policía
        const response = await axios.get(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/police.json`,
          {
            params: {
              proximity: `${currentLocation.coords.longitude},${currentLocation.coords.latitude}`,
              access_token: MAPBOX_TOKEN,
              limit: 5,
            },
          }
        );

        if (response.data && response.data.features) {
          const stations = response.data.features.map((feature: any) => ({
            latitude: feature.geometry.coordinates[1],
            longitude: feature.geometry.coordinates[0],
            name: feature.text,
          }));

          setPoliceStations(stations);
        } else {
          setPoliceStations([]);
        }
      } catch (error) {
        setErrorMsg('Error obteniendo datos de estaciones');
        Alert.alert('Error', 'No se pudo obtener las estaciones de policía');
      }
    })();
  }, []);

  if (!location) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
      showsUserLocation
    >
      {policeStations.map((station, index) => (
        <Marker
          key={index}
          coordinate={{ latitude: station.latitude, longitude: station.longitude }}
          title={station.name}
        />
      ))}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Map;
