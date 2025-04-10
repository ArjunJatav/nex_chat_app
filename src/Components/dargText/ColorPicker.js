import React from 'react';
import { View, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

const ColorPicker = ({ selectedColor, onColorChange }) => {
  const colorOptions = [
    '#FF0000', // Red
    '#FFA500', // Orange
    '#FFFF00', // Yellow
    '#008000', // Green
    '#0000FF', // Blue
    '#800080', // Purple
    "#FFC0CB",
    "#000000", // Orange, Pink, Black
    "#FFD700",
    "#00FF7F",
    "#ADFF2F", // Gold, SpringGreen, GreenYellow
    "#FF69B4",
    "#9370DB",
    "#D8BFD8", // HotPink, MediumPurple, Thistle
    "#DDA0DD",
    "#B0E0E6",
    "#00CED1", // Plum, PowderBlue, DarkTurquoise
    "#7FFFD4",
    "#F0FFF0",
    "#F0F8FF", 
  ];

  const renderItem = ({ item }) => (

    <TouchableOpacity
      style={[
        styles.colorOption,
        {zIndex:99999, backgroundColor: item, borderColor: item === selectedColor ? '#fff' : 'transparent' },
      ]}
      onPress={() => onColorChange(item)}
    />
  );

  return (
    <FlatList
    keyboardShouldPersistTaps={true}
    showsHorizontalScrollIndicator={false}
      horizontal
      data={colorOptions}
      renderItem={renderItem}
      keyExtractor={(item) => item}
      contentContainerStyle={styles.colorPicker}
    />
  );
};

const styles = StyleSheet.create({
  colorPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    marginHorizontal: 5,
  },
});

export default ColorPicker;
