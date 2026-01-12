// app/library/_layout.tsx

import { Stack, usePathname } from 'expo-router';
import React from "react";

export default function TabsLayout() {
    const pathname = usePathname();
    return (
        <Stack screenOptions={{ animation: pathname.startsWith("/library") ? "default" : "none", }}>
            <Stack.Screen name="index" options={{ title: "My Library" }} />
            <Stack.Screen name="[id]" options={{ headerShown: false }} />
            <Stack.Screen name="nested" options={{ title: "Feel-good-songs" }} />
        </Stack>
    );
}
