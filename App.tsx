import { StatusBar } from 'expo-status-bar';
import './global.css';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts, Cinzel_400Regular, Cinzel_700Bold, Cinzel_900Black } from '@expo-google-fonts/cinzel';
import InitialScreen from './screens/Initial';
import LoginScreen from './screens/Login';
import Tabs from './navigation/Tabs';
import QuizScreen from './screens/Quiz';
import Loading from './screens/Loading';
import Profile from './screens/Profile';
import Classes from './screens/Classes';
import SelectHabits from './screens/SelectHabits';
import { UserProvider, useUser } from './context/userProvider';
import Pricing from './screens/Pricing';
import { HabitsProvider } from './context/HabitsProvider';
import Meditation from './screens/Meditation';
import { useEffect } from 'react';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { Platform } from 'react-native';
import CreateHabitScreen from './screens/create-habit';
import EditHabitScreen from './screens/edit-habit';
import SettingsScreen from './screens/Settings';
import ArenasScreen from './screens/Arenas';

const Stack = createNativeStackNavigator();

// Component to handle OAuth redirects
function AppContent() {
  return (
    <NavigationContainer
      linking={{
        prefixes: ['piru://', 'https://piru.app'],
        config: {
          screens: {
            Initial: '',
            Login: 'Login',
            Quiz: 'Quiz',
            Tabs: 'Home',
            Classes: 'Classes',
            Profile: 'Profile',
            SelectHabits: 'SelectHabits',
            Pricing: 'Pricing',
            Meditation: 'Meditation',
            Arenas: 'Arenas',
          },
        },
      }}
    >
      <StatusBar style="auto" />
      <Stack.Navigator initialRouteName="Initial" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Initial" component={InitialScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="Quiz" component={QuizScreen} />
        <Stack.Screen name="Loading" component={Loading} />
        <Stack.Screen name="Classes" component={Classes} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="SelectHabits" component={SelectHabits} />
        <Stack.Screen name="Pricing" component={Pricing} />
        <Stack.Screen name="Meditation" component={Meditation} />
        <Stack.Screen name="CreateHabit" component={CreateHabitScreen} />
        <Stack.Screen name="EditHabit" component={EditHabitScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Arenas" component={ArenasScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Cinzel_400Regular,
    Cinzel_700Bold,
    Cinzel_900Black,
  });

  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

    if (Platform.OS === 'android') {
       Purchases.configure({apiKey: process.env.EXPO_PUBLIC_ANDROID_API_KEY});
    }
    getCustomerInfo();
  }, []);

  async function getCustomerInfo() {
    const customerInfo = await Purchases.getCustomerInfo();
    console.log("Customer Info",JSON.stringify(customerInfo,null,2));
  }

  if (!fontsLoaded) return null;

  return (
    <UserProvider>  
      <HabitsProvider>
        <AppContent />
      </HabitsProvider>
    </UserProvider>
  );
}