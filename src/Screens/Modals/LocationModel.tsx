import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Modal,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Geolocation from "@react-native-community/geolocation";
import React, { useEffect, useState } from "react";
import { COLORS, iconTheme, searchBar } from "../../Components/Colors/Colors";
import { font } from "../../Components/Fonts/Font";


 // eslint-disable-next-line
export const LocationModel = (props: any) => {
  const [currentLongitude, setCurrentLongitude] = useState("...");
  const [currentLatitude, setCurrentLatitude] = useState("...");
  const zoomLevel =  18;

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === "ios") {
        getOneTimeLocation();
        subscribeLocationLocation();
      } else {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
             // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
            {
              title: "Location Access Required",
              message: "This App needs to Access your location",
            }
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            //To Check, If Permission is granted
            getOneTimeLocation();
            subscribeLocationLocation();
          } 
        } catch (err) {
          console.warn(err);
        }
      }
    };
    requestLocationPermission();
    return () => {
       // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      Geolocation.clearWatch(watchID);
    };
  }, []);

  const getOneTimeLocation = () => {
    Geolocation.getCurrentPosition(
      //Will give you the current location
      (position) => {

        //getting the Longitude from the location json
        const currentLongitude = JSON.stringify(position.coords.longitude);

        //getting the Latitude from the location json
        const currentLatitude = JSON.stringify(position.coords.latitude);

        //Setting Longitude state
        setCurrentLongitude(currentLongitude);

        //Setting Longitude state
        setCurrentLatitude(currentLatitude);
      },
      () => {
        null;
      },
      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 1000,
      }
    );
  };


 

  const subscribeLocationLocation = () => {
     // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    watchID = Geolocation.watchPosition(
      (position) => {
        //Will give you the location on location change


        //getting the Longitude from the location json
        const currentLongitude = JSON.stringify(position.coords.longitude);

        //getting the Latitude from the location json
        const currentLatitude = JSON.stringify(position.coords.latitude);

        //Setting Longitude state
        setCurrentLongitude(currentLongitude);

        //Setting Latitude state
        setCurrentLatitude(currentLatitude);
      },
      () => {
        null;
      },
      {
        enableHighAccuracy: false,
        maximumAge: 1000,
      }
    );
  };

  const styles = StyleSheet.create({
    modal_view: {
      width: "100%",
      bottom: 0,
      left: 0,
      right: 0,
      position: "absolute",
      backgroundColor: "#fff",
      borderTopEndRadius: 15,
      borderTopStartRadius: 15,
      elevation: 6,
      shadowColor: COLORS.black,
      shadowOpacity: 5,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowRadius: 3.5,
    },
    buttonText: {
      fontSize: 20,
      color: COLORS.white,
      fontFamily: font.bold(),
    },
    button: {
      height: 50,
      marginTop: 10,
      width: "100%",
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: iconTheme().textColorForNew,
    },
    nameText: {
      fontSize: 18,
      color: COLORS.black,
      fontWeight: "600",
      fontFamily: font.regular(),
    },
    modal: {
      width: "100%",
      marginLeft: 0,
      marginBottom: 0,
    },

    upload_button: {
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 10,
      borderRadius: 10,
      width: "47%",
      height: 100,
      backgroundColor: "#FCF1FF",
    },
    cancel_button: {
      position: "absolute",
      borderRadius: 20,
      padding: 7,
      backgroundColor: searchBar().back_ground,
      right: 20,
      top: 20,
    },
  });

  const apiKey = "AIzaSyCWQ0n4Mf6SClp4G1cD5ng9w-4RZ3pXsaw";
  return (
    <Modal
      style={styles.modal}
      animationType="fade"
      visible={props.visible}
      transparent={true}
      onRequestClose={() => {
        props.onRequestClose;
      }}
    >
      <View
        style={{ flex: 1, backgroundColor: "rgba(52, 52, 52, 0.1)" }}
      ></View>
      <View style={[styles.modal_view, { height: 500 }]}>
        {currentLongitude != "..." ? (
          <ImageBackground
            source={{
              uri: `https://maps.google.com/maps/api/staticmap?center=${currentLatitude},${currentLongitude}&zoom=${zoomLevel}&size=640x480&scale=2&maptype=normal&key=${apiKey}&markers=icon:https://cdn.pixabay.com/photo/2014/04/03/10/03/google-309740__480.png|${currentLatitude},${currentLongitude}`,
            }} // Update the path or use a URL
            style={{
              position: "relative",
              height: 380,
              width: "100%",
              // bottom: 0,
            }}
          ></ImageBackground>
        ) : (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color={iconTheme().iconColor} />
            <Text
              style={{
                marginTop: 10,
                fontSize: 16,
                color: iconTheme().iconColor,
              }}
            >
              Fetching location...
            </Text>
          </View>
        )}

        <TouchableOpacity style={[styles.cancel_button]} onPress={props.cancel}>
          <Image
            source={require("../../Assets/Icons/Cross.png")}
            style={{
              height: 15,
              width: 15,
              tintColor: iconTheme().iconColor,
              //
            }}
          />
        </TouchableOpacity>
        <View
          style={{
            //  marginVertical: 30,
            flexDirection: "column",
            paddingHorizontal: 30,
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              if (currentLongitude != "...") {
                props.sendcurrentLongitude({
                  lat: currentLatitude,
                  long: currentLongitude,
                });
              }
            }}
          >
            <Text style={styles.buttonText}>
              {"Send your current location"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
