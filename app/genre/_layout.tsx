import { Stack } from 'expo-router';

export default function GenreLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ title: 'AI Genre', headerShown: false }} />
        </Stack>
    );
}
