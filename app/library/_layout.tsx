// app/library/_layout.tsx

import { Stack, usePathname } from "expo-router";
import React from "react";

export default function TabsLayout() {
    const pathname = usePathname();
    return (
        <Stack
            screenOptions={{
                animation: "slide_from_right",
            }}
        >
            <Stack.Screen
                name="index"
                options={{ title: "My Library", headerShown: false }}
            />
            <Stack.Screen name="liked-songs" options={{ title: "Favorites", headerShown: false }} />
            <Stack.Screen name="[id]" options={{ headerShown: false }} />
        </Stack>
    );
}
