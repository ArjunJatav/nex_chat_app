// MentionList.js
import React from 'react';
import { FlatList, KeyboardAvoidingView, View, TouchableOpacity, Image, Text, StyleSheet } from 'react-native';

const MentionList = ({ filteredFriends, handleFriendPress }) => {
  const renderItem = ({ item }) => {
    if (!item) return null; // Skip rendering if item is undefined

    return (
      <TouchableOpacity
        key={item.chat_user_id?.toString()}
        style={styles.friendContainer}
        onPress={() => handleFriendPress(item)}
      >
        <Image
          source={{ uri: item.profile_image }}
          style={styles.profileImage}
        />
        <Text style={styles.friendText}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    filteredFriends?.length > 0 && (
      <View
        // behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.mentionContainer}
      >
        <FlatList
          data={filteredFriends}
          renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item) => item.chat_user_id}
        />
      </View>
    )
  );
};

const styles = StyleSheet.create({
  friendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#0C0C0C',

  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  friendText: {
    fontSize: 16,
    color: '#fff',
   // textAlign:'center'
  },
  mentionContainer: {
    height: 300,
    width: 270,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
   
  },
});

export default MentionList;
