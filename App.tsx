/**
 * Clinical ink
 * Environmental Data Collection
 *
 * Gather airquality data from current location.
 */

import React from 'react';
import type {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Button,
  Alert,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors
} from 'react-native/Libraries/NewAppScreen';

import Geolocation from '@react-native-community/geolocation';

const GOOGLE_MAPS_KEY = ''

function handleClick () {
  console.log("test")
 }

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({children, title}: SectionProps): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  //TYPES

  type LocationData = {
    coords: {
      accuracy: number;
      altitude: number;
      altitudeAccuracy: number;
      heading: number;
      latitude: number;
      longitude: number;
      speed: number;
    };
    mocked: boolean;
    timestamp: number;
  };
  
  type PostDataLocation = {
    latitude: number,
    longitude: number
  };

  type PostData = {
    universal_aqi: boolean,
    location: PostDataLocation,
    extra_computations: string[]
    language_code: string
  };

  const displayPosition = (position:LocationData) => {
    console.log(position)
    Alert.alert('Location'+ '\nLat: ' + position.coords.latitude +
    '\nLong: ' + position.coords.longitude)
  }
  const getCurrentPosition = () => {
    Geolocation.getCurrentPosition(info => {displayPosition(info as LocationData)});
  };

  const displayData = (position:LocationData) => {
   postData(position.coords.latitude, position.coords.longitude)
  }

  async function postData(lat:number, long:number) {
    const dataLocation: PostDataLocation = {
      latitude: lat,
      longitude: long
    };
    const data: PostData = {
      universal_aqi: true,
      location: dataLocation,
      extra_computations:  [
        "HEALTH_RECOMMENDATIONS",
        "DOMINANT_POLLUTANT_CONCENTRATION",
        "POLLUTANT_CONCENTRATION",
        "LOCAL_AQI",
        "POLLUTANT_ADDITIONAL_INFO"
      ],
      language_code: 'en'
    };
  
    try {
      const response = await fetch('https://airquality.googleapis.com/v1/currentConditions:lookup?key=' + GOOGLE_MAPS_KEY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (response.ok) {
        const jsonResponse = await response.json();
        console.log("Server response:", jsonResponse);
        Alert.alert(
          'Location: ' + lat + ',' + long +
          '\n\nAir Quality Index (AQI): ' + jsonResponse.indexes[0].aqi + 
          '\n' + jsonResponse.indexes[0].category +
          '\n\nat: ' + jsonResponse.dateTime);
      } else {
        console.log("HTTP-Error:", response.status);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const getCurrentData = () => {
    Geolocation.getCurrentPosition(info => {displayData(info as LocationData)});
  };

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>

        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Section title="Air Quality Lookup">
            Get an updated air quality reading at my current location.
          </Section>
          <Button
              title="My Location"
              onPress={getCurrentPosition}
            />
            <Button
              title="Current Data"
              onPress={getCurrentData}
            />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
