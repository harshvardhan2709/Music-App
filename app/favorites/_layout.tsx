import { Stack, usePathname } from 'expo-router';
import React from "react";

export default function TabsLayout() {
    const pathname = usePathname();
    console.log("Current path:", pathname);
    return (
        <Stack screenOptions={{ animation: pathname.startsWith("/favorites") ? "default" : "none", }}>
            <Stack.Screen name="index" options={{ title: "Favorites" }} />
            <Stack.Screen name="nested" options={{ title: "Feel-good-songs" }} />
        </Stack>
    );
}
