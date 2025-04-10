import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

const RenderTextWithMentions = ({ processedText, onMentionPress }) => {
  return (
    <Text>
      {processedText.map((part, index) => {
        if (part.type === 'mention') {
          return (
            <TouchableOpacity key={index} onPress={() => onMentionPress(part.id)}>
              <Text style={{ color: 'blue' }}>{part.text}</Text>
            </TouchableOpacity>
          );
        }
        return <Text key={index}>{part.text}</Text>;
      })}
    </Text>
  );
};

export default RenderTextWithMentions;
