import { Stack } from "expo-router";

export default function FeaturesLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="index"
                options={{ title: "Share", headerShown: false }}
            />
        </Stack>
    );
}
