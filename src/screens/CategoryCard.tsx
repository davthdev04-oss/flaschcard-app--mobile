import React from "react";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Category } from "../types/flashcard";

type Props = {
  category: Category;
  subcategoryCount: number;
  flashcardCount: number;
  onPress: () => void;
  onEdit: () => void;
};

export default function CategoryCard({
  category,
  subcategoryCount,
  flashcardCount,
  onPress,
  onEdit,
}: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Ionicons
        style={styles.menuIcon}
        name="ellipsis-vertical"
        size={22}
        color="#666"
        onPress={onEdit}
      />

      <View style={styles.middle}>
        <Ionicons
          name="radio-button-off"
          size={40}
          color="#BDBDBD"
        />

        <Text style={styles.title}>
          {category.name}
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.info}>
          <Ionicons
            name="folder-outline"
            size={16}
            color="#666"
          />
          <Text style={styles.count}>
            {subcategoryCount}
          </Text>
        </View>

        <View style={styles.info}>
          <Ionicons
            name="document-text-outline"
            size={16}
            color="#666"
          />
          <Text style={styles.count}>
            {flashcardCount}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48.5%",
    aspectRatio: 1.05,

    backgroundColor: "#fff",

    borderRadius: 24,

    padding: 16,

    marginBottom: 10,

    justifyContent: "space-between",

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },

  menuIcon: {
    position: "absolute",
    top: 14,
    right: 14
  },

  middle: {
    marginTop: 18,
    gap: 8,
  },

  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop:8,
  },

  info: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  count: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
});