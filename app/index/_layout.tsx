// app/index/_layout.tsx

import { Stack, usePathname } from 'expo-router';
import React from "react";

export default function TabsLayout() {
    const pathname = usePathname();
    console.log("Current path:", pathname);
    return (
        <Stack screenOptions={{ animation: pathname.startsWith("/index") ? "default" : "none", }}>
            <Stack.Screen name="index" options={{ title: "Queue" }} />
        </Stack>
    );
}
