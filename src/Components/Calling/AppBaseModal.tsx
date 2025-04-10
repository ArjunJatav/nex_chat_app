import React, {Component} from 'react';
import {
  Modal,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  View,
  Pressable,
} from 'react-native';
import { colors } from '../../utils/constants/colors';


export class AppBaseModal extends Component<Readonly<AppBaseModalProps>, {}> {
  constructor(props: Readonly<AppBaseModalProps>) {
    super(props);
  }

  render() {
    return (
      <Modal
        animated
        animationType={this.props.animationType || 'fade'}
        visible={this.props.visible}
        transparent
      
        onRequestClose={() => this.props?.onDismiss()}>

        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            if (this.props.enableTapOutside) {
              this.props?.onDismiss();
            }
          }}
          style={[styles.backgroundOverlay, this.props.backgroundOverlay]}>
          <Pressable
            style={[styles.container, this.props.containerStyle]}
            onPress={() => {}}>
            {this.props?.showStrip && (
              <View style={[styles.stripStyle, this.props?.stripStyle]} />
            )}
           {    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
           this.props.children}
          </Pressable>
        </TouchableOpacity>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 6,
  },
  backgroundOverlay: {
    flex: 1,
    backgroundColor: colors.modal_background,
    justifyContent: 'center',
  },
  stripStyle: {
    width: 72,
    height: 6,
    backgroundColor: colors.tabs_background_color,
    alignSelf: 'center',
    marginTop: 10,
    borderRadius: 12,
  },
});

interface AppBaseModalProps {
  onDismiss?: Function | any;
  visible: boolean;
  containerStyle?: ViewStyle | any[];
  backgroundOverlay?: ViewStyle;
  stripStyle?: ViewStyle;
  enableTapOutside?: boolean;
  showStrip?: boolean;
  animationType?: 'none' | 'fade' | 'slide' | undefined;
}
