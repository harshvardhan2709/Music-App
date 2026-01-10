

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function FavoritesScreen() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={styles.Text}>Favorites</Text>
        </View>
    );
}
const styles =  StyleSheet.create ({
    Text: {
        fontSize: 20,
        color: '#000000',
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 20,
    },
});
