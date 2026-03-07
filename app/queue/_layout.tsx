// app/queue/_layout.tsx

import { Stack, usePathname } from 'expo-router';
import React from "react";

export default function QueueLayout() {
    const pathname = usePathname();
    return (
        <Stack screenOptions={{ animation: pathname.startsWith("/queue") ? "default" : "none", }}>
            <Stack.Screen name="index" options={{ title: "Queue", headerShown: false }} />
        </Stack>
    );
}
