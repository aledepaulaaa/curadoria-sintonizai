'use client';

import React from 'react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';
import { Search, MapPin } from 'lucide-react';

type Library = "places" | "drawing" | "geometry" | "visualization";
const libraries: Library[] = ["places"];

const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '12px',
  marginTop: '10px'
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
    { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] },
    { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#757575" }] },
    { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#181818" }] },
    { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#2c2c2c" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }
  ]
};

interface LocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
}

export default function LocationPicker({ initialLat, initialLng, onLocationSelect }: LocationPickerProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_CURADORIA || '',
    libraries: libraries
  });

  const [map, setMap] = React.useState<google.maps.Map | null>(null);
  const [autocomplete, setAutocomplete] = React.useState<google.maps.places.Autocomplete | null>(null);
  const [position, setPosition] = React.useState({
    lat: initialLat || -23.5505,
    lng: initialLng || -46.6333
  });

  const onLoad = React.useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback() {
    setMap(null);
  }, []);

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const newPos = { lat, lng };
        setPosition(newPos);
        onLocationSelect(lat, lng, place.formatted_address);
        map?.panTo(newPos);
        map?.setZoom(16);
      }
    }
  };

  const onMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setPosition({ lat, lng });
      onLocationSelect(lat, lng);
    }
  };

  if (!isLoaded) return <div className="h-[300px] w-full bg-zinc-900 animate-pulse rounded-xl flex items-center justify-center text-zinc-500">Carregando mapa...</div>;

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="relative">
        <Autocomplete
          onLoad={(autocomplete) => setAutocomplete(autocomplete)}
          onPlaceChanged={onPlaceChanged}
          options={{
            componentRestrictions: { country: "br" },
            fields: ["address_components", "geometry", "formatted_address"],
          }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Pesquisar local ou endereço..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            />
          </div>
        </Autocomplete>
      </div>

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={position}
        zoom={14}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        <Marker
          position={position}
          draggable={true}
          onDragEnd={onMarkerDragEnd}
          animation={google.maps.Animation.DROP}
        />
      </GoogleMap>
      
      <div className="flex items-center gap-2 text-[10px] text-zinc-500 bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/50">
        <MapPin className="w-3 h-3 text-purple-500" />
        <span>Dica: Você pode arrastar o marcador roxo para ajustar a posição exata.</span>
      </div>
    </div>
  );
}
