import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

type Props = {
  title: string;
  onPress: () => void;
};

export default function PrimaryButton({
  title,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      style={styles.button}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 46,
    minWidth: 82,

    paddingHorizontal: 20,

    borderRadius: 14,

    backgroundColor: "#4F7DF3",

    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },

  text: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});