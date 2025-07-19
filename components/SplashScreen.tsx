import { Image, View } from 'react-native';

export default function SplashScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <Image
        alt='splash image'
        source={require('../../assets/images/splash.png')}
        style={{ flex: 1, width: '100%', resizeMode: 'contain' }}
      />
    </View>
  );
}