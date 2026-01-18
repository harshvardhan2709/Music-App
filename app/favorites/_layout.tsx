// app/favorites/_layout.tsx

import { Stack, usePathname } from 'expo-router';
import React from "react";

export default function TabsLayout() {
    const pathname = usePathname();
    return (
        <Stack screenOptions={{ animation: pathname.startsWith("/favorites") ? "default" : "none", }}>
            <Stack.Screen name="index" options={{ title: "Favorites", headerShown: false }} />
        </Stack>
    );
}
