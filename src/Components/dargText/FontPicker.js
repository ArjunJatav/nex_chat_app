import React from 'react';
import { View, TouchableOpacity, StyleSheet ,Text, FlatList, Platform } from 'react-native';
import { COLORS } from './Colors';

// Define font options based on platform outside of the component
const fontOptionsIOS = [
  'IBMPlexSans-Bold',
  'Dancing Script',
  'Felt Condolences_',
  'SKATEBOARDER',
  'Party Story',
  'Pink Story',
];

const fontOptionsAndroid = [
  "IBMPlexSans-Bold", 
  "Dancing_Script_copy",
  "FeltCondolences-3zV06", 
  "Skateboarder-mL439", 
  "PartyStory-ZVA6z", 
  "PinkStory-3lO6p", 
];

const FontPicker = ({ selectedFont, onFontChange }) => {
  // Select font options based on platform
  const fontOptions = Platform.OS === "ios" ? fontOptionsIOS : fontOptionsAndroid;

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.fontOptions,
        {
          backgroundColor: selectedFont === item ? '#fff' : 'rgba(0,0,0,0.4)',
        },
      ]}
      onPress={() => onFontChange(item)}
    >
      <Text
        style={{
          color: selectedFont === item ? COLORS.green : '#fff',
          fontSize: 20,
          fontFamily: item,
          textAlign: 'center',
        }}
      >
        Aa
      </Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      keyboardShouldPersistTaps={true}
      horizontal
      data={fontOptions}
      renderItem={renderItem}
      keyExtractor={(item) => item}
      contentContainerStyle={styles.colorPicker}
    />
  );
};

const styles = StyleSheet.create({
  colorPicker: {
    paddingHorizontal: 20,
  },
  fontOptions: {
    width: 40,
    height: 40,
    borderRadius: 15,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
});

export default FontPicker;
