import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { ToastProps } from "../types/types";

export default function Toast({
  isOpen,
  message,
  onClose,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [isOpen, onClose, duration]);

  if (!isOpen) return null;

  return (
    <View style={styles.toast}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",

    backgroundColor: "#333",

    paddingHorizontal: 20,
    paddingVertical: 12,

    borderRadius: 10,

    zIndex: 999,
    elevation: 8,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  text: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});