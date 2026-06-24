import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CategoriesScreen } from './screens/CategoriesScreen';
import { SubcategoriesScreen } from './screens/SubcategoriesScreen';
import { FlashcardSetsScreen } from './screens/FlashcardSetsScreen';
import { SetDetailScreen } from './screens/SetDetailScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Categories" component={CategoriesScreen} />
          <Stack.Screen name="Subcategories" component={SubcategoriesScreen} />
          <Stack.Screen name="FlashcardSets" component={FlashcardSetsScreen} />
          <Stack.Screen name="SetDetail" component={SetDetailScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
