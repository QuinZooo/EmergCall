import * as React from 'react';
import { View, Image } from 'react-native';
import styles from '../styles/commonStyles';

const Header = () => (
  <View style={styles.headerDark}>
    <Image 
      source={require('../../project-assets/emergcall_logo.png')} 
      style={styles.logoSmall} 
      resizeMode="contain" 
    />
  </View>
);

export default Header;
