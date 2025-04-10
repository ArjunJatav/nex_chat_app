import { Dimensions, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
container:{
    flex:1,
    backgroundColor:'#fff'
},
image: {
    width:80, // Adjust the width based on the number of columns
    height: 80,
    margin: 5,
    resizeMode:'contain'
  },
   categoryContainer: {
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray',justifyContent:'center',alignItems:"center"
  },
  categoryText: {
    paddingHorizontal: 15,
  },
  templateContainer: {
    flex: 1,justifyContent:'center',alignItems:'center',
  },
  selectedCategory: {
    borderBottomColor: 'green', // Change this color to whatever you like
    borderBottomWidth: 5, // Adjust the width of the border
  },

})    