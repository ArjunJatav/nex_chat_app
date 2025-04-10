import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Image, Keyboard, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { COLORS, loginthemeModule, } from "../../Components/Colors/Colors";
import SlideButtonScreen from "../../Components/SlideButton/SlideButtonScreen";
export const CaptchaModelShow = (props: any) => {
  const { t } = useTranslation();
  const [captchaValue, setCaptchaValue] = useState('');

  const [firstValue, setFirstValue] = useState(0);
  const [secondValue, setSecondValue] = useState(0);

  const [firstColor, setFirstColor] = useState('');
  const [secondColor, setSecondColor] = useState('');
  const [resetSlide, setResetSlide] = useState(false);


  const styles = StyleSheet.create({
    modal: {
      width: "100%",
      marginLeft: 0,
      marginBottom: 0,
    },
    cancel_button: {
      position: "absolute",
      borderRadius: 20,
      padding: 7,
      backgroundColor: "#FCF1FF",
      right: 20,
      top: 20,
    },
    safeAreaContainer: {
        flex: 1,
        width: '100%',
      },
      rootContainer: {
        flex: 1,
        width: '100%',
        backgroundColor: '#fafafa',
        padding: 8,
      },
      cellContainer: {
        flexDirection: 'row',
        backgroundColor: '#EEEDE7',
        elevation: 5,
        marginVertical: 6,
        padding: 6,
        marginHorizontal: 6,
      },
      logoContainer: {
        height: 60,
        width: 60,
        resizeMode: 'contain',
      },
      labelContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 12,
      },
      labelText: {
        fontSize: 16,
        fontWeight: 'bold',
      },
      radioButtonSection: {
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 6,
      },
      radioButtonOuterContainer: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#656565',
        alignItems: 'center',
        justifyContent: 'center',
      },
      radioButtonInnerContainer: {
        height: 12,
        width: 12,
        borderRadius: 6,
      },
      buttonContainer: {
        height: 45,
        width: '95%',
      // marginHorizontal:10,
      borderRadius:8,
      alignSelf:"center",
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor:  loginthemeModule().loginButton,
        elevation: 5,
      },
      buttonLabel: {
        color: '#fff',
        fontWeight: 'bold',
      },
  });

  function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  useEffect(() => {
    refreshButtonClicked();
  }, []);

  const refreshButtonClicked = async () => {
    const randomNum1 = getRandomNumber(50, 100);
    setFirstValue(randomNum1);

    const randomNum2 = getRandomNumber(1, 20);
    setSecondValue(randomNum2);

    const randomColor1 = getRandomColor();
    console.log('first color', randomColor1);
    setFirstColor(randomColor1);

    const randomColor2 = getRandomColor();
    console.log('Second color', randomColor2);
    setSecondColor(randomColor2);
  };
  function getRandomColor() {
    // Generate a random number between 0 and 16777215 (0xFFFFFF in hexadecimal)
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);

    // Ensure the color string is always 6 characters long by padding with zeros if necessary
    return `#${randomColor.padStart(6, '0')}`;
  }


  const onCaptchaSubmit = async () => {
    // if (captchaValue === "" || captchaValue === null) {
    //   Alert.alert("Please enter a value for the CAPTCHA.");
    //   setResetSlide(true);
    //   setTimeout(() => setResetSlide(false), 500);
    //   return;
    // }

    // if (firstValue + secondValue == captchaValue) {
      setCaptchaValue("");
      props.cancel();
      props.captchaVerified();
    // } else {
    //   refreshButtonClicked();
    //   setResetSlide(true);
    //   setCaptchaValue("");
    //   Alert.alert("Invalid captcha. Please try again.");
    //   setTimeout(() => setResetSlide(false), 300);
    // }
  };

  const handleTextChange = useCallback(text => {
    setCaptchaValue(`${text}`);
  }, []);

  return (
    // <Modal
    //       visible={props.visible}
    //       animationType={'none'}
    //       transparent={true}
    //       onRequestClose={() => {}}>
          <View
            style={[
              {
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
            
           
              },
            ]}>
            <View style={{width: 250,borderRadius:8, backgroundColor: COLORS.white, height: 260,shadowColor: '#000'}}>
            
            <Text style={{textAlign:"center",fontSize:14,fontWeight:"400",marginTop:10,marginHorizontal:50}}>Solve the question below to verify you are not a Robot. </Text>
            
              <TouchableOpacity
                style={{
                  width: 40,
                  height: 40,
                  justifyContent: 'center',
                  alignItems: 'center',
                  position:"absolute",
                  right:5,
                  top:5,
                  borderWidth:0.5,
                  borderColor:"lightgray"
                }}
                onPress={() => refreshButtonClicked()}>
                <Image    //refresh
                  source={require("../../Assets/Icons/refresh.png")}
                  style={{
                    height: 20,
                    width: 20,
                  }}
                />
              </TouchableOpacity>

              <View
                style={{
                  marginTop: 20,
                  width: 120,
                  height: 55,
                  borderRadius:8,
                  backgroundColor: loginthemeModule().theme_background,
                  alignSelf: 'center',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text
                  style={{color: firstColor, fontSize: 18, fontWeight: 'bold'}}>
                  {firstValue}
                  <Text
                    style={{color: 'black', fontSize: 20, fontWeight: 'bold'}}>
                    {' '}
                    +{' '}
                  </Text>
                  <Text
                    style={{
                      color: secondColor,
                      fontSize: 18,
                      fontWeight: 'bold',
                    }}>
                    {secondValue}
                  </Text>
                  <Text
                    style={{color: 'black', fontSize: 20, fontWeight: 'bold'}}>
                    {' '}
                    ={' '}
                  </Text>{' '}
                </Text>
              </View>

              <TextInput
             autoFocus={true}
                style={{
                  height: 40,
                  color: '#000',
                 // paddingLeft: 10,
                  backgroundColor: '#E0E0E0',
                  marginTop: 10,
                  borderRadius:5,
                  width: 80,
                  alignSelf: 'center',
                  textAlign: 'center',
                }}
                placeholder="Value"
                keyboardType={'number-pad'}
                defaultValue={captchaValue}
                // value={route.params.Amount}
                onChangeText={value => handleTextChange(value)}
                onSubmitEditing={() => Keyboard.dismiss()}
              />
              {/* <SwipeButton /> */}
<View style={{marginTop:20 }}>
<SlideButtonScreen onToggle={()=> onCaptchaSubmit()} reset={resetSlide} />
</View>
            
              {/* <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles.buttonContainer,
                  { bottom: 5,marginTop:25 },
                ]}
                onPress={() => onCaptchaSubmit()}>
                <Text style={styles.buttonLabel}>Verify</Text>
              </TouchableOpacity> */}
            </View>
          </View>
        // </Modal>
  );
};