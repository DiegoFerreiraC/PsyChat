import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Linking, ScrollView, ActivityIndicator, Alert } from "react-native";
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
  const [hospitals, setHospitals] = useState<Place[]>([]);

  useEffect(() => {
    getLocationAndPlaces();
  }, []);

  const getLocationAndPlaces =
    async () => {
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
      className="bg-white p-4 rounded-2xl mb-3"
      style={{
        shadowColor: "#1E3A8A",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
      }}
      onPress={() =>
        openMaps(item.lat, item.lon)
      }
    >
      <Text className="text-[15px] font-semibold text-[#1E293B]">
        {item.name}
      </Text>

      <Text className="mt-2 text-[#3B82F6] font-bold">
        Abrir no Google Maps
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F1F6FB]">
        <ActivityIndicator size="large" />

        <Text className="mt-[14px] text-[16px] text-[#1E293B]">
          Buscando apoio próximo...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#F1F6FB] px-5">
      <Text className="text-[28px] font-bold text-[#1E293B] mb-[10px]">
        Apoio psicológico próximo
      </Text>

      <Text className="text-[15px] text-[#64748B] mb-6">
        Sua localização: {city}
      </Text>

      <View className="mb-7">
        <Text className="text-[20px] font-bold text-[#1E293B] mb-[14px]">
          Clínicas e CAPS próximos
        </Text>

        {caps.length > 0 ? (
          caps.map(renderPlace)
        ) : (
          <Text className="text-[#64748B] text-[14px] mt-1">
            Nenhuma clínica encontrada.
          </Text>
        )}
      </View>

      <View className="mb-7">
        <Text className="text-[20px] font-bold text-[#1E293B] mb-[14px]">
          Hospitais próximos
        </Text>

        {hospitals.length > 0 ? (
          hospitals.map(renderPlace)
        ) : (
          <Text className="text-[#64748B] text-[14px] mt-1">
            Nenhum hospital encontrado.
          </Text>
        )}
      </View>

      <View className="mb-7">
        <Text className="text-[20px] font-bold text-[#1E293B] mb-[14px]">
          Contatos de emergência
        </Text>

        <View
          className="bg-white p-4 rounded-2xl mb-3"
          style={{
            shadowColor: "#1E3A8A",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.08,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Text className="text-[15px] font-semibold text-[#1E293B]">
            CVV - Centro de Valorização da Vida
          </Text>

          <Text className="mt-2 text-[18px] font-bold text-[#EF4444]">
            Ligue 188
          </Text>
        </View>

        <View
          className="bg-white p-4 rounded-2xl mb-3"
          style={{
            shadowColor: "#1E3A8A",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.08,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Text className="text-[15px] font-semibold text-[#1E293B]">
            SAMU
          </Text>

          <Text className="mt-2 text-[18px] font-bold text-[#EF4444]">
            Ligue 192
          </Text>
        </View>

        <View
          className="bg-white p-4 rounded-2xl mb-3"
          style={{
            shadowColor: "#1E3A8A",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.08,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Text className="text-[15px] font-semibold text-[#1E293B]">
            Polícia Militar
          </Text>

          <Text className="mt-2 text-[18px] font-bold text-[#EF4444]">
            Ligue 190
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}