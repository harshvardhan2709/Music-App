// app/index/_layout.tsx

import { Stack, usePathname } from 'expo-router';
import React from "react";

export default function TabsLayout() {
    const pathname = usePathname();
    console.log("Current path:", pathname);
    return (
        <Stack screenOptions={{ animation: "slide_from_right" }}>
            <Stack.Screen name="index" options={{ title: "Home", headerShown: false }} />
            <Stack.Screen name="current-queue" options={{ title: "Queue", headerShown: false }} />
        </Stack>
    );
}
