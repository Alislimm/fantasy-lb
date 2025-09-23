import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Auto navigate to login after 3 seconds
    const timer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.imageContainer}>
        <Image 
          source={require('../../assets/images/splash_screen.png')} 
          style={styles.splashImage}
          resizeMode="contain"
          onError={(error) => console.log('Splash screen image failed to load:', error)}
          onLoad={() => console.log('Splash screen image loaded successfully')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // White background
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  splashImage: {
    width: 350,
    height: 350,
    maxWidth: width * 0.85,
    maxHeight: height * 0.7,
  },
});
