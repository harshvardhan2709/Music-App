import { Stack, usePathname } from 'expo-router';
import React from "react";

export default function TabsLayout() {
    const pathname = usePathname();
    console.log("Current path:", pathname);
    return (
        <Stack screenOptions={{ animation: pathname.startsWith("/library") ? "default" : "none", }}>
            <Stack.Screen name="index" options={{ title: "Library" }} />
            <Stack.Screen name="nested" options={{ title: "Feel-good-songs" }} />
        </Stack>
    );
}
