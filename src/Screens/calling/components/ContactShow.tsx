import { Platform } from "react-native"

// eslint-disable-next-line
export default function ToShowContactName(item : any) {
   
    if (Platform.OS == "android") {
      if (item.displayName == "") {
        if (item.middleName == "") {
          return item.givenName + " " + item.familyName
        } else {
          return item.givenName + " " + item.middleName + " " + item.familyName
        }
      }else{
        return item.displayName
      }
    
    } else {
     
      if (item.givenName == "" && item.familyName == "") {
        return item.company
      }else{
        if (item.middleName == "") {
          return item.givenName + " " + item.familyName
        } else {
          return item.givenName + " " + item.middleName + " " + item.familyName
        }
        
      }
    }
  }