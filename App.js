import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Button, Linking, Text, View} from 'react-native';
import branch from 'react-native-branch';

function HomeScreen({navigation}) {
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Home Screen</Text>
      <Button
        title="Go to Details"
        onPress={() => navigation.navigate('Details')}
      />
    </View>
  );
}

function DetailsScreen({navigation}) {
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Details Screen</Text>
      <Button
        title="Go to Details... again"
        onPress={() => navigation.navigate('Details')}
      />
      <Button title="Go to Home" onPress={() => navigation.navigate('Home')} />
      <Button title="Go back" onPress={() => navigation.goBack()} />
      <Button
        title="Go back to first screen in stack"
        onPress={() => navigation.popToTop()}
      />
    </View>
  );
}

const Stack = createNativeStackNavigator();

function App() {
  const linking = {
    prefixes: ['/'],

    // Custom function to get the URL which was used to open the app
    async getInitialURL() {
      const url = await Linking.getInitialURL();

      return url;
    },

    // Custom function to subscribe to incoming links
    subscribe(listener) {
      // Listen to incoming links from Firebase Dynamic Links
      const unsubscribeBranch = branch.subscribe({
        onOpenStart: ({uri, cachedInitialEvent}) => {
          console.log(
            '[branch.io] subscribe onOpenStart, will open ' +
              uri +
              ' cachedInitialEvent is ' +
              cachedInitialEvent,
          );
        },
        onOpenComplete: ({error, params, uri}) => {
          if (error) {
            console.error(
              '[branch.io] subscribe onOpenComplete, Error from opening uri: ' +
                uri +
                ' error: ' +
                error,
            );
            return;
          } else if (params) {
            if (!params['+clicked_branch_link']) {
              if (params['+non_branch_link']) {
                console.log('[branch.io] non_branch_link: ' + uri);
                return;
              }
            } else {
              console.log(
                `[branch.io] effect subscribe: ${JSON.stringify(params)}`,
              );
              return;
            }
          }
        },
      });

      // Listen to incoming links from deep linking
      const linkingSubscription = Linking.addEventListener('url', ({url}) => {
        listener(url);
      });

      return () => {
        // Clean up the event listeners
        unsubscribeBranch();
        linkingSubscription.remove();
      };
    },

    config: {
      // Deep link configuration
    },
  };

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
