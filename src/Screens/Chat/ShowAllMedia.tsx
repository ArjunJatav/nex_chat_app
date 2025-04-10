import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  Modal,
  ActivityIndicator,
  Text,
  Platform,
  Pressable,
} from "react-native";
import RNFS from "react-native-fs";
import { TouchableOpacity } from "react-native";
import FileViewer from "react-native-file-viewer";
import Video from "react-native-video";
import moment from "moment";
import { LoaderModel } from "../Modals/LoaderModel";
import { Image } from "react-native";
import PagerView from "react-native-pager-view";

import ImageViewer from "react-native-image-zoom-viewer";
import { colors } from "../../utils/constants/colors";
import { COLORS, iconTheme } from "../../Components/Colors/Colors";
import { blurImage, blurVideo } from "../../Constant/Key";
import AudioMessage from "./AudioMessage";

 // eslint-disable-next-line
export default function ShowAllMedia({ navigation, route }: any) {
  const [loaderMoedl, setloaderMoedl] = useState(false);
  const [activeTab, setActiveTab] = useState(route.params.FromTab);
  const isPlaying = false;
  const [isLoading, setIsLoading] = useState(true);
  // Inside your functional component
  const [imageUrls, setImageUrls] = useState([]);
  const [filesUrls, setFilesUrls] = useState([]);
  const [myimages, setmyimages] = useState(false);
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  const [mylocaldata, setmylocaldata] = useState({});

  const checkUrl = async (url, type) => {
    const mediaName = url.split("/").pop();
    const mediaId = mediaName.split(".").slice(0, -1).join(".");

    const filename = type == "image" ? `${mediaId}.jpg` : `${mediaId}.mp4`;
    const encoded = encodeURIComponent(filename);

    let subDirectory = "";
    switch (type) {
      case "image":
        subDirectory = "Images";
        break;
      case "video":
        subDirectory = "Videos";
        break;
      case "document":
        subDirectory = "Documents";
        break;
      default:
        subDirectory = "Others";
        break;
    }

    let destinationPath = "";
    if (Platform.OS === "android") {
      destinationPath = `file://${RNFS.DocumentDirectoryPath}/TokeeMedia/${subDirectory}/${encoded}`;
    } else {
      destinationPath = `${RNFS.DocumentDirectoryPath}/TokeeMedia/${subDirectory}/${encoded}`;
    }

    const fileExists = await RNFS.exists(destinationPath);

    return fileExists ? destinationPath : false;
  };

  const processObjects = async (objects) => {
    const processedObjects = await Promise.all(
      objects.map(async (obj) => {
        const newUrl = await checkUrl(obj.url, obj.type);
        return {
          ...obj,
          url: newUrl ? newUrl : obj.type == "image" ? blurImage : blurVideo,
        };
      })
    );
    return processedObjects;
  };

  // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
  useEffect(async () => {
    const routeData = route.params.MediaType; 
    const combinedData = [];

    if (routeData != null && routeData != undefined) {
      const sortedData = routeData.sort(
         // eslint-disable-next-line
        (a: any, b: any) => b.createdAt - a.createdAt
      );
       // eslint-disable-next-line
      sortedData.forEach((item: any) => {
        // Combine item.attachment and item.localpath into a single array
        const combinedAttachments = [];
        if (item.attachment && Array.isArray(item.attachment)) {
           // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          combinedAttachments.push(...item.attachment);
        }
        if (item.localpath && Array.isArray(item.localpath)) {
           // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          combinedAttachments.push(...item.localpath);
        }
        // Process the combined array
        combinedAttachments.forEach((url) => {
          const type = item.message_type;
          if (type === "video" || type === "image") {
             // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
            combinedData.push({
              url,
              createdAt: item.createdAt,
              type,
              serverUrl: url,
            });
          }
        });
      });
       // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      combinedData.sort((a, b) => b.createdAt - a.createdAt);
      const processedObjects = await processObjects(combinedData);
       // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      setImageUrls(processedObjects);
    }
  }, []);

  useEffect(() => {
    const routeData = route.params.FileType; 
    const filteredData = routeData.map((item) => {
      const newItem = {
        attachment: item.attachment,
        message_type: item.message_type,
      };

      if (item.localPath.length > 0) {
         // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        newItem.localPath = item.localPath;
      }

      return newItem;
    });
    setFilesUrls(filteredData);
  }, []);

  // Swipe gesture handlers

  const styles = StyleSheet.create({
    activeTab: {
      borderBottomWidth: 2,
      borderBottomColor: iconTheme().iconColorNew,
    },
    tabButtons: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
      top: 100,
      width: "100%",
      paddingHorizontal: 10,
      zIndex: 999,
    },
    tabButton: {
      justifyContent: "center",
      alignItems: "center",
      height: 40,
      width: "32%",
      borderBottomWidth: 2,
      borderBottomColor: colors.white,
    },
    tabContent: {
      flex: 1,
      marginTop: 125,
      alignItems: "center",
    },
    flatListContainer: {
      paddingHorizontal: 20,
      marginTop: 20,
    },
    item: {
      justifyContent: "center",
      alignItems: "center",
      flex: 1,
      margin: 5,
    },
    emptyList: {
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
  });

   // eslint-disable-next-line
  const photoAndVideoView = ({ item }: any) => (
    <View style={{ width: "30%", height: 120, margin: 5, alignSelf: "center" }}>
      {item.type === "video" ? (
        <Pressable
          style={{ flexDirection: "column", flex: 1 }}
          onPress={() => {
            if (item.url !== blurVideo) {
              navigation.navigate("VideoPlayScreen", { videoUrl: item.url });
            }
          }}
        >
          <Image
            source={
              item.url == blurVideo
                ? { uri: item?.url }
                : {
                    uri: "https://www.pngall.com/wp-content/uploads/9/White-Play-Silhoutte-PNG-File-Download-Free.png",
                  }
            }
            // source={{
            //   uri: "https://www.pngall.com/wp-content/uploads/9/White-Play-Silhoutte-PNG-File-Download-Free.png",
            // }}
            style={{
              flex: 1,
              width: "100%",
              height: 100,
              marginBottom: 5,
            }}
            resizeMode="contain"
          />
          <Text style={{ color: "light-grey", textAlign: "center" }}>
            {moment(item?.createdAt).format("MMM DD,YYYY")}
          </Text>
        </Pressable>
      ) : (
        <Pressable
          style={{ flexDirection: "column", flex: 1 }}
          onPress={() => {
            if (item.url == blurImage) {
            null;
            } else {
              setmylocaldata({
                attachment: [item.url],
                type: "image",
              });
              setTimeout(() => {
                setmyimages(true);
              }, 500);
            }
          }}
        >
          <Image
            source={{ uri: item.url }}
            style={{
              flex: 1,
              height: 100,
              borderRadius: 5,
              marginBottom: 5,
              width: "100%",
            }}
            resizeMode="cover"
          />
          <Text style={{ color: "light-grey", textAlign: "center" }}>
            {moment(item?.createdAt).format("MMM DD,YYYY")}
          </Text>
        </Pressable>
      )}
    </View>
  );

   // eslint-disable-next-line
  const filesAudioView = ({ item }: any) => (
    <View style={{ width: "30%", height: 120, margin: 5, alignSelf: "center" }}>
      {item.message_type === "document" ? (
        <Pressable
          style={{ flexDirection: "column", flex: 1 }}
          onPress={() =>
            item.localPath && item.localPath.length > 0
              ? handleDocumentPress(item?.localPath)
              : null
          }
        >
          <Image
            source={require("../../Assets/Icons/pdfview.png")}
            style={{ flex: 1, height: 100, marginBottom: 5, width: "100%" }}
            resizeMode="contain"
          />
          <Text style={{ color: "light-grey", textAlign: "center" }}>
            {moment(item?.createdAt).format("MMM DD,YYYY")}
          </Text>
        </Pressable>
      ) : (
        <Pressable
          style={{ flexDirection: "column", flex: 1 }}
          onPress={() => {
            if (item.localPath && item.localPath.length > 0) {
              setmylocaldata({
                attachment: item.localPath,
                type: "audio",
              });
              setTimeout(() => {
                setmyimages(true);
              }, 500);
            }
          }}
        >
          <Image
            source={require("../../Assets/Icons/AudioSideMenu.png")}
            style={{
              flex: 1,
              height: 100,
              borderRadius: 5,
              marginBottom: 5,
              width: "100%",
            }}
            resizeMode="contain"
          />
          <Text style={{ color: "light-grey", textAlign: "center" }}>
            {moment(item?.createdAt).format("MMM DD,YYYY")}
          </Text>
        </Pressable>
      )}
    </View>
  );
  const handleDocumentPress = async (path) => {
    if (Platform.OS == "android") {
      setloaderMoedl(true);
    }
    // Show loader
    const mainDirectory = `${RNFS.DocumentDirectoryPath}/TokeeMedia`;
    const subDirectory = `${mainDirectory}/Documents`;

    try {
      const mainDirectoryExists = await RNFS.exists(mainDirectory);
      if (!mainDirectoryExists) {
        await RNFS.mkdir(mainDirectory);
      }

      const subDirectoryExists = await RNFS.exists(subDirectory);
      if (!subDirectoryExists) {
        await RNFS.mkdir(subDirectory);
      }

      const mediaName = path[0].split("/").pop();
      const mediaId = mediaName.split(".").slice(0, -1).join(".");
      let filename = `${mediaName}`;
      let encoded = encodeURIComponent(filename);
      let destinationPath = `${subDirectory}/${encoded}`;

      const delay = new Promise((resolve) => setTimeout(resolve, 1000));

      let fileExists = await RNFS.exists(destinationPath);
      let counter = 1;
      while (fileExists) {
        filename = `${mediaId}(${counter}).pdf`;
        encoded = encodeURIComponent(filename);
        destinationPath = `${subDirectory}/${encoded}`;
        fileExists = await RNFS.exists(destinationPath);
        counter++;
      }

      await RNFS.copyFile(path[0], destinationPath);

      const fileExistsAfterCopy = await RNFS.exists(destinationPath);
      if (!fileExistsAfterCopy) {
        throw new Error("File not found after copy");
      }

      await Promise.all([delay]);

      FileViewer.open(destinationPath)
        .then(() => {
          console.log("File opened successfully");
        })
        .catch((error) => {
          console.error("Error opening file with FileViewer:", error);
        });
    } catch (error) {
      console.error("Error processing file:", error);
    } finally {
      if (Platform.OS == "android") {
        setloaderMoedl(false);
      }
    }
  };

 

  
 

 

  const pagerAllMediaRef = useRef(null);

   // eslint-disable-next-line
  const onPageSelected = (event:any) => {
    setActiveTab(event.nativeEvent.position);
     // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    pagerAllMediaRef?.current?.setPage(event.nativeEvent.position); 
  };

   // eslint-disable-next-line
  const handleTabPress = (tabIndex:any) => {
    setActiveTab(tabIndex); 
     // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    pagerAllMediaRef?.current?.setPage(tabIndex); 
  };

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          height: "100%",
          width: "100%",
        }}
      >
        <LoaderModel
          visible={loaderMoedl}
          onRequestClose={() => setloaderMoedl(false)}
          cancel={() => setloaderMoedl(false)}
        />

        <Modal
          visible={myimages}
          supportedOrientations={["portrait", "landscape"]}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "#000",
              justifyContent: "center",
            }}
          >
            <TouchableOpacity
              style={{
                left: 10,
                position: "absolute",
                borderRadius: 5,
                zIndex: 1001,
                top: Platform.OS === "ios" ? 60 : 20,
                
                backgroundColor:globalThis.selectTheme === "mongoliaTheme"
                    ? "#8D3E2D" 
                    : globalThis.selectTheme === "newYearTheme"
                    ? "#CE9D59"
                    : 
                    globalThis.selectTheme === "newYear"
                    ? COLORS.black
                    : 
                    globalThis.selectTheme === "christmas"
                    ? COLORS.primary_light_green 
                    : globalThis.selectTheme == "third"
                    ? COLORS.light_green 
                    : globalThis.selectTheme == "second"
                    ? COLORS.primary_blue
                    : COLORS.purple,
                width: 30,
                height: 30,
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={() => {
                setmyimages(false);
              }}
            >
              <Image
                source={require("../../Assets/Icons/Back.png")}
                style={{
                  height: 25,
                  width: 25,
                  tintColor:
                    globalThis.selectTheme == "third"
                      ? COLORS.dark_pink
                      : COLORS.white,
                }}
                resizeMode="contain"
              />
            </TouchableOpacity>

            {mylocaldata && (
              <View>
                {
                   // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                  mylocaldata?.type === "image" ? (
                    <View
                      style={{
                        height: windowHeight,
                        width: windowWidth - 20,
                      }}
                    >
                      <ImageViewer
                        saveToLocalByLongPress={false} 
                         // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                        renderIndicator={() => null}
                        style={{
                          height: windowHeight,
                          width: windowWidth - 20,
                        }} 
                         // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                        imageUrls={mylocaldata?.attachment?.map((url) => ({
                          url,
                        }))}
                        loadingRender={() => (
                          <ActivityIndicator size={"large"} />
                        )}
                      />
                    </View> 
                     // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                  ) : mylocaldata?.type === "video" ? (
                    <View>
                      {isLoading && <ActivityIndicator size="large" />}
                      <Video
                        style={{
                          width: windowWidth,
                          height: 300,
                          padding: 20,
                        }}
                        onLoadStart={() => setIsLoading(true)}
                        onLoad={() => setIsLoading(false)} 
                         // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                        source={{ uri: mylocaldata?.attachment }}
                        resizeMode="contain"
                        controls={true}
                        paused={isPlaying}
                      />
                    </View> 
                     // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                  ) : mylocaldata?.type === "audio" ? (
                    <View
                      style={{
                        height: 64,
                        width: "100%",
                        marginTop: "10%",
                      }}
                    >
                      <View
                        style={{
                          height: 64,
                          width: "95%",
                          alignSelf: "center",
                          backgroundColor: "#fff",
                        }}
                      >
                        
                        <AudioMessage
                         // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                          currentMessage={mylocaldata?.attachment[0]}
                        />
                      </View>
                    </View>
                  ) : null
                }
              </View>
            )}
          </View>
        </Modal>

        <View style={{ flex: 1, backgroundColor: colors.white }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              position: "absolute",
              top: 50,
              width: "100%",
              paddingHorizontal: 10,
              zIndex: 999,
            }}
          >
            <TouchableOpacity
              onPress={() => navigation.pop()}
              style={{
                justifyContent: "center",
                alignItems: "center",
                height: 40,
                left: 10,
                position: "absolute",
              }}
            >
              <Image
                source={require("../../Assets/Icons/Cross.png")}
                style={{ height: 22, width: 22, tintColor: colors.black }}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                justifyContent: "center",
                alignItems: "center",
                height: 40,
                alignSelf: "flex-start",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  textAlign: "center",
                  color: colors.black,
                }}
              >
                All Media
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }}>
            <View style={styles.tabButtons}>
              <TouchableOpacity
                style={[styles.tabButton, activeTab == 0 && styles.activeTab]}
                onPress={() => handleTabPress(0)}
              >
                <Text
                  style={{
                    color: colors.black,
                    fontSize: activeTab === 0 ? 15 : 13,
                  }}
                >
                  Photos/Videos
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabButton, activeTab == 1 && styles.activeTab]}
                onPress={() => handleTabPress(1)}
              >
                <Text
                  style={{
                    color: colors.black,
                    fontSize: activeTab === 1 ? 15 : 13,
                  }}
                >
                  Files
                </Text>
              </TouchableOpacity>
            </View>
            <PagerView
              style={{ flex: 1 }}
              initialPage={activeTab}
              onPageSelected={onPageSelected}
              ref={pagerAllMediaRef}
              useNext={false}
            >
              <View
               key="photos"
                style={{
                  width: "100%",
                  height: "100%",
                  marginTop: 145,
                  paddingHorizontal: 10,
                }}
              >
                {imageUrls.length === 0 ? (
                  <View
                    style={{
                      flex: 1,
                      width: "100%",
                      marginTop: "50%",
                      alignItems: "center",
                    }}
                  >
                    <Image
                      source={require("../../Assets/Icons/no_photos_video.png")}
                      style={{
                        height: 90,
                        marginBottom: 15,
                        width: 150,
                        backgroundColor: "transparent",
                        tintColor: iconTheme().iconColorNew,
                      }}
                      resizeMode="contain"
                    />
                    <Text style={{ color: colors.black }}>
                      No Photos/Video found!
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    showsHorizontalScrollIndicator={false}
                    data={imageUrls}
                     // eslint-disable-next-line
                    keyExtractor={(item: any) => item.id}
                    renderItem={photoAndVideoView}
                    numColumns={3} // Adjust to show three items per row
                    contentContainerStyle={{ paddingBottom: 200 }}
                  />
                )}
              </View>

              <View
                style={{
                  width: "100%",
                  height: "100%",
                  marginTop: 145,
                  paddingHorizontal: 10,
                }}
               key="files"
              >
                {filesUrls.length === 0 ? (
                  <View
                    style={{
                      flex: 1,
                      width: "100%",
                      marginTop: "50%",
                      alignItems: "center",
                    }}
                  >
                    <Image
                      source={require("../../Assets/Icons/no_files_found.png")}
                      style={{
                        height: 100,
                        marginBottom: 5,
                        width: 150,
                        tintColor: iconTheme().iconColorNew,
                      }}
                      resizeMode="contain"
                    />
                    <Text style={{ color: colors.black }}>
                      {" "}
                      No Files found!
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    showsHorizontalScrollIndicator={false}
                    data={filesUrls}
                     // eslint-disable-next-line
                    keyExtractor={(item: any) => item.id}
                    renderItem={filesAudioView}
                    numColumns={3} // Adjust to show three items per row
                    contentContainerStyle={{ paddingBottom: 200 }}
                  />
                )}
              </View>
            </PagerView>
          </View>
  
        </View>
      </View>
    </View>
  );
}
