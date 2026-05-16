import { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";

import * as Location from "expo-location";

type Place = {
  name: string;
  lat: string;
  lon: string;
};

export default function SupportScreen() {
  const [loading, setLoading] = useState(true);

  const [city, setCity] = useState("");

  const [caps, setCaps] = useState<Place[]>([]);

  const [hospitals, setHospitals] = useState<
    Place[]
  >([]);

  useEffect(() => {
    getLocationAndPlaces();
  }, []);

  const getLocationAndPlaces = async () => {
    try {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permissão negada",
          "É necessário permitir acesso à localização."
        );

        setLoading(false);

        return;
      }

      const location =
        await Location.getCurrentPositionAsync(
          {}
        );

      const { latitude, longitude } =
        location.coords;

      const reverse =
        await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

      if (reverse.length > 0) {
        setCity(
          `${reverse[0].city || ""} - ${
            reverse[0].region || ""
          }`
        );
      }

      await searchPlaces(
        latitude,
        longitude,
        "clinic",
        setCaps
      );

      await searchPlaces(
        latitude,
        longitude,
        "hospital",
        setHospitals
      );
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const searchPlaces = async (
    lat: number,
    lon: number,
    type: string,
    setter: any
  ) => {
    try {
      const radius = 10000;

      const query = `
        [out:json];
        (
          node["amenity"="${type}"](around:${radius},${lat},${lon});
        );
        out;
      `;

      const response = await fetch(
        "https://overpass-api.de/api/interpreter",
        {
          method: "POST",
          body: query,
        }
      );

      const data = await response.json();

      const formatted = data.elements.map(
        (item: any) => ({
          name:
            item.tags?.name ||
            "Local não identificado",
          lat: item.lat.toString(),
          lon: item.lon.toString(),
        })
      );

      setter(formatted);
    } catch (err) {
      console.log(err);
    }
  };

  const openMaps = (
    lat: string,
    lon: string
  ) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;

    Linking.openURL(url);
  };

  const renderPlace = (item: Place) => (
    <TouchableOpacity
      key={`${item.lat}-${item.lon}`}
      style={styles.card}
      onPress={() =>
        openMaps(item.lat, item.lon)
      }
    >
      <Text style={styles.placeName}>
        {item.name}
      </Text>

      <Text style={styles.openText}>
        Abrir no Google Maps
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Buscando apoio próximo...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        Apoio psicológico próximo
      </Text>

      <Text style={styles.city}>
        Sua localização: {city}
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Clínicas e CAPS próximos
        </Text>

        {caps.length > 0 ? (
          caps.map(renderPlace)
        ) : (
          <Text style={styles.emptyText}>
            Nenhuma clínica encontrada.
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Hospitais próximos
        </Text>

        {hospitals.length > 0 ? (
          hospitals.map(renderPlace)
        ) : (
          <Text style={styles.emptyText}>
            Nenhum hospital encontrado.
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Contatos de emergência
        </Text>

        <View style={styles.card}>
          <Text style={styles.placeName}>
            CVV - Centro de Valorização da Vida
          </Text>

          <Text style={styles.phone}>
            Ligue 188
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.placeName}>
            SAMU
          </Text>

          <Text style={styles.phone}>
            Ligue 192
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.placeName}>
            Polícia Militar
          </Text>

          <Text style={styles.phone}>
            Ligue 190
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F6FB",
    padding: 20,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F6FB",
  },

  loadingText: {
    marginTop: 14,
    fontSize: 16,
    color: "#1E293B",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 10,
  },

  city: {
    fontSize: 15,
    color: "#64748B",
    marginBottom: 24,
  },

  section: {
    marginBottom: 28,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 14,
  },

  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#1E3A8A",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },

  placeName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
  },

  openText: {
    marginTop: 8,
    color: "#3B82F6",
    fontWeight: "700",
  },

  phone: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "700",
    color: "#EF4444",
  },

  emptyText: {
    color: "#64748B",
    fontSize: 14,
    marginTop: 4,
  },
});